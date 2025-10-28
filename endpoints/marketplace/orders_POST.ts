import { db } from "../../helpers/db";
import { schema, OutputType } from "./orders_POST.schema";
import superjson from "superjson";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { Kysely, sql } from "kysely";
import { DB } from "../../helpers/schema";

export async function handle(request: Request) {
  const { user } = await getServerUserSession(request);
  const body = superjson.parse(await request.text());
  const validatedData = schema.parse(body);

  try {
    const newOrder = await db.transaction().execute(async (trx) => {
      const itemIds = validatedData.items.map((item) => item.itemId);
      const itemsInDb = await trx
        .selectFrom("marketplaceItems")
        .select(["id", "price", "stockQuantity"])
        .where("id", "in", itemIds)
        .where("isActive", "=", true)
        .execute();

      if (itemsInDb.length !== itemIds.length) {
        throw new Error("One or more items not found or are inactive.");
      }

      const itemsById = new Map(itemsInDb.map((item) => [item.id, item]));
      let totalAmount = 0;

      for (const orderItem of validatedData.items) {
        const dbItem = itemsById.get(orderItem.itemId);
        if (!dbItem) {
          throw new Error(`Item with ID ${orderItem.itemId} not found.`);
        }
        if (dbItem.stockQuantity < orderItem.quantity) {
          throw new Error(`Not enough stock for item ID ${orderItem.itemId}. Available: ${dbItem.stockQuantity}, Requested: ${orderItem.quantity}.`);
        }
        totalAmount += parseFloat(dbItem.price) * orderItem.quantity;
      }

      const order = await trx
        .insertInto("marketplaceOrders")
        .values({
          userId: user.id,
          totalAmount: totalAmount.toString(),
          deliveryAddress: validatedData.deliveryAddress,
          deliveryContact: validatedData.deliveryContact,
          notes: validatedData.notes,
          status: "pending",
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      const orderItemsToInsert = validatedData.items.map((item) => {
        const dbItem = itemsById.get(item.itemId)!;
        return {
          orderId: order.id,
          itemId: item.itemId,
          quantity: item.quantity,
          priceAtPurchase: dbItem.price,
          subtotal: (parseFloat(dbItem.price) * item.quantity).toString(),
        };
      });

      await trx
        .insertInto("marketplaceOrderItems")
        .values(orderItemsToInsert)
        .execute();

      // Update stock quantities
      for (const item of validatedData.items) {
        await trx
          .updateTable("marketplaceItems")
          .set({
            stockQuantity: sql`stock_quantity - ${item.quantity}`,
          })
          .where("id", "=", item.itemId)
          .execute();
      }

      return order;
    });

    return new Response(superjson.stringify({ order: newOrder } satisfies OutputType), { status: 201 });
  } catch (error) {
    console.error("Error creating marketplace order:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: `Failed to create order: ${errorMessage}` }),
      { status: 400 } // Use 400 for client-side errors like validation/stock issues
    );
  }
}