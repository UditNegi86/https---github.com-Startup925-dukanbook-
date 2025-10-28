import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType } from "./delete_POST.schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const { id } = schema.parse(json);

    // Check for associated purchases before deleting
    const purchases = await db
      .selectFrom("purchases")
      .select("id")
      .where("supplierId", "=", id)
      .where("userId", "=", user.id)
      .limit(1)
      .execute();

    if (purchases.length > 0) {
      throw new Error(
        "Cannot delete supplier with associated purchases. Please delete the purchases first."
      );
    }

    const result = await db
      .deleteFrom("suppliers")
      .where("id", "=", id)
      .where("userId", "=", user.id)
      .executeTakeFirst();

    if (result.numDeletedRows === 0n) {
      throw new Error("Supplier not found or you do not have permission to delete it.");
    }

    return new Response(
      superjson.stringify({ success: true, id } satisfies OutputType)
    );
  } catch (error) {
    console.error("Error deleting supplier:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
    });
  }
}