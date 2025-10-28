import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType } from "./update_POST.schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const { id, ...updateData } = schema.parse(json);

    const [updatedSupplier] = await db
      .updateTable("suppliers")
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where("id", "=", id)
      .where("userId", "=", user.id) // Ensure user owns the supplier
      .returningAll()
      .execute();

    if (!updatedSupplier) {
      throw new Error("Supplier not found or you do not have permission to update it.");
    }

    return new Response(
      superjson.stringify({ supplier: updatedSupplier } satisfies OutputType)
    );
  } catch (error) {
    console.error("Error updating supplier:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
    });
  }
}