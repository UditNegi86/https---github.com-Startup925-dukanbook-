import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { OutputType } from "./suppliers_GET.schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    const suppliers = await db
      .selectFrom("suppliers")
      .selectAll()
      .where("userId", "=", user.id)
      .orderBy("supplierName", "asc")
      .execute();

    return new Response(superjson.stringify({ suppliers } satisfies OutputType));
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}