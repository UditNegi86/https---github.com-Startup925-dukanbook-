import { db } from "../../../helpers/db";
import { schema, OutputType } from "./update_POST.schema";
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
    const { id, ...updateData } = schema.parse(body);

    const updateObject: { [key: string]: any } = { ...updateData };
    if (updateData.price !== undefined) {
      updateObject.price = updateData.price.toString();
    }

    const updatedItem = await db
      .updateTable("marketplaceItems")
      .set(updateObject)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return new Response(superjson.stringify({ item: updatedItem } satisfies OutputType));
  } catch (error) {
    console.error("Error updating marketplace item:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: `Failed to update marketplace item: ${errorMessage}` }),
      { status: 500 }
    );
  }
}