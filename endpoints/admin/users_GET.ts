import { db } from "../../helpers/db";
import { OutputType } from "./users_GET.schema";
import superjson from "superjson";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { sql } from "kysely";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    if (user.role !== "admin") {
      return new Response(
        superjson.stringify({ error: "Unauthorized" }),
        { status: 403 }
      );
    }

    const usersWithStats = await db
      .selectFrom("users")
      .leftJoin("estimates", "estimates.userId", "users.id")
      .select([
        "users.id",
        "users.businessName",
        "users.ownerName",
        "users.contactNumber",
        "users.businessType",
        "users.role",
        "users.createdAt",
        "users.displayName",
        "users.email",
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
        sql<number>`COUNT(estimates.id)`.as("estimateCount"),
        sql<string>`COALESCE(SUM(estimates.total_amount), 0)`.as("totalAmount"),
      ])
      .groupBy("users.id")
      .orderBy("users.createdAt", "desc")
      .execute();

    const result: OutputType = usersWithStats.map(user => ({
      id: user.id,
      businessName: user.businessName,
      ownerName: user.ownerName,
      contactNumber: user.contactNumber,
      businessType: user.businessType,
      role: user.role as "admin" | "user",
      createdAt: user.createdAt,
      displayName: user.displayName,
      email: user.email,
      avatarUrl: user.avatarUrl,
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
      estimateCount: Number(user.estimateCount),
      totalAmount: user.totalAmount.toString(),
    }));

    return new Response(superjson.stringify(result));
  } catch (error) {
    console.error("Error fetching users for admin:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: `Failed to fetch users: ${errorMessage}` }),
      { status: 500 }
    );
  }
}