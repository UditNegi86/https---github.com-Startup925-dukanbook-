import { db } from "../../helpers/db";
import { OutputType } from "./items_GET.schema";
import superjson from "superjson";
import { getServerUserSession } from "../../helpers/getServerUserSession";

export async function handle(request: Request) {
  try {
    // This endpoint is public for all authenticated users, so we just need to ensure a session exists.
    await getServerUserSession(request);

    const items = await db
      .selectFrom("marketplaceItems")
      .selectAll()
      .where("isActive", "=", true)
      .orderBy("createdAt", "desc")
      .execute();

    return new Response(superjson.stringify({ items } satisfies OutputType));
  } catch (error) {
    // If getServerUserSession throws, it's an auth error.
    if (error instanceof Error && error.message.includes("Not authenticated")) {
      return new Response(
        superjson.stringify({ error: "Authentication required" }),
        { status: 401 }
      );
    }
    
    console.error("Error fetching marketplace items:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: `Failed to fetch marketplace items: ${errorMessage}` }),
      { status: 500 }
    );
  }
}