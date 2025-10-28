import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType } from "./delete_POST.schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const { id } = schema.parse(json);

    const result = await db.transaction().execute(async (trx) => {
      // First, delete associated items
      await trx
        .deleteFrom("purchaseItems")
        .where("purchaseId", "=", id)
        .execute();

      // Then, delete the purchase itself, ensuring user ownership
      const deleteResult = await trx
        .deleteFrom("purchases")
        .where("id", "=", id)
        .where("userId", "=", user.id)
        .executeTakeFirst();

      return deleteResult;
    });

    if (result.numDeletedRows === 0n) {
      throw new Error("Purchase not found or you do not have permission to delete it.");
    }

    return new Response(
      superjson.stringify({ success: true, id } satisfies OutputType)
    );
  } catch (error) {
    console.error("Error deleting purchase:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
    });
  }
}