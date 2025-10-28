import { schema, OutputType } from "./update-status_POST.schema";
import superjson from 'superjson';
import { db } from '../../../helpers/db';
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../../../helpers/getSetServerSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (!user) {
      throw new NotAuthenticatedError();
    }
    if (user.role !== 'admin') {
      return new Response(superjson.stringify({ error: 'Not authorized' }), { status: 403 });
    }

    const json = superjson.parse(await request.text());
    const { id, status } = schema.parse(json);

    const [updatedQuery] = await db
      .updateTable('userQueries')
      .set({
        status,
        updatedAt: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .execute();

    if (!updatedQuery) {
      return new Response(superjson.stringify({ error: `Query with ID ${id} not found.` }), { status: 404 });
    }

    return new Response(superjson.stringify(updatedQuery satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error updating query status:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    const statusCode = error instanceof NotAuthenticatedError ? 401 : 400;
    return new Response(superjson.stringify({ error: errorMessage }), { status: statusCode });
  }
}