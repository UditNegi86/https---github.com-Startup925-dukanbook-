import { db } from "../../helpers/db";
import { OutputType, schema } from "./customers_GET.schema";
import superjson from "superjson";
import { sql, Selectable } from "kysely";
import { Estimates, EstimateItems } from "../../helpers/schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    
    const url = new URL(request.url);
    const { startDate, endDate } = schema.parse({
      startDate: url.searchParams.get("startDate") || undefined,
      endDate: url.searchParams.get("endDate") || undefined,
    });

    let query = db
      .selectFrom("estimates")
      .innerJoin("users", "users.id", "estimates.userId")
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
      ])
      .where("estimates.userId", "=", user.id)
      .orderBy("estimates.date", "desc");

    if (startDate) {
      query = query.where("estimates.date", ">=", new Date(startDate));
    }
    if (endDate) {
      // Add 1 day to endDate to make it inclusive
      const inclusiveEndDate = new Date(endDate);
      inclusiveEndDate.setDate(inclusiveEndDate.getDate() + 1);
      query = query.where("estimates.date", "<", inclusiveEndDate);
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

    const estimatesWithItems = estimates.map((estimate) => {
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
        items: itemsByEstimateId[estimate.id] || [],
        user: {
          businessName: userBusinessName,
          address: userAddress,
          pinCode: userPinCode,
          gstNumber: userGstNumber,
          contactNumber: userContactNumber,
        },
      };
    });

    const customersMap = new Map<string, OutputType[number]>();

    for (const estimate of estimatesWithItems) {
      const key = estimate.mobileNumber;
      if (!customersMap.has(key)) {
        customersMap.set(key, {
          customerName: estimate.customerName,
          mobileNumber: estimate.mobileNumber,
          estimates: [],
          totalAmountSpent: 0,
          estimateCount: 0,
          lastTransactionDate: new Date(0),
        });
      }

      const customer = customersMap.get(key)!;
      customer.estimates.push(estimate);
      customer.totalAmountSpent += Number(estimate.totalAmount);
      customer.estimateCount += 1;
      if (new Date(estimate.date) > new Date(customer.lastTransactionDate)) {
        customer.lastTransactionDate = estimate.date;
      }
    }

    const result = Array.from(customersMap.values());
    result.sort(
      (a, b) =>
        new Date(b.lastTransactionDate).getTime() -
        new Date(a.lastTransactionDate).getTime()
    );

    return new Response(superjson.stringify(result));
  } catch (error) {
    console.error("Error fetching customer records:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({
        error: `Failed to fetch customer records: ${errorMessage}`,
      }),
      { status: 500 }
    );
  }
}