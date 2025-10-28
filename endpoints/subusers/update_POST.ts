import { getServerUserSession } from "../../helpers/getServerUserSession";
import { db } from "../../helpers/db";
import { schema, OutputType } from "./update_POST.schema";
import { generatePasswordHash } from "../../helpers/generatePasswordHash";
import superjson from "superjson";
import { sql } from "kysely";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    if (user.userType !== "main_user") {
      return new Response(superjson.stringify({ error: "Only main users can update subusers." }), { status: 403 });
    }

    const json = superjson.parse(await request.text());
    const { subuserId, name, username, password, isActive } = schema.parse(json);

    // Verify ownership of the subuser
    const subuserToUpdate = await db
      .selectFrom("subusers")
      .select("id")
      .where("id", "=", subuserId)
      .where("parentUserId", "=", user.id)
      .executeTakeFirst();

    if (!subuserToUpdate) {
      return new Response(superjson.stringify({ error: "Subuser not found or you do not have permission to update it." }), { status: 404 });
    }

    // Check for username uniqueness if it's being changed
    const existingUsername = await db
      .selectFrom("subusers")
      .select("id")
      .where("username", "=", username)
      .where("parentUserId", "=", user.id)
      .where("id", "!=", subuserId) // Exclude the current subuser from the check
      .executeTakeFirst();

    if (existingUsername) {
      return new Response(superjson.stringify({ error: "Username already exists for this account." }), { status: 409 });
    }

    let passwordHash: string | undefined;
    if (password) {
      passwordHash = await generatePasswordHash(password);
    }

    const updatedSubuser = await db
      .updateTable("subusers")
      .set({
        name,
        username,
        isActive,
        passwordHash: passwordHash, // Kysely handles undefined by not including it in the update
        updatedAt: sql`now()`,
      })
      .where("id", "=", subuserId)
      .returning(["id", "name", "username", "isActive", "createdAt"])
      .executeTakeFirstOrThrow();

    return new Response(superjson.stringify({ subuser: updatedSubuser } satisfies OutputType));
  } catch (error) {
    console.error("Failed to update subuser:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: 400 });
  }
}