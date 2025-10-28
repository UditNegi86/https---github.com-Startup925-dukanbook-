import { db } from "../../helpers/db";
import { OutputType } from "./estimates_GET.schema";
import superjson from "superjson";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { Selectable } from "kysely";
import { Estimates, EstimateItems, Users } from "../../helpers/schema";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    if (user.role !== "admin") {
      return new Response(
        superjson.stringify({ error: "Unauthorized" }),
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const userIdParam = url.searchParams.get("userId");
    const userId = userIdParam ? parseInt(userIdParam, 10) : null;

    let query = db
      .selectFrom("estimates")
      .innerJoin("users", "estimates.userId", "users.id")
      .select([
        "estimates.id",
        "estimates.userId",
        "estimates.estimateNumber",
        "estimates.customerName",
        "estimates.mobileNumber",
        "estimates.date",
        "estimates.totalAmount",
        "estimates.paymentType",
        "estimates.status",
        "estimates.createdAt",
        "estimates.updatedAt",
        "estimates.discountAmount",
        "estimates.discountPercentage",
        "estimates.expectedPaymentDate",
        "estimates.notes",
        "estimates.paymentReceivedDate",
        "estimates.paymentReceivedMode",
        "estimates.taxAmount",
        "estimates.taxPercentage",
        "estimates.billNumber",
        "estimates.createdBySubuserId",
        "users.businessName",
        "users.ownerName",
        "users.contactNumber as userContactNumber",
        "users.address as userAddress",
        "users.pinCode as userPinCode",
        "users.gstNumber as userGstNumber",
      ])
      .orderBy("estimates.date", "desc");

    if (userId && !isNaN(userId)) {
      query = query.where("estimates.userId", "=", userId);
    }

    const estimates = await query.execute();

    if (estimates.length === 0) {
      return new Response(superjson.stringify([] satisfies OutputType));
    }

    const estimateIds = estimates.map((e) => e.id);

    const items = await db
      .selectFrom("estimateItems")
      .selectAll()
      .where("estimateId", "in", estimateIds)
      .execute();

    const itemsByEstimateId = items.reduce<
      Record<number, Selectable<EstimateItems>[]>
    >((acc, item) => {
      if (!acc[item.estimateId]) {
        acc[item.estimateId] = [];
      }
      acc[item.estimateId].push(item);
      return acc;
    }, {});

    const estimatesWithItemsAndUser: OutputType = estimates.map((estimate) => ({
      id: estimate.id,
      userId: estimate.userId,
      estimateNumber: estimate.estimateNumber,
      customerName: estimate.customerName,
      mobileNumber: estimate.mobileNumber,
      date: estimate.date,
      totalAmount: estimate.totalAmount,
      paymentType: estimate.paymentType,
      status: estimate.status,
      createdAt: estimate.createdAt,
      updatedAt: estimate.updatedAt,
      discountAmount: estimate.discountAmount,
      discountPercentage: estimate.discountPercentage,
      expectedPaymentDate: estimate.expectedPaymentDate,
      notes: estimate.notes,
      paymentReceivedDate: estimate.paymentReceivedDate,
      paymentReceivedMode: estimate.paymentReceivedMode,
      taxAmount: estimate.taxAmount,
      taxPercentage: estimate.taxPercentage,
      billNumber: estimate.billNumber,
      createdBySubuserId: estimate.createdBySubuserId,
      user: {
        id: estimate.userId,
        businessName: estimate.businessName,
        ownerName: estimate.ownerName,
        contactNumber: estimate.userContactNumber,
        address: estimate.userAddress,
        pinCode: estimate.userPinCode,
        gstNumber: estimate.userGstNumber,
      },
      items: itemsByEstimateId[estimate.id] || [],
    }));

    return new Response(superjson.stringify(estimatesWithItemsAndUser));
  } catch (error) {
    console.error("Error fetching estimates for admin:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: `Failed to fetch estimates: ${errorMessage}` }),
      { status: 500 }
    );
  }
}