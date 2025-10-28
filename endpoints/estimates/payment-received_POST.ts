import { db } from "../../helpers/db";
import { schema, OutputType } from "./payment-received_POST.schema";
import superjson from "superjson";
import { Transaction } from "kysely";
import { DB } from "../../helpers/schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";

async function recordPayment(
  trx: Transaction<DB>,
  input: typeof schema._input,
  userId: number
) {
  const { estimateId, paymentReceivedDate, paymentReceivedMode } = input;

  // 1. Validate that the estimate exists and is a credit estimate
  const estimate = await trx
    .selectFrom("estimates")
    .selectAll()
    .where("id", "=", estimateId)
    .where("userId", "=", userId)
    .executeTakeFirst();

  if (!estimate) {
    throw new Error("Estimate not found.");
  }

  if (estimate.paymentType !== "credit") {
    throw new Error("This operation is only valid for credit estimates.");
  }

  // 2. Update the estimate record
  const updatedEstimate = await trx
    .updateTable("estimates")
    .set({
      paymentReceivedDate,
      paymentReceivedMode,
      updatedAt: new Date(),
    })
    .where("id", "=", estimateId)
    .returningAll()
    .executeTakeFirstOrThrow();

  // 3. Fetch items to return the full object
  const items = await trx
    .selectFrom("estimateItems")
    .selectAll()
    .where("estimateId", "=", estimateId)
    .execute();

  // Fetch user information
  const userInfo = await trx
    .selectFrom("users")
    .select([
      "businessName",
      "address",
      "pinCode",
      "gstNumber",
      "contactNumber",
    ])
    .where("id", "=", userId)
    .executeTakeFirstOrThrow();

  return {
    ...updatedEstimate,
    items,
    user: {
      businessName: userInfo.businessName,
      address: userInfo.address,
      pinCode: userInfo.pinCode,
      gstNumber: userInfo.gstNumber,
      contactNumber: userInfo.contactNumber,
    },
  };
}

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    
    if (user.isActive === false) {
      return new Response(
        superjson.stringify({ error: "Your account is disabled. Please contact admin for access." }),
        { status: 403 }
      );
    }
    
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    const updatedEstimateWithItems = await db
      .transaction()
      .execute((trx) => recordPayment(trx, input, user.id));

    return new Response(
      superjson.stringify(updatedEstimateWithItems satisfies OutputType)
    );
  } catch (error) {
    console.error("Error recording payment:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: `Failed to record payment: ${errorMessage}` }),
      { status: 400 }
    );
  }
}