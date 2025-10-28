import { z } from "zod";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { schema, OutputType, PurchaseWithItemsAndSupplier } from "./purchases_POST.schema";
import superjson from "superjson";
import { Transaction } from "kysely";
import { DB } from "../helpers/schema";

async function createPurchaseWithItems(
  trx: Transaction<DB>,
  userId: number,
  input: z.infer<typeof schema>
): Promise<PurchaseWithItemsAndSupplier> {
  const { items, ...purchaseData } = input;

  // 1. Create the purchase record
  const [newPurchase] = await trx
    .insertInto("purchases")
    .values({
      ...purchaseData,
      userId,
    })
    .returningAll()
    .execute();

  if (!newPurchase) {
    throw new Error("Failed to create purchase record.");
  }

  // 2. Prepare and insert purchase items
  const itemsToInsert = items.map((item: z.infer<typeof schema>['items'][number]) => ({
    itemName: item.itemName,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    purchaseId: newPurchase.id,
    amount: Number(item.quantity) * Number(item.unitPrice),
  }));

  const newItems = await trx
    .insertInto("purchaseItems")
    .values(itemsToInsert)
    .returningAll()
    .execute();

  // 3. Process inventory additions for items marked as addToInventory
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

  // 4. Fetch the supplier details
  const supplier = await trx
    .selectFrom("suppliers")
    .selectAll()
    .where("id", "=", newPurchase.supplierId)
    .executeTakeFirstOrThrow();

  return {
    ...newPurchase,
    items: newItems,
    supplier,
  };
}

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const validatedInput = schema.parse(json);

    const newPurchaseWithDetails = await db.transaction().execute((trx) =>
      createPurchaseWithItems(trx, user.id, validatedInput)
    );

    return new Response(
      superjson.stringify({ purchase: newPurchaseWithDetails } satisfies OutputType)
    );
  } catch (error) {
    console.error("Error creating purchase:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
    });
  }
}