import { db } from "../../helpers/db";
import { schema } from "./register_with_password_POST.schema";
import { randomBytes } from "crypto";
import {
  setServerSession,
  SessionExpirationSeconds,
} from "../../helpers/getSetServerSession";
import { generatePasswordHash } from "../../helpers/generatePasswordHash";
import { User } from "../../helpers/User";
import { Selectable } from "kysely";
import { Users } from "../../helpers/schema";

export async function handle(request: Request) {
  try {
    const json = await request.json();
    const { businessName, ownerName, contactNumber, businessType, pin, address, pinCode, gstNumber, referralCode, enabledModules } =
      schema.parse(json);

    // Check if contactNumber already exists
    const existingUser = await db
      .selectFrom("users")
      .select("id")
      .where("contactNumber", "=", contactNumber)
      .limit(1)
      .executeTakeFirst();

    if (existingUser) {
      return new Response(
        JSON.stringify({ message: "Contact number already in use" }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let referredByUserId: number | null = null;
    if (referralCode) {
      const referrer = await db
        .selectFrom("users")
        .select("id")
        .where("referralCode", "=", referralCode)
        .executeTakeFirst();
      
      if (referrer) {
        referredByUserId = referrer.id;
      } else {
        // Optional: decide if an invalid referral code should block registration.
        // For a non-intrusive system, we'll allow it but log it.
        console.warn(`Invalid referral code used during registration: ${referralCode}`);
      }
    }

    const passwordHash = await generatePasswordHash(pin);

    // Create new user
    const newUser = await db.transaction().execute(async (trx) => {
      // Insert the user
      const insertedUser = await trx
        .insertInto("users")
        .values({
          businessName,
          ownerName,
          contactNumber,
          businessType,
          displayName: businessName,
          email: null,
          role: "user",
          address: address ?? null,
          pinCode: pinCode ?? null,
          gstNumber: gstNumber ?? null,
          referredByUserId: referredByUserId,
          enabledModules: enabledModules && enabledModules.length > 0 ? enabledModules : ['dashboard', 'customer_record'],
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      // Store the password hash in another table
      await trx
        .insertInto("userPasswords")
        .values({
          userId: insertedUser.id,
          passwordHash,
        })
        .execute();

      // Generate and set the user's own referral code
      const newUserReferralCode = `REF${String(insertedUser.id).padStart(6, '0')}`;
      const updatedUser = await trx
        .updateTable("users")
        .set({ referralCode: newUserReferralCode })
        .where("id", "=", insertedUser.id)
        .returningAll()
        .executeTakeFirstOrThrow();

      return updatedUser;
    });

    // Create a new session
    const sessionId = randomBytes(32).toString("hex");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SessionExpirationSeconds * 1000);

    await db
      .insertInto("sessions")
      .values({
        id: sessionId,
        userId: newUser.id,
        createdAt: now,
        lastAccessed: now,
        expiresAt,
      })
      .execute();

    // Create response with user data
    const userData: User = {
      id: newUser.id,
      businessName: newUser.businessName,
      ownerName: newUser.ownerName,
      contactNumber: newUser.contactNumber,
      businessType: newUser.businessType,
      displayName: newUser.displayName,
      avatarUrl: newUser.avatarUrl,
      email: newUser.email,
      role: newUser.role as "admin" | "user",
      address: newUser.address,
      pinCode: newUser.pinCode,
      gstNumber: newUser.gstNumber,
      referralCode: newUser.referralCode,
      referredByUserId: newUser.referredByUserId,
      isActive: newUser.isActive,
      subscriptionStatus: newUser.subscriptionStatus,
      subscriptionStartDate: newUser.subscriptionStartDate,
      subscriptionEndDate: newUser.subscriptionEndDate,
      subscriptionPlanMonths: newUser.subscriptionPlanMonths,
      lastPaymentAmount: newUser.lastPaymentAmount,
      lastPaymentDate: newUser.lastPaymentDate,
      enabledModules: newUser.enabledModules ?? ['dashboard', 'customer_record'],
      userType: 'main_user',
      parentUserId: null,
      subuserId: null,
    };

    const response = new Response(JSON.stringify({ user: userData }), {
      headers: { 'Content-Type': 'application/json' }
    });

    // Set session cookie
    await setServerSession(response, {
      id: sessionId,
      createdAt: now.getTime(),
      lastAccessed: now.getTime(),
    });

    return response;
  } catch (error: unknown) {
    console.error("Registration error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Registration failed";
    return new Response(JSON.stringify({ message: errorMessage }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}