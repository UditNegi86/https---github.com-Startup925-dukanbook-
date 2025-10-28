import { db } from "../../../helpers/db";
import { schema, OutputType } from "./reset-pin_POST.schema";
import superjson from "superjson";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { generatePasswordHash } from "../../../helpers/generatePasswordHash";
import { ZodError } from "zod";

export async function handle(request: Request) {
  try {
    const { user: adminUser } = await getServerUserSession(request);

    if (adminUser.role !== "admin") {
      return new Response(
        superjson.stringify({ error: "Unauthorized: Admin access required." }),
        { status: 403 }
      );
    }

    const json = superjson.parse(await request.text());
    const { userId, newPin } = schema.parse(json);

    const passwordHash = await generatePasswordHash(newPin);

    const result = await db
      .updateTable("userPasswords")
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where("userId", "=", userId)
      .returning("userId")
      .executeTakeFirst();

    if (!result) {
      return new Response(
        superjson.stringify({ error: `User with ID ${userId} not found.` }),
        { status: 404 }
      );
    }

    return new Response(
      superjson.stringify({
        success: true,
        message: `Successfully reset PIN for user ID ${userId}.`,
      } satisfies OutputType)
    );
  } catch (error) {
    console.error("Error resetting user PIN by admin:", error);
    if (error instanceof ZodError) {
      return new Response(
        superjson.stringify({ error: "Invalid input.", issues: error.errors }),
        { status: 400 }
      );
    }
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: `Failed to reset PIN: ${errorMessage}` }),
      { status: 500 }
    );
  }
}