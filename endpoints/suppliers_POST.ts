import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { schema, OutputType } from "./suppliers_POST.schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const validatedInput = schema.parse(json);

    const [newSupplier] = await db
      .insertInto("suppliers")
      .values({
        ...validatedInput,
        userId: user.id,
      })
      .returningAll()
      .execute();

    if (!newSupplier) {
      throw new Error("Failed to create supplier.");
    }

    return new Response(
      superjson.stringify({ supplier: newSupplier } satisfies OutputType)
    );
  } catch (error) {
    console.error("Error creating supplier:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
    });
  }
}