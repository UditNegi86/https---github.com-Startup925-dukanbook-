import { db } from "../helpers/db";
import { schema, OutputType } from "./estimates_POST.schema";
import superjson from "superjson";
import { Transaction } from "kysely";
import { DB } from "../helpers/schema";
import { getServerUserSession } from "../helpers/getServerUserSession";

async function createEstimateWithItems(
  trx: Transaction<DB>,
  input: typeof schema._input,
  userId: number,
  subuserId: number | null
) {
  const { items, discountPercentage = 0, taxPercentage = 0, expectedPaymentDate, ...estimateData } = input;

  // Check inventory stock levels before proceeding
  for (const item of items) {
    if (item.inventoryItemId) {
      const inventoryItem = await trx
        .selectFrom("inventoryItems")
        .select(["quantity", "itemName"])
        .where("id", "=", item.inventoryItemId)
        .where("userId", "=", userId)
        .executeTakeFirst();

      if (!inventoryItem) {
        throw new Error(`Inventory item with ID ${item.inventoryItemId} not found`);
      }

      const currentStock = Number(inventoryItem.quantity);
      const requiredQty = Number(item.quantity);

      if (currentStock < requiredQty) {
        throw new Error(
          `Insufficient stock for "${inventoryItem.itemName}". Available: ${currentStock}, Required: ${requiredQty}`
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

  // Find the maximum estimate number for this user
  const maxEstimate = await trx
    .selectFrom("estimates")
    .select("estimateNumber")
    .where("userId", "=", userId)
    .orderBy("estimateNumber", "desc")
    .limit(1)
    .executeTakeFirst();

  // Extract numeric part and generate next number
  let nextNumber = 1;
  if (maxEstimate?.estimateNumber) {
    const match = maxEstimate.estimateNumber.match(/EST-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  const estimateNumber = `EST-${String(nextNumber).padStart(3, "0")}`;

  // Insert the main estimate record
  const newEstimate = await trx
    .insertInto("estimates")
    .values({
      ...estimateData,
      userId,
      expectedPaymentDate: expectedPaymentDate || null,
      discountPercentage: discountPercentage.toString(),
      discountAmount: discountAmount.toString(),
      taxPercentage: taxPercentage.toString(),
      taxAmount: taxAmount.toString(),
      totalAmount: totalAmount.toString(),
      status: "completed",
      estimateNumber,
      createdBySubuserId: subuserId,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  // Insert the associated items and update inventory
  if (items.length > 0) {
    const itemsToInsert = items.map((item) => ({
      description: item.description,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      inventoryItemId: item.inventoryItemId || null,
      estimateId: newEstimate.id,
      amount: (Number(item.quantity) * Number(item.unitPrice)).toString(),
    }));

    await trx.insertInto("estimateItems").values(itemsToInsert).execute();

    // Update inventory quantities for items with inventoryItemId
    for (const item of items) {
      if (item.inventoryItemId) {
        await trx
          .updateTable("inventoryItems")
          .set((eb) => ({
            quantity: eb("quantity", "-", item.quantity.toString()),
            updatedAt: new Date(),
          }))
          .where("id", "=", item.inventoryItemId)
          .where("userId", "=", userId)
          .execute();
      }
    }
  }

  // Fetch the newly created items to return them
  const newItems = await trx
    .selectFrom("estimateItems")
    .selectAll()
    .where("estimateId", "=", newEstimate.id)
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
    ...newEstimate,
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

    const newEstimateWithItems = await db.transaction().execute((trx) =>
      createEstimateWithItems(trx, input, user.id, user.subuserId)
    );

    return new Response(superjson.stringify(newEstimateWithItems satisfies OutputType), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating estimate:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: `Failed to create estimate: ${errorMessage}` }),
      { status: 400 }
    );
  }
}