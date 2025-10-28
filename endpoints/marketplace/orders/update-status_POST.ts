import { db } from "../../../helpers/db";
import { schema, OutputType } from "./update-status_POST.schema";
import superjson from "superjson";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { Kysely, sql } from "kysely";
import { DB } from "../../../helpers/schema";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    if (user.role !== "admin") {
      return new Response(
        superjson.stringify({ error: "Forbidden: Admin access required" }),
        { status: 403 }
      );
    }

    const body = superjson.parse(await request.text());
    const { orderId, status } = schema.parse(body);

    const updatedOrder = await db.transaction().execute(async (trx) => {
      const order = await trx
        .selectFrom("marketplaceOrders")
        .selectAll()
        .where("id", "=", orderId)
        .executeTakeFirst();

      if (!order) {
        throw new Error("Order not found.");
      }

      // If an order is cancelled, restock the items.
      if (status === "cancelled" && order.status !== "cancelled") {
        const orderItems = await trx
          .selectFrom("marketplaceOrderItems")
          .select(["itemId", "quantity"])
          .where("orderId", "=", orderId)
          .execute();

        for (const item of orderItems) {
          await trx
            .updateTable("marketplaceItems")
            .set({
              stockQuantity: sql`stock_quantity + ${item.quantity}`,
            })
            .where("id", "=", item.itemId)
            .execute();
        }
      }

      const result = await trx
        .updateTable("marketplaceOrders")
        .set({ status })
        .where("id", "=", orderId)
        .returningAll()
        .executeTakeFirstOrThrow();
      
      return result;
    });

    return new Response(superjson.stringify({ order: updatedOrder } satisfies OutputType));
  } catch (error) {
    console.error("Error updating order status:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: `Failed to update order status: ${errorMessage}` }),
      { status: 500 }
    );
  }
}