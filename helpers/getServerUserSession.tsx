import { db } from "./db";
import { User } from "./User";
import type { Kysely } from "kysely";
import type { DB } from "./schema";

import {
  CleanupProbability,
  getServerSessionOrThrow,
  NotAuthenticatedError,
  SessionExpirationSeconds,
} from "./getSetServerSession";

const checkAndDisableExpiredSubscription = async (user: User, database: Kysely<DB>) => {
  // Check if user has active subscription that has expired
  if (
    user.subscriptionStatus === 'active' && 
    user.subscriptionEndDate && 
    new Date(user.subscriptionEndDate) < new Date()
  ) {
    // Subscription expired - disable user and update status
    await database
      .updateTable('users')
      .set({
        isActive: false,
        subscriptionStatus: 'expired',
      })
      .where('id', '=', user.id)
      .execute();
    
    // Update user object
    user.isActive = false;
    user.subscriptionStatus = 'expired';
  }
  
  return user;
};

export async function getServerUserSession(request: Request) {
  const session = await getServerSessionOrThrow(request);

  // Occasionally clean up expired sessions
  if (Math.random() < CleanupProbability) {
    const expirationDate = new Date(
      Date.now() - SessionExpirationSeconds * 1000
    );
    try {
      await db
        .deleteFrom("sessions")
        .where("lastAccessed", "<", expirationDate)
        .execute();
    } catch (cleanupError) {
      // Log but don't fail the request if cleanup fails
      console.error("Session cleanup error:", cleanupError);
    }
  }

  // Query the sessions and users tables in a single join query
  const results = await db
    .selectFrom("sessions")
    .innerJoin("users", "sessions.userId", "users.id")
    .select([
      "sessions.id as sessionId",
      "sessions.createdAt as sessionCreatedAt",
      "sessions.lastAccessed as sessionLastAccessed",
      "sessions.subuserId",
      "users.id",
      "users.businessName",
      "users.ownerName",
      "users.contactNumber",
      "users.businessType",
      "users.email",
      "users.displayName",
      "users.role",
      "users.avatarUrl",
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
    ])
    .where("sessions.id", "=", session.id)
    .limit(1)
    .execute();

  if (results.length === 0) {
    throw new NotAuthenticatedError();
  }

  const result = results[0];
  let user: User;

  // Check if this is a subuser session
  if (result.subuserId !== null) {
    // This is a subuser session - fetch subuser details
    const subuserData = await db
      .selectFrom("subusers")
      .select(["name", "id"])
      .where("id", "=", result.subuserId)
      .executeTakeFirst();

    if (!subuserData) {
      throw new NotAuthenticatedError("Subuser not found");
    }

    user = {
      id: result.id,
      businessName: result.businessName,
      ownerName: result.ownerName,
      contactNumber: result.contactNumber,
      businessType: result.businessType,
      email: result.email,
      displayName: subuserData.name, // Use subuser's name
      avatarUrl: result.avatarUrl,
      role: "user" as "admin" | "user", // Subusers always have user role
      address: result.address,
      pinCode: result.pinCode,
      gstNumber: result.gstNumber,
      referralCode: result.referralCode,
      referredByUserId: result.referredByUserId,
      isActive: result.isActive,
      subscriptionStatus: result.subscriptionStatus,
      subscriptionStartDate: result.subscriptionStartDate,
      subscriptionEndDate: result.subscriptionEndDate,
      subscriptionPlanMonths: result.subscriptionPlanMonths,
      lastPaymentAmount: result.lastPaymentAmount,
      lastPaymentDate: result.lastPaymentDate,
      enabledModules: result.enabledModules ?? ['dashboard', 'customer_record'],
      userType: 'subuser',
      parentUserId: result.id, // The main user's ID
      subuserId: result.subuserId,
    };
  } else {
    // This is a main user session
    user = {
      id: result.id,
      businessName: result.businessName,
      ownerName: result.ownerName,
      contactNumber: result.contactNumber,
      businessType: result.businessType,
      email: result.email,
      displayName: result.displayName,
      avatarUrl: result.avatarUrl,
      role: result.role as "admin" | "user",
      address: result.address,
      pinCode: result.pinCode,
      gstNumber: result.gstNumber,
      referralCode: result.referralCode,
      referredByUserId: result.referredByUserId,
      isActive: result.isActive,
      subscriptionStatus: result.subscriptionStatus,
      subscriptionStartDate: result.subscriptionStartDate,
      subscriptionEndDate: result.subscriptionEndDate,
      subscriptionPlanMonths: result.subscriptionPlanMonths,
      lastPaymentAmount: result.lastPaymentAmount,
      lastPaymentDate: result.lastPaymentDate,
      enabledModules: result.enabledModules ?? ['dashboard', 'customer_record'],
      userType: 'main_user',
      parentUserId: null,
      subuserId: null,
    };
  }

  // Check and disable expired subscriptions
  user = await checkAndDisableExpiredSubscription(user, db);

  // Update the session's lastAccessed timestamp
  const now = new Date();
  await db
    .updateTable("sessions")
    .set({ lastAccessed: now })
    .where("id", "=", session.id)
    .execute();

  return {
    user,
    // make sure to update the session in cookie
    session: {
      ...session,
      lastAccessed: now,
    },
  };
}