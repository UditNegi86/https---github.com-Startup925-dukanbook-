import { db } from "../../../helpers/db";
import { schema, OutputType } from "./delete_POST.schema";
import superjson from "superjson";
import { getServerUserSession } from "../../../helpers/getServerUserSession";

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
    const { id } = schema.parse(body);

    const result = await db
      .updateTable("marketplaceItems")
      .set({ isActive: false })
      .where("id", "=", id)
      .executeTakeFirst();

    if (result.numUpdatedRows === 0n) {
        return new Response(
            superjson.stringify({ error: "Item not found or no changes needed." }),
            { status: 404 }
        );
    }

    return new Response(superjson.stringify({ success: true, id } satisfies OutputType));
  } catch (error) {
    console.error("Error deleting marketplace item:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: `Failed to delete marketplace item: ${errorMessage}` }),
      { status: 500 }
    );
  }
}