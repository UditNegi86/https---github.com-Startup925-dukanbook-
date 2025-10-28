import { db } from "../../../helpers/db";
import { schema, OutputType } from "./delete_POST.schema";
import superjson from "superjson";
import { getServerUserSession } from "../../../helpers/getServerUserSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    
    if (user.role !== "admin") {
      return new Response(
        superjson.stringify({ error: "Unauthorized" }),
        { status: 403 }
      );
    }

    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // The database schema should have cascading delete on the foreign key
    // from estimate_items to estimates. This means we only need to delete
    // the estimate record.
    const result = await db
      .deleteFrom("estimates")
      .where("id", "=", input.id)
      // No userId check for admin
      .executeTakeFirst();

    if (result.numDeletedRows === 0n) {
      return new Response(
        superjson.stringify({
          error: `Estimate with id ${input.id} not found or already deleted.`,
        }),
        { status: 404 }
      );
    }

    return new Response(
      superjson.stringify({ success: true, id: input.id } satisfies OutputType)
    );
  } catch (error) {
    console.error("Error deleting estimate by admin:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: `Failed to delete estimate: ${errorMessage}` }),
      { status: 400 }
    );
  }
}