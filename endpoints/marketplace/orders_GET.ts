import { db } from "../../helpers/db";
import { OutputType } from "./orders_GET.schema";
import superjson from "superjson";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { Selectable } from "kysely";
import { MarketplaceOrders, MarketplaceOrderItems, MarketplaceItems, Users } from "../../helpers/schema";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    let query = db
      .selectFrom("marketplaceOrders")
      .innerJoin("users", "users.id", "marketplaceOrders.userId")
      .selectAll("marketplaceOrders")
      .select([
        "users.id as orderUserId",
        "users.businessName as orderUserBusinessName",
        "users.contactNumber as orderUserContactNumber",
      ])
      .orderBy("marketplaceOrders.createdAt", "desc");

    if (user.role !== "admin") {
      query = query.where("marketplaceOrders.userId", "=", user.id);
    }

    const orders = await query.execute();

    if (orders.length === 0) {
      return new Response(superjson.stringify({ orders: [] } satisfies OutputType));
    }

    const orderIds = orders.map((o) => o.id);

    const orderItems = await db
      .selectFrom("marketplaceOrderItems")
      .innerJoin("marketplaceItems", "marketplaceItems.id", "marketplaceOrderItems.itemId")
      .select([
        "marketplaceOrderItems.orderId",
        "marketplaceOrderItems.quantity",
        "marketplaceOrderItems.priceAtPurchase",
        "marketplaceOrderItems.subtotal",
        "marketplaceItems.name as itemName",
        "marketplaceItems.unit as itemUnit",
        "marketplaceItems.imageUrl as itemImageUrl",
      ])
      .where("marketplaceOrderItems.orderId", "in", orderIds)
      .execute();

    const itemsByOrderId = orderItems.reduce<Record<number, typeof orderItems>>((acc, item) => {
      if (!acc[item.orderId]) {
        acc[item.orderId] = [];
      }
      acc[item.orderId].push(item);
      return acc;
    }, {});

    const ordersWithDetails: OutputType['orders'] = orders.map((order) => ({
      ...order,
      user: {
        id: order.orderUserId,
        businessName: order.orderUserBusinessName,
        contactNumber: order.orderUserContactNumber,
      },
      items: itemsByOrderId[order.id] || [],
    }));

    return new Response(superjson.stringify({ orders: ordersWithDetails }));
  } catch (error) {
    console.error("Error fetching marketplace orders:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: `Failed to fetch marketplace orders: ${errorMessage}` }),
      { status: 500 }
    );
  }
}