import { db } from "../../../helpers/db";
import { schema, OutputType } from "./update_POST.schema";
import superjson from "superjson";
import { getServerUserSession } from "../../../helpers/getServerUserSession";

export async function handle(request: Request) {
  try {
    const { user: adminUser } = await getServerUserSession(request);

    if (adminUser.role !== "admin") {
      return new Response(
        superjson.stringify({ error: "Unauthorized" }),
        { status: 403 }
      );
    }

    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    const { userId, ...updates } = input;

    // Prevent an admin from demoting themselves
    if (userId === adminUser.id && updates.role && updates.role !== "admin") {
      return new Response(
        superjson.stringify({ error: "Admins cannot demote themselves." }),
        { status: 400 }
      );
    }

    const updatedUser = await db
      .updateTable("users")
      .set(updates)
      .where("id", "=", userId)
      .returningAll()
      .executeTakeFirstOrThrow();

    return new Response(superjson.stringify(updatedUser satisfies OutputType));
  } catch (error) {
    console.error("Error updating user by admin:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: `Failed to update user: ${errorMessage}` }),
      { status: 400 }
    );
  }
}