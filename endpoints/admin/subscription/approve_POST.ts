import { db } from '../../../helpers/db';
import { getServerUserSession } from '../../../helpers/getServerUserSession';
import { schema, OutputType } from "./approve_POST.schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const { user: adminUser } = await getServerUserSession(request);

    if (adminUser.role !== "admin") {
      return new Response(
        superjson.stringify({ error: "Forbidden: Admins only." }),
        { status: 403 }
      );
    }

    const json = superjson.parse(await request.text());
    const { userId } = schema.parse(json);

    const updatedUser = await db.transaction().execute(async (trx) => {
      const targetUser = await trx.
      selectFrom("users").
      selectAll().
      where("id", "=", userId).
      executeTakeFirst();

      if (!targetUser) {
        throw new Error("User not found.");
      }

      if (targetUser.subscriptionStatus !== "pending") {
        throw new Error(
          `Cannot approve subscription. User status is '${
          targetUser.subscriptionStatus ?? "not set"}', not 'pending'.`

        );
      }

      if (!targetUser.subscriptionPlanMonths) {
        throw new Error(
          "Cannot approve subscription. Subscription plan duration is not set for the user."
        );
      }

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + targetUser.subscriptionPlanMonths);

      const result = await trx.
      updateTable("users").
      set({
        subscriptionStatus: "active",
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate
      }).
      where("id", "=", userId).
      returningAll().
      executeTakeFirstOrThrow();

      return result;
    });

    console.log(`Admin ${adminUser.id} approved subscription for user ${userId}`);
    return new Response(superjson.stringify(updatedUser satisfies OutputType), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error approving subscription:", error);
    const errorMessage =
    error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}