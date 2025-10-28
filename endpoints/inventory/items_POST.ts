import { db } from "../../helpers/db";
import { schema, OutputType } from "./items_POST.schema";
import superjson from "superjson";
import { getServerUserSession } from "../../helpers/getServerUserSession";

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

    const newItem = await db
      .insertInto("inventoryItems")
      .values({
        userId: user.id,
        itemName: validatedData.itemName,
        quantity: validatedData.quantity.toString(),
        purchaseValue: validatedData.purchaseValue.toString(),
        salesValue: validatedData.salesValue.toString(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return new Response(superjson.stringify({ item: newItem } satisfies OutputType));
  } catch (error) {
    console.error("Error creating inventory item:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: `Failed to create inventory item: ${errorMessage}` }),
      { status: 500 }
    );
  }
}