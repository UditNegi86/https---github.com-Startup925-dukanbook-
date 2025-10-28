import { db } from "../../helpers/db";
import { schema, InputType, OutputType } from "./record-payment_POST.schema";
import superjson from "superjson";
import { Transaction, sql } from "kysely";
import { DB } from "../../helpers/schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";

async function recordPartialPayment(
  trx: Transaction<DB>,
  input: InputType,
  userId: number
): Promise<OutputType> {
  const { estimateId, amount, paymentDate, paymentMode, notes } = input;

  // 1. Validate that the estimate exists, belongs to the user, and is a credit estimate
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

  // 2. Calculate total payments already made for this estimate
  const { totalPaid } = await trx
    .selectFrom("estimatePayments")
    .select(sql<number>`sum(amount)`.as("totalPaid"))
    .where("estimateId", "=", estimateId)
    .executeTakeFirstOrThrow();

  const totalPaidAmount = Number(totalPaid) || 0;
  const totalAmount = Number(estimate.totalAmount);
  const remainingBalance = totalAmount - totalPaidAmount;

  // 3. Validate that the new payment amount doesn't exceed the remaining balance
  if (amount > remainingBalance) {
    throw new Error(
      `Payment amount of ${amount} exceeds remaining balance of ${remainingBalance}.`
    );
  }

  // 4. Insert a new record into the estimate_payments table
  await trx
    .insertInto("estimatePayments")
    .values({
      estimateId,
      amount,
      paymentDate,
      paymentMode,
      notes,
      createdByUserId: userId,
    })
    .execute();

  const newTotalPaidAmount = totalPaidAmount + amount;

  // 5. Check if the estimate is now fully paid and update if necessary
  if (newTotalPaidAmount >= totalAmount) {
    await trx
      .updateTable("estimates")
      .set({
        paymentReceivedDate: paymentDate,
        paymentReceivedMode: paymentMode,
        updatedAt: new Date(),
      })
      .where("id", "=", estimateId)
      .execute();
  }

  // 6. Fetch the updated estimate, its items, and full payment history to return
  const updatedEstimate = await trx
    .selectFrom("estimates")
    .selectAll()
    .where("id", "=", estimateId)
    .executeTakeFirstOrThrow();

  const items = await trx
    .selectFrom("estimateItems")
    .selectAll()
    .where("estimateId", "=", estimateId)
    .execute();

  const payments = await trx
    .selectFrom("estimatePayments")
    .selectAll()
    .where("estimateId", "=", estimateId)
    .orderBy("paymentDate", "asc")
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
    payments,
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

    const result = await db
      .transaction()
      .execute((trx) => recordPartialPayment(trx, input, user.id));

    return new Response(superjson.stringify(result satisfies OutputType));
  } catch (error) {
    console.error("Error recording partial payment:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({
        error: `Failed to record payment: ${errorMessage}`,
      }),
      { status: 400 }
    );
  }
}