import { getServerUserSession } from "../../helpers/getServerUserSession";
import { db } from "../../helpers/db";
import { schema, OutputType } from "./delete_POST.schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    if (user.userType !== "main_user") {
      return new Response(superjson.stringify({ error: "Only main users can delete subusers." }), { status: 403 });
    }

    const json = superjson.parse(await request.text());
    const { subuserId } = schema.parse(json);

    const result = await db
      .deleteFrom("subusers")
      .where("id", "=", subuserId)
      .where("parentUserId", "=", user.id)
      .executeTakeFirst();

    if (result.numDeletedRows === 0n) {
      return new Response(superjson.stringify({ error: "Subuser not found or you do not have permission to delete it." }), { status: 404 });
    }

    return new Response(superjson.stringify({ success: true } satisfies OutputType));
  } catch (error) {
    console.error("Failed to delete subuser:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: 400 });
  }
}