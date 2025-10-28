import { getServerUserSession } from "../helpers/getServerUserSession";
import { db } from "../helpers/db";
import { schema, OutputType } from "./subusers_POST.schema";
import { generatePasswordHash } from "../helpers/generatePasswordHash";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    if (user.userType !== "main_user") {
      return new Response(superjson.stringify({ error: "Only main users can create subusers." }), { status: 403 });
    }

    const json = superjson.parse(await request.text());
    const { name, username, password } = schema.parse(json);

    // Check for username uniqueness for this parent user
    const existingSubuser = await db
      .selectFrom("subusers")
      .select("id")
      .where("username", "=", username)
      .where("parentUserId", "=", user.id)
      .executeTakeFirst();

    if (existingSubuser) {
      return new Response(superjson.stringify({ error: "Username already exists for this account." }), { status: 409 });
    }

    const passwordHash = await generatePasswordHash(password);

    const newSubuser = await db
      .insertInto("subusers")
      .values({
        name,
        username,
        passwordHash,
        parentUserId: user.id,
      })
      .returning(["id", "name", "username", "isActive", "createdAt"])
      .executeTakeFirstOrThrow();

    return new Response(superjson.stringify({ subuser: newSubuser } satisfies OutputType));
  } catch (error) {
    console.error("Failed to create subuser:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: 400 });
  }
}