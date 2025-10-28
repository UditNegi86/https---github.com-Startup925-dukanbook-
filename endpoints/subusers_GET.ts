import { getServerUserSession } from "../helpers/getServerUserSession";
import { db } from "../helpers/db";
import superjson from "superjson";
import { OutputType } from "./subusers_GET.schema";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    // Only main users can fetch subusers. Subusers get an empty list.
    if (user.userType !== "main_user") {
      return new Response(superjson.stringify({ subusers: [] } satisfies OutputType));
    }

    const subusers = await db
      .selectFrom("subusers")
      .select(["id", "name", "username", "isActive", "createdAt"])
      .where("parentUserId", "=", user.id)
      .orderBy("createdAt", "desc")
      .execute();

    return new Response(superjson.stringify({ subusers } satisfies OutputType));
  } catch (error) {
    console.error("Failed to get subusers:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: 500 });
  }
}