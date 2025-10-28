import { db } from "../../../helpers/db";
import { schema, OutputType } from "./update_POST.schema";
import superjson from "superjson";
import { Transaction } from "kysely";
import { DB } from "../../../helpers/schema";
import { getServerUserSession } from "../../../helpers/getServerUserSession";

async function updateEstimateWithItems(
  trx: Transaction<DB>,
  input: typeof schema._input
) {
  const { id, items, discountPercentage = 0, taxPercentage = 0, expectedPaymentDate, ...estimateData } = input;

  // Calculate subtotal
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
    0
  );

  // Calculate discount
  const discountAmount = subtotal * (Number(discountPercentage) / 100);
  
  // Calculate amount after discount
  const amountAfterDiscount = subtotal - discountAmount;
  
  // Calculate tax
  const taxAmount = amountAfterDiscount * (Number(taxPercentage) / 100);
  
  // Calculate total
  const totalAmount = amountAfterDiscount + taxAmount;

  // Update the estimate record
  const updatedEstimate = await trx
    .updateTable("estimates")
    .set({
      ...estimateData,
      expectedPaymentDate: expectedPaymentDate || null,
      discountPercentage: discountPercentage.toString(),
      discountAmount: discountAmount.toString(),
      taxPercentage: taxPercentage.toString(),
      taxAmount: taxAmount.toString(),
      totalAmount: totalAmount.toString(),
      updatedAt: new Date(),
    })
    .where("id", "=", id)
    // No userId check for admin
    .returningAll()
    .executeTakeFirstOrThrow();

  // Delete old items
  await trx.deleteFrom("estimateItems").where("estimateId", "=", id).execute();

  // Insert new items
  if (items.length > 0) {
    const itemsToInsert = items.map((item) => ({
      ...item,
      estimateId: id,
      amount: (Number(item.quantity) * Number(item.unitPrice)).toString(),
    }));
    await trx.insertInto("estimateItems").values(itemsToInsert).execute();
  }

  const newItems = await trx
    .selectFrom("estimateItems")
    .selectAll()
    .where("estimateId", "=", id)
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
    .where("id", "=", updatedEstimate.userId)
    .executeTakeFirstOrThrow();

  return {
    ...updatedEstimate,
    items: newItems,
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
    
    if (user.role !== "admin") {
      return new Response(
        superjson.stringify({ error: "Unauthorized" }),
        { status: 403 }
      );
    }
    
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    const updatedEstimateWithItems = await db.transaction().execute((trx) =>
      updateEstimateWithItems(trx, input)
    );

    return new Response(superjson.stringify(updatedEstimateWithItems satisfies OutputType));
  } catch (error) {
    console.error("Error updating estimate by admin:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: `Failed to update estimate: ${errorMessage}` }),
      { status: 400 }
    );
  }
}