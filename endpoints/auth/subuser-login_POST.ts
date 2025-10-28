import { db } from "../../helpers/db";
import { schema, OutputType } from "./subuser-login_POST.schema";
import { compare } from "bcryptjs";
import { randomBytes } from "crypto";
import { setServerSession, SessionExpirationSeconds } from "../../helpers/getSetServerSession";
import { User } from "../../helpers/User";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const { username, password } = schema.parse(json);

    const subuserResult = await db
      .selectFrom("subusers")
      .innerJoin("users", "subusers.parentUserId", "users.id")
      .selectAll("subusers")
      .select([
        "users.id as parentId",
        "users.businessName",
        "users.ownerName as parentOwnerName",
        "users.contactNumber",
        "users.businessType",
        "users.email",
        "users.avatarUrl",
        "users.role as parentRole",
        "users.address",
        "users.pinCode",
        "users.gstNumber",
        "users.referralCode",
        "users.referredByUserId",
        "users.isActive as parentIsActive",
        "users.subscriptionStatus",
        "users.subscriptionStartDate",
        "users.subscriptionEndDate",
        "users.subscriptionPlanMonths",
        "users.lastPaymentAmount",
        "users.lastPaymentDate",
        "users.enabledModules",
      ])
      .where("subusers.username", "=", username)
      .executeTakeFirst();

    if (!subuserResult) {
      return new Response(superjson.stringify({ error: "Invalid username or password" }), { status: 401 });
    }

    if (!subuserResult.isActive) {
      return new Response(superjson.stringify({ error: "This subuser account is inactive." }), { status: 403 });
    }
    
    if (!subuserResult.parentIsActive) {
        return new Response(superjson.stringify({ error: "The main account is inactive." }), { status: 403 });
    }

    const passwordValid = await compare(password, subuserResult.passwordHash);
    if (!passwordValid) {
      return new Response(superjson.stringify({ error: "Invalid username or password" }), { status: 401 });
    }

    // Create a new session
    const sessionId = randomBytes(32).toString("hex");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SessionExpirationSeconds * 1000);

    await db
      .insertInto("sessions")
      .values({
        id: sessionId,
        userId: subuserResult.parentUserId, // Session is tied to the main user ID
        subuserId: subuserResult.id, // Track which subuser is logged in
        createdAt: now,
        lastAccessed: now,
        expiresAt,
      })
      .execute();

    const userData: User = {
      id: subuserResult.parentUserId,
      businessName: subuserResult.businessName,
      ownerName: subuserResult.parentOwnerName,
      contactNumber: subuserResult.contactNumber,
      businessType: subuserResult.businessType,
      displayName: subuserResult.name, // Subuser's name as display name
      avatarUrl: subuserResult.avatarUrl,
      role: "user", // Subusers always have 'user' role
      email: subuserResult.email,
      address: subuserResult.address,
      pinCode: subuserResult.pinCode,
      gstNumber: subuserResult.gstNumber,
      referralCode: subuserResult.referralCode,
      referredByUserId: subuserResult.referredByUserId,
      isActive: subuserResult.isActive,
      subscriptionStatus: subuserResult.subscriptionStatus,
      subscriptionStartDate: subuserResult.subscriptionStartDate,
      subscriptionEndDate: subuserResult.subscriptionEndDate,
      subscriptionPlanMonths: subuserResult.subscriptionPlanMonths,
      lastPaymentAmount: subuserResult.lastPaymentAmount,
      lastPaymentDate: subuserResult.lastPaymentDate,
      enabledModules: subuserResult.enabledModules ?? ['dashboard', 'customer_record'],
      userType: 'subuser',
      parentUserId: subuserResult.parentUserId,
      subuserId: subuserResult.id,
    };

    const response = new Response(superjson.stringify({ user: userData } satisfies OutputType));

    await setServerSession(response, {
      id: sessionId,
      createdAt: now.getTime(),
      lastAccessed: now.getTime(),
    });

    return response;
  } catch (error) {
    console.error("Subuser login failed:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: 400 });
  }
}