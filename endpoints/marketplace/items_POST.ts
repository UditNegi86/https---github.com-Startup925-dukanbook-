import { db } from "../../helpers/db";
import { schema, OutputType } from "./items_POST.schema";
import superjson from "superjson";
import { getServerUserSession } from "../../helpers/getServerUserSession";

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
    const validatedData = schema.parse(body);

    const newItem = await db
      .insertInto("marketplaceItems")
      .values({
        createdByUserId: user.id,
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price.toString(),
        imageUrl: validatedData.imageUrl,
        category: validatedData.category,
        stockQuantity: validatedData.stockQuantity,
        unit: validatedData.unit,
        isActive: true, // New items are active by default
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return new Response(superjson.stringify({ item: newItem } satisfies OutputType), { status: 201 });
  } catch (error) {
    console.error("Error creating marketplace item:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: `Failed to create marketplace item: ${errorMessage}` }),
      { status: 500 }
    );
  }
}