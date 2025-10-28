import { db } from "../../../helpers/db";
import { schema, OutputType } from "./delete_POST.schema";
import superjson from "superjson";
import { getServerUserSession } from "../../../helpers/getServerUserSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    if (!user.isActive) {
      return new Response(
        superjson.stringify({ error: "User account is not active" }),
        { status: 403 }
      );
    }

    const body = superjson.parse(await request.text());
    const validatedData = schema.parse(body);

    const result = await db
      .deleteFrom("inventoryItems")
      .where("id", "=", validatedData.id)
      .where("userId", "=", user.id)
      .executeTakeFirst();

    if (result.numDeletedRows === 0n) {
      return new Response(
        superjson.stringify({ error: "Item not found or unauthorized" }),
        { status: 404 }
      );
    }

    return new Response(superjson.stringify({ success: true } satisfies OutputType));
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: `Failed to delete inventory item: ${errorMessage}` }),
      { status: 500 }
    );
  }
}