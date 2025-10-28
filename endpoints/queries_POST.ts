import { schema, OutputType } from "./queries_POST.schema";
import superjson from 'superjson';
import { db } from '../helpers/db';
import { getServerUserSession } from "../helpers/getServerUserSession";

export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const validatedInput = schema.parse(json);
    const { message } = validatedInput;

    let userId: number | null = null;
    let name: string | null = validatedInput.name || null;
    let contactNumber: string | null = validatedInput.contactNumber || null;

    try {
      const sessionInfo = await getServerUserSession(request);
      if (sessionInfo.user) {
        userId = sessionInfo.user.id;
        name = sessionInfo.user.ownerName;
        contactNumber = sessionInfo.user.contactNumber;
      }
    } catch (error) {
      // User is not logged in, proceed as guest
      console.log("User not authenticated, creating guest query.");
    }

    const [newQuery] = await db
      .insertInto('userQueries')
      .values({
        userId,
        name,
        contactNumber,
        message,
        status: 'new',
      })
      .returningAll()
      .execute();

    return new Response(superjson.stringify(newQuery satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error creating query:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: 400 });
  }
}