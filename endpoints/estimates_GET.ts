import { db } from "../helpers/db";
import { OutputType } from "./estimates_GET.schema";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Estimates, EstimateItems, EstimatePayments, Users } from "../helpers/schema";
import { getServerUserSession } from "../helpers/getServerUserSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    
    const estimates = await db
      .selectFrom("estimates")
      .innerJoin("users", "users.id", "estimates.userId")
      .leftJoin("subusers", "subusers.id", "estimates.createdBySubuserId")
      .select([
        "estimates.id",
        "estimates.estimateNumber",
        "estimates.billNumber",
        "estimates.customerName",
        "estimates.mobileNumber",
        "estimates.date",
        "estimates.totalAmount",
        "estimates.taxAmount",
        "estimates.taxPercentage",
        "estimates.discountAmount",
        "estimates.discountPercentage",
        "estimates.paymentType",
        "estimates.expectedPaymentDate",
        "estimates.paymentReceivedDate",
        "estimates.paymentReceivedMode",
        "estimates.status",
        "estimates.notes",
        "estimates.userId",
        "estimates.createdBySubuserId",
        "estimates.createdAt",
        "estimates.updatedAt",
        "users.businessName as userBusinessName",
        "users.address as userAddress",
        "users.pinCode as userPinCode",
        "users.gstNumber as userGstNumber",
        "users.contactNumber as userContactNumber",
        "subusers.name as subuserName",
      ])
      .where("estimates.userId", "=", user.id)
      .orderBy("estimates.date", "desc")
      .execute();

    if (estimates.length === 0) {
      return new Response(superjson.stringify([] satisfies OutputType));
    }

    const estimateIds = estimates.map((e) => e.id);

    const items = await db
      .selectFrom("estimateItems")
      .selectAll()
      .where("estimateId", "in", estimateIds)
      .execute();

    const payments = await db
      .selectFrom("estimatePayments")
      .selectAll()
      .where("estimateId", "in", estimateIds)
      .orderBy("paymentDate", "asc")
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

    const paymentsByEstimateId = payments.reduce<
      Record<number, Selectable<EstimatePayments>[]>
    >((acc, payment) => {
      if (!acc[payment.estimateId]) {
        acc[payment.estimateId] = [];
      }
      acc[payment.estimateId].push(payment);
      return acc;
    }, {});

    const estimatesWithItems: OutputType = estimates.map((estimate) => {
      const {
        userBusinessName,
        userAddress,
        userPinCode,
        userGstNumber,
        userContactNumber,
        ...estimateData
      } = estimate;

      return {
        ...estimateData,
        createdBySubuserId: estimate.createdBySubuserId,
        subuserName: estimate.subuserName,
        items: itemsByEstimateId[estimate.id] || [],
        payments: paymentsByEstimateId[estimate.id] || [],
        user: {
          businessName: userBusinessName,
          address: userAddress,
          pinCode: userPinCode,
          gstNumber: userGstNumber,
          contactNumber: userContactNumber,
        },
      };
    });

    return new Response(superjson.stringify(estimatesWithItems));
  } catch (error) {
    console.error("Error fetching estimates:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: `Failed to fetch estimates: ${errorMessage}` }),
      { status: 500 }
    );
  }
}