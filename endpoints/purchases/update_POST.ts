import { z } from "zod";
import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType, PurchaseWithItemsAndSupplier } from "./update_POST.schema";
import superjson from "superjson";
import { Transaction } from "kysely";
import { DB } from "../../helpers/schema";

async function updatePurchaseWithItems(
  trx: Transaction<DB>,
  userId: number,
  input: z.infer<typeof schema>
): Promise<PurchaseWithItemsAndSupplier> {
  const { id, items, ...purchaseData } = input;

  // 1. Update the purchase record
  const updateData = {
    supplierId: purchaseData.supplierId,
    purchaseDate: purchaseData.purchaseDate,
    billNumber: purchaseData.billNumber,
    billFileData: purchaseData.billFileData,
    billFileName: purchaseData.billFileName,
    billFileType: purchaseData.billFileType,
    totalAmount: purchaseData.totalAmount,
    paymentStatus: purchaseData.paymentStatus,
    paymentDate: purchaseData.paymentDate,
    paymentDueDate: purchaseData.paymentDueDate,
    paymentMode: purchaseData.paymentMode,
    paymentReference: purchaseData.paymentReference,
    notes: purchaseData.notes,
    updatedAt: new Date(),
  };

  // Log 2: Log the exact SQL update fields being set
  console.log("=== Purchase Update SQL Data ===");
  console.log("Update fields being set:");
  console.log("- paymentStatus:", updateData.paymentStatus);
  console.log("- paymentDate:", updateData.paymentDate);
  console.log("- paymentDueDate:", updateData.paymentDueDate);
  console.log("- paymentMode:", updateData.paymentMode);
  console.log("Full update data:", JSON.stringify(updateData, null, 2));

  const [updatedPurchase] = await trx
    .updateTable("purchases")
    .set(updateData)
    .where("id", "=", id)
    .where("userId", "=", userId)
    .returningAll()
    .execute();

  if (!updatedPurchase) {
    throw new Error("Purchase not found or you do not have permission to update it.");
  }

  // Log 3: Log the result after update
  console.log("=== Purchase Update Result ===");
  console.log("Updated Purchase ID:", updatedPurchase.id);
  console.log("Payment Status in DB:", updatedPurchase.paymentStatus);
  console.log("Full updated purchase:", JSON.stringify(updatedPurchase, null, 2));

  // 2. Delete existing items for this purchase
  await trx.deleteFrom("purchaseItems").where("purchaseId", "=", id).execute();

  // 3. Insert the new set of items
  const itemsToInsert = items.map((item: z.infer<typeof schema>['items'][number]) => ({
    itemName: item.itemName,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    purchaseId: id,
    amount: Number(item.quantity) * Number(item.unitPrice),
  }));

  const newItems = await trx
    .insertInto("purchaseItems")
    .values(itemsToInsert)
    .returningAll()
    .execute();

  // 4. Process inventory additions for items marked as addToInventory
  for (const item of items) {
    if (item.addToInventory) {
      // Check if inventory item with same name exists for user
      const existingInventoryItem = await trx
        .selectFrom("inventoryItems")
        .selectAll()
        .where("userId", "=", userId)
        .where("itemName", "=", item.itemName)
        .executeTakeFirst();

      if (existingInventoryItem) {
        // Update existing inventory item
        const existingQuantity = Number(existingInventoryItem.quantity);
        const existingPurchaseValue = Number(existingInventoryItem.purchaseValue);
        const newQuantity = Number(item.quantity);
        const newUnitPrice = Number(item.unitPrice);

        const totalQuantity = existingQuantity + newQuantity;
        const newPurchaseValue = 
          (existingQuantity * existingPurchaseValue + newQuantity * newUnitPrice) / totalQuantity;

        await trx
          .updateTable("inventoryItems")
          .set({
            quantity: totalQuantity.toString(),
            purchaseValue: newPurchaseValue.toString(),
          })
          .where("id", "=", existingInventoryItem.id)
          .execute();
      } else {
        // Create new inventory item
        await trx
          .insertInto("inventoryItems")
          .values({
            userId,
            itemName: item.itemName,
            quantity: item.quantity.toString(),
            purchaseValue: item.unitPrice.toString(),
            salesValue: item.unitPrice.toString(), // Default to purchase value
          })
          .execute();
      }
    }
  }

  // 5. Fetch the supplier details
  const supplier = await trx
    .selectFrom("suppliers")
    .selectAll()
    .where("id", "=", updatedPurchase.supplierId)
    .executeTakeFirstOrThrow();

  return {
    ...updatedPurchase,
    items: newItems,
    supplier,
  };
}

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const validatedInput = schema.parse(json);
    
    // Log 1: Log the entire input object received
    console.log("=== Purchase Update Input ===");
    console.log("Purchase ID:", validatedInput.id);
    console.log("Payment Status:", validatedInput.paymentStatus);
    console.log("Full Input:", JSON.stringify(validatedInput, null, 2));

    const updatedPurchaseWithDetails = await db.transaction().execute((trx) =>
      updatePurchaseWithItems(trx, user.id, validatedInput)
    );

    return new Response(
      superjson.stringify({ purchase: updatedPurchaseWithDetails } satisfies OutputType)
    );
  } catch (error) {
    console.error("Error updating purchase:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
    });
  }
}