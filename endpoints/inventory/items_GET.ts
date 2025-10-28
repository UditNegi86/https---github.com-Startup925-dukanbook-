import { db } from "../../helpers/db";
import { OutputType } from "./items_GET.schema";
import superjson from "superjson";
import { getServerUserSession } from "../../helpers/getServerUserSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    const items = await db
      .selectFrom("inventoryItems")
      .selectAll()
      .where("userId", "=", user.id)
      .orderBy("itemName", "asc")
      .execute();

    return new Response(superjson.stringify({ items } satisfies OutputType));
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: `Failed to fetch inventory items: ${errorMessage}` }),
      { status: 500 }
    );
  }
}