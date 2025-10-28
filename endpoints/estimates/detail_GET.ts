import { db } from "../../helpers/db";
import { schema, OutputType } from "./detail_GET.schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const input = schema.parse({
      id: url.searchParams.get("id"),
    });

    const estimate = await db
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
      .where("estimates.id", "=", input.id)
      .executeTakeFirst();

    if (!estimate) {
      return new Response(
        superjson.stringify({ error: `Estimate with id ${input.id} not found` }),
        { status: 404 }
      );
    }

    const items = await db
      .selectFrom("estimateItems")
      .selectAll()
      .where("estimateId", "=", input.id)
      .execute();

    const {
      userBusinessName,
      userAddress,
      userPinCode,
      userGstNumber,
      userContactNumber,
      ...estimateData
    } = estimate;

    const result: OutputType = {
      ...estimateData,
      items,
      user: {
        businessName: userBusinessName,
        address: userAddress,
        pinCode: userPinCode,
        gstNumber: userGstNumber,
        contactNumber: userContactNumber,
      },
    };

    return new Response(superjson.stringify(result));
  } catch (error) {
    console.error("Error fetching estimate detail:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: `Failed to fetch estimate detail: ${errorMessage}` }),
      { status: 400 }
    );
  }
}