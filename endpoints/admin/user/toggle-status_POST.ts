import { schema, OutputType } from "./toggle-status_POST.schema";
import superjson from 'superjson';
import { db } from '../../../helpers/db';
import { getServerUserSession } from '../../../helpers/getServerUserSession';

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);
    if (session.user?.role !== 'admin') {
      return new Response(superjson.stringify({ error: "Unauthorized: You must be an admin to perform this action." }), { status: 403 });
    }

    const json = superjson.parse(await request.text());
    const { userId } = schema.parse(json);

    if (session.user.id === userId) {
      return new Response(superjson.stringify({ error: "You cannot change your own status." }), { status: 400 });
    }

    const userToUpdate = await db.
    selectFrom('users').
    selectAll().
    where('id', '=', userId).
    executeTakeFirst();

    if (!userToUpdate) {
      return new Response(superjson.stringify({ error: "User not found." }), { status: 404 });
    }

    if (userToUpdate.role === 'admin') {
      return new Response(superjson.stringify({ error: "Admin users cannot be disabled." }), { status: 400 });
    }

    const updatedUser = await db.
    updateTable('users').
    set({ isActive: !userToUpdate.isActive }).
    where('id', '=', userId).
    returningAll().
    executeTakeFirstOrThrow();

    console.log(`Admin ${session.user.id} toggled status for user ${userId} to ${updatedUser.isActive}`);

    return new Response(superjson.stringify(updatedUser satisfies OutputType));
  } catch (error) {
    console.error("Error toggling user status:", error);
    if (error instanceof Error) {
      return new Response(superjson.stringify({ error: error.message }), { status: 400 });
    }
    return new Response(superjson.stringify({ error: "An unknown error occurred." }), { status: 500 });
  }
}