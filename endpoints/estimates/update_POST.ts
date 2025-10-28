import { db } from "../../helpers/db";
import { schema, OutputType } from "./update_POST.schema";
import superjson from "superjson";
import { Transaction } from "kysely";
import { DB } from "../../helpers/schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";

async function updateEstimateWithItems(
  trx: Transaction<DB>,
  input: typeof schema._input,
  userId: number
) {
  const { id, items, discountPercentage = 0, taxPercentage = 0, expectedPaymentDate, ...estimateData } = input;

  // Fetch old items to calculate inventory adjustments
  const oldItems = await trx
    .selectFrom("estimateItems")
    .selectAll()
    .where("estimateId", "=", id)
    .execute();

  // Build a map of old items by inventoryItemId for easy lookup
  const oldItemsMap = new Map<number, { quantity: number }>();
  for (const oldItem of oldItems) {
    if (oldItem.inventoryItemId) {
      const existing = oldItemsMap.get(oldItem.inventoryItemId);
      const qty = Number(oldItem.quantity);
      if (existing) {
        existing.quantity += qty;
      } else {
        oldItemsMap.set(oldItem.inventoryItemId, { quantity: qty });
      }
    }
  }

  // Build a map of new items by inventoryItemId
  const newItemsMap = new Map<number, { quantity: number }>();
  for (const newItem of items) {
    if (newItem.inventoryItemId) {
      const existing = newItemsMap.get(newItem.inventoryItemId);
      const qty = Number(newItem.quantity);
      if (existing) {
        existing.quantity += qty;
      } else {
        newItemsMap.set(newItem.inventoryItemId, { quantity: qty });
      }
    }
  }

  // Calculate inventory adjustments needed
  const inventoryAdjustments = new Map<number, number>(); // inventoryItemId -> quantity change

  // Check items that were in old but not in new (restore inventory)
  for (const [inventoryItemId, { quantity }] of oldItemsMap.entries()) {
    inventoryAdjustments.set(inventoryItemId, quantity); // positive = add back
  }

  // Check items in new list
  for (const [inventoryItemId, { quantity }] of newItemsMap.entries()) {
    const oldQty = oldItemsMap.get(inventoryItemId)?.quantity || 0;
    const diff = oldQty - quantity; // positive = restore, negative = deduct more
    inventoryAdjustments.set(inventoryItemId, diff);
  }

  // Validate inventory levels before proceeding
  for (const [inventoryItemId, adjustment] of inventoryAdjustments.entries()) {
    if (adjustment < 0) {
      // Need to deduct more inventory
      const inventoryItem = await trx
        .selectFrom("inventoryItems")
        .select(["quantity", "itemName"])
        .where("id", "=", inventoryItemId)
        .where("userId", "=", userId)
        .executeTakeFirst();

      if (!inventoryItem) {
        throw new Error(`Inventory item with ID ${inventoryItemId} not found`);
      }

      const currentStock = Number(inventoryItem.quantity);
      const additionalNeeded = Math.abs(adjustment);

      if (currentStock < additionalNeeded) {
        throw new Error(
          `Insufficient stock for "${inventoryItem.itemName}". Available: ${currentStock}, Additional needed: ${additionalNeeded}`
        );
      }
    }
  }

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
    .where("userId", "=", userId)
    .returningAll()
    .executeTakeFirstOrThrow();

  // Delete old items
  await trx.deleteFrom("estimateItems").where("estimateId", "=", id).execute();

  // Insert new items
  if (items.length > 0) {
    const itemsToInsert = items.map((item) => ({
      description: item.description,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      inventoryItemId: item.inventoryItemId || null,
      estimateId: id,
      amount: (Number(item.quantity) * Number(item.unitPrice)).toString(),
    }));
    await trx.insertInto("estimateItems").values(itemsToInsert).execute();
  }

  // Apply inventory adjustments
  for (const [inventoryItemId, adjustment] of inventoryAdjustments.entries()) {
    if (adjustment !== 0) {
      await trx
        .updateTable("inventoryItems")
        .set((eb) => ({
          quantity: eb("quantity", "+", adjustment.toString()),
          updatedAt: new Date(),
        }))
        .where("id", "=", inventoryItemId)
        .where("userId", "=", userId)
        .execute();
    }
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
    .where("id", "=", userId)
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
    
    if (user.isActive === false) {
      return new Response(
        superjson.stringify({ error: "Your account is disabled. Please contact admin for access." }),
        { status: 403 }
      );
    }
    
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // Check if the estimate has been converted to a bill
    const existingEstimate = await db
      .selectFrom("estimates")
      .select(["billNumber"])
      .where("id", "=", input.id)
      .where("userId", "=", user.id)
      .executeTakeFirst();

    if (existingEstimate && existingEstimate.billNumber) {
      return new Response(
        superjson.stringify({ error: "Cannot edit an estimate that has been converted to a bill" }),
        { status: 403 }
      );
    }

    const updatedEstimateWithItems = await db.transaction().execute((trx) =>
      updateEstimateWithItems(trx, input, user.id)
    );

    return new Response(superjson.stringify(updatedEstimateWithItems satisfies OutputType));
  } catch (error) {
    console.error("Error updating estimate:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: `Failed to update estimate: ${errorMessage}` }),
      { status: 400 }
    );
  }
}