// adapt this to your database schema
import { db } from "../../helpers/db";
import { sql } from "kysely";
import { schema } from "./login_with_password_POST.schema";
import { compare } from "bcryptjs";
import { randomBytes } from "crypto";
import {
  setServerSession,
  SessionExpirationSeconds,
} from "../../helpers/getSetServerSession";
import { User } from "../../helpers/User";

// Configuration constants
const RATE_LIMIT_CONFIG = {
  maxFailedAttempts: 5,
  lockoutWindowMinutes: 15,
  lockoutDurationMinutes: 15,
  cleanupProbability: 0.1,
} as const;

// Helper function to safely convert union type to Date
function safeToDate(
  value: string | number | bigint | null | undefined
): Date | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "bigint") {
    // Convert bigint to number (assuming it's a timestamp in milliseconds)
    return new Date(Number(value));
  }

  return new Date(value);
}

export async function handle(request: Request) {
  try {
    const json = await request.json();
    const { contactNumber, pin } = schema.parse(json);

    const now = new Date();
    const windowStart = new Date(
      now.getTime() - RATE_LIMIT_CONFIG.lockoutWindowMinutes * 60 * 1000
    );

    // Start transaction for atomic rate limiting and session creation
    const result = await db.transaction().execute(async (trx) => {
      // Use PostgreSQL advisory lock to serialize access per contactNumber
      // This prevents concurrent processing of the same contact number
      // The lock is automatically released when the transaction ends
      await sql`SELECT pg_advisory_xact_lock(hashtextextended(${contactNumber},0))`.execute(
        trx
      );

      // Get rate limiting info efficiently - use COUNT and MAX instead of SELECT *
      const rateLimitQuery = await trx
        .selectFrom("loginAttempts")
        .select([
          trx.fn.countAll<number>().as("failedCount"),
          trx.fn.max(trx.dynamic.ref("attemptedAt")).as("lastFailedAt"),
        ])
        .where("contactNumber", "=", contactNumber)
        .where("success", "=", false)
        .where("attemptedAt", ">=", windowStart)
        .where("attemptedAt", "is not", null) // Ensure null safety
        .executeTakeFirst();

      const { failedCount = 0, lastFailedAt = null } = rateLimitQuery || {};
      const safeLastFailedAt = safeToDate(lastFailedAt);

      // Check if user is locked out
      if (
        rateLimitQuery &&
        failedCount >= RATE_LIMIT_CONFIG.maxFailedAttempts &&
        safeLastFailedAt
      ) {
        const lockoutEnd = new Date(
          safeLastFailedAt.getTime() +
            RATE_LIMIT_CONFIG.lockoutDurationMinutes * 60 * 1000
        );

        if (now < lockoutEnd) {
          const remainingMinutes = Math.ceil(
            (lockoutEnd.getTime() - now.getTime()) / (60 * 1000)
          );
          // DO NOT log blocked attempts to prevent extending lockout indefinitely
          return {
            type: "rate_limited" as const,
            remainingMinutes,
          };
        }
      }

      // Find user by contactNumber
      const userResults = await trx
        .selectFrom("users")
        .innerJoin("userPasswords", "users.id", "userPasswords.userId")
        .select([
          "users.id",
          "users.businessName",
          "users.ownerName",
          "users.contactNumber",
          "users.businessType",
          "users.email",
          "users.displayName",
          "users.avatarUrl",
          "users.role",
          "users.address",
          "users.pinCode",
          "users.gstNumber",
          "users.referralCode",
          "users.referredByUserId",
          "users.isActive",
          "users.subscriptionStatus",
          "users.subscriptionStartDate",
          "users.subscriptionEndDate",
          "users.subscriptionPlanMonths",
          "users.lastPaymentAmount",
          "users.lastPaymentDate",
          "users.enabledModules",
          "userPasswords.passwordHash",
        ])
        .where("users.contactNumber", "=", contactNumber)
        .limit(1)
        .execute();

      if (userResults.length === 0) {
        // Log failed attempt for non-existent user
        await trx
          .insertInto("loginAttempts")
          .values({
            contactNumber: contactNumber,
            attemptedAt: now,
            success: false,
          })
          .execute();

        return {
          type: "auth_failed" as const,
        };
      }

      const user = userResults[0];

      // Verify PIN
      const pinValid = await compare(pin, user.passwordHash);
      if (!pinValid) {
        // Log failed attempt for invalid PIN
        await trx
          .insertInto("loginAttempts")
          .values({
            contactNumber: contactNumber,
            attemptedAt: now,
            success: false,
          })
          .execute();

        return {
          type: "auth_failed" as const,
        };
      }

      // PIN is valid - log successful attempt
      await trx
        .insertInto("loginAttempts")
        .values({
          contactNumber: contactNumber,
          attemptedAt: now,
          success: true,
        })
        .execute();

      // Create session inside the same transaction to ensure atomicity
      const sessionId = randomBytes(32).toString("hex");
      const expiresAt = new Date(
        now.getTime() + SessionExpirationSeconds * 1000
      );

      await trx
        .insertInto("sessions")
        .values({
          id: sessionId,
          userId: user.id,
          createdAt: now,
          lastAccessed: now,
          expiresAt: expiresAt,
        })
        .execute();

      // Reset failed attempts counter by deleting previous failed attempts
      // This preserves audit trail of successful logins
      await trx
        .deleteFrom("loginAttempts")
        .where("contactNumber", "=", contactNumber)
        .where("success", "=", false)
        .execute();

      return {
        type: "success" as const,
        user,
        sessionId,
        sessionCreatedAt: now,
      };
    });

    // Clean up old login attempts periodically
    // Run cleanup outside transaction to prevent extending transaction time and potential deadlocks
    if (Math.random() < RATE_LIMIT_CONFIG.cleanupProbability) {
      const cleanupBefore = new Date(
        now.getTime() - RATE_LIMIT_CONFIG.lockoutWindowMinutes * 60 * 1000
      );
      try {
        const deleteResult = await db
          .deleteFrom("loginAttempts")
          .where("attemptedAt", "<", cleanupBefore)
          .where("attemptedAt", "is not", null)
          .executeTakeFirst();
      } catch {
        // Don't fail the login if cleanup fails
      }
    }

    // Handle different transaction results
    if (result.type === "rate_limited") {
      return Response.json(
        {
          message: `Too many failed login attempts. Account locked for ${result.remainingMinutes} more minutes.`,
        },
        { status: 429 }
      );
    }

    if (result.type === "auth_failed") {
      return Response.json(
        { message: "Invalid contact number or PIN" },
        { status: 401 }
      );
    }

    // Success case - session was already created in transaction
    const user = result.user;

    // Create response with user data (excluding sensitive information)
    const userData: User = {
      id: user.id,
      businessName: user.businessName,
      ownerName: user.ownerName,
      contactNumber: user.contactNumber,
      businessType: user.businessType,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: user.role as "admin" | "user",
      address: user.address,
      pinCode: user.pinCode,
      gstNumber: user.gstNumber,
      referralCode: user.referralCode,
      referredByUserId: user.referredByUserId,
      isActive: user.isActive,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
      subscriptionPlanMonths: user.subscriptionPlanMonths,
      lastPaymentAmount: user.lastPaymentAmount,
      lastPaymentDate: user.lastPaymentDate,
      enabledModules: user.enabledModules ?? ['dashboard', 'customer_record'],
      userType: 'main_user',
      parentUserId: null,
      subuserId: null,
    };

    const response = Response.json({
      user: userData,
    });

    // Set session cookie
    await setServerSession(response, {
      id: result.sessionId,
      createdAt: result.sessionCreatedAt.getTime(),
      lastAccessed: result.sessionCreatedAt.getTime(),
    });

    return response;
  } catch (error) {
    // Log detailed error information for debugging
    console.error("Login authentication failed with error:", error);
    
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack trace:", error.stack);
      console.error("Error name:", error.name);
    } else {
      console.error("Non-Error object thrown:", JSON.stringify(error, null, 2));
    }
    
    // Return generic error response to client (don't expose internal details)
    return Response.json({ message: "Authentication failed" }, { status: 400 });
  }
}