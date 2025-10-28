import { schema, OutputType } from "./request_POST.schema";
import superjson from 'superjson';
import { db } from '../../helpers/db';
import { getServerUserSession } from '../../helpers/getServerUserSession';

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + input.planMonths);

    await db
      .updateTable('users')
      .set({
        subscriptionStatus: 'pending',
        subscriptionPlanMonths: input.planMonths,
        lastPaymentAmount: input.amount.toString(),
        lastPaymentDate: now,
        subscriptionStartDate: now,
        subscriptionEndDate: endDate,
      })
      .where('id', '=', user.id)
      .execute();

    return new Response(superjson.stringify({ message: "Subscription request received successfully." } satisfies OutputType), { status: 200 });
  } catch (error) {
    console.error("Error processing subscription request:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return new Response(superjson.stringify({ error: errorMessage }), { status: 400 });
  }
}