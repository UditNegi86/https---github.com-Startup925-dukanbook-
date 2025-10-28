import { db } from "../../../helpers/db";
import { schema, OutputType } from "./update_POST.schema";
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

    // First, verify the item exists and belongs to the user
    const existingItem = await db
      .selectFrom("inventoryItems")
      .selectAll()
      .where("id", "=", validatedData.id)
      .executeTakeFirst();

    if (!existingItem) {
      return new Response(
        superjson.stringify({ error: "Item not found" }),
        { status: 404 }
      );
    }

    if (existingItem.userId !== user.id) {
      return new Response(
        superjson.stringify({ error: "Unauthorized to update this item" }),
        { status: 403 }
      );
    }

    // Build update object with only provided fields
    const updateData: {
      itemName?: string;
      quantity?: string;
      purchaseValue?: string;
      salesValue?: string;
    } = {};

    if (validatedData.itemName !== undefined) {
      updateData.itemName = validatedData.itemName;
    }
    if (validatedData.quantity !== undefined) {
      updateData.quantity = validatedData.quantity.toString();
    }
    if (validatedData.purchaseValue !== undefined) {
      updateData.purchaseValue = validatedData.purchaseValue.toString();
    }
    if (validatedData.salesValue !== undefined) {
      updateData.salesValue = validatedData.salesValue.toString();
    }

    const updatedItem = await db
      .updateTable("inventoryItems")
      .set(updateData)
      .where("id", "=", validatedData.id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return new Response(superjson.stringify({ item: updatedItem } satisfies OutputType));
  } catch (error) {
    console.error("Error updating inventory item:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: `Failed to update inventory item: ${errorMessage}` }),
      { status: 500 }
    );
  }
}