import { schema, OutputType } from "./queries_GET.schema";
import superjson from 'superjson';
import { db } from '../../helpers/db';
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../../helpers/getSetServerSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (!user) {
      throw new NotAuthenticatedError();
    }
    if (user.role !== 'admin') {
      return new Response(superjson.stringify({ error: 'Not authorized' }), { status: 403 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    const validatedParams = schema.parse({ status: status || undefined });

    let query = db.selectFrom('userQueries')
      .leftJoin('users', 'userQueries.userId', 'users.id')
      .select([
        'userQueries.id',
        'userQueries.message',
        'userQueries.status',
        'userQueries.createdAt',
        'userQueries.updatedAt',
        'userQueries.name',
        'userQueries.contactNumber',
        'users.businessName',
        'users.ownerName as userOwnerName',
      ])
      .orderBy('userQueries.createdAt', 'desc');

    if (validatedParams.status) {
      query = query.where('userQueries.status', '=', validatedParams.status);
    }

    const queries = await query.execute();

    const result: OutputType = queries.map(q => ({
      id: q.id,
      userId: null,
      message: q.message,
      status: q.status,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
      name: q.name,
      contactNumber: q.contactNumber,
      businessName: q.businessName,
      userOwnerName: q.userOwnerName,
    }));

    return new Response(superjson.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error fetching admin queries:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    const statusCode = error instanceof NotAuthenticatedError ? 401 : 500;
    return new Response(superjson.stringify({ error: errorMessage }), { status: statusCode });
  }
}