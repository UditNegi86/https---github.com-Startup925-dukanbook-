import { db } from "../../helpers/db";
import { schema, OutputType } from "./delete_POST.schema";
import superjson from "superjson";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { Transaction } from "kysely";
import { DB } from "../../helpers/schema";

async function deleteEstimateWithInventoryRestore(
  trx: Transaction<DB>,
  estimateId: number,
  userId: number
) {
  // Check if the estimate has been converted to a bill
  const estimate = await trx
    .selectFrom("estimates")
    .select(["billNumber"])
    .where("id", "=", estimateId)
    .where("userId", "=", userId)
    .executeTakeFirst();

  if (estimate && estimate.billNumber) {
    throw new Error("Cannot delete an estimate that has been converted to a bill");
  }

  // Fetch all items associated with the estimate to restore inventory
  const estimateItems = await trx
    .selectFrom("estimateItems")
    .selectAll()
    .where("estimateId", "=", estimateId)
    .execute();

  // Restore inventory quantities for items with inventoryItemId
  for (const item of estimateItems) {
    if (item.inventoryItemId) {
      await trx
        .updateTable("inventoryItems")
        .set((eb) => ({
          quantity: eb("quantity", "+", item.quantity),
          updatedAt: new Date(),
        }))
        .where("id", "=", item.inventoryItemId)
        .where("userId", "=", userId)
        .execute();
    }
  }

  // Delete the estimate (cascade will delete estimate_items)
  const result = await trx
    .deleteFrom("estimates")
    .where("id", "=", estimateId)
    .where("userId", "=", userId)
    .executeTakeFirst();

  return result;
}

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    
    if (user.isActive === false) {
      return new Response(
        superjson.stringify({ error: "Your account is disabled. Please contact admin for access." }),
        { status: 403 }
      );
    }
    
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    const result = await db.transaction().execute((trx) =>
      deleteEstimateWithInventoryRestore(trx, input.id, user.id)
    );

    if (result.numDeletedRows === 0n) {
      return new Response(
        superjson.stringify({
          error: `Estimate with id ${input.id} not found or already deleted.`,
        }),
        { status: 404 }
      );
    }

    return new Response(
      superjson.stringify({ success: true, id: input.id } satisfies OutputType)
    );
  } catch (error) {
    console.error("Error deleting estimate:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: `Failed to delete estimate: ${errorMessage}` }),
      { status: 400 }
    );
  }
}