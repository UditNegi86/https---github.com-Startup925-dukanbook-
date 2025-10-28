import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { OutputType, PurchaseWithItemsAndSupplier } from "./purchases_GET.schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    const purchases = await db
      .selectFrom("purchases")
      .selectAll("purchases")
      .where("purchases.userId", "=", user.id)
      .orderBy("purchases.purchaseDate", "desc")
      .execute();

    const purchaseIds = purchases.map((p) => p.id);
    const supplierIds = purchases.map((p) => p.supplierId);

    const [items, suppliers] = await Promise.all([
      purchaseIds.length > 0
        ? db
            .selectFrom("purchaseItems")
            .selectAll()
            .where("purchaseId", "in", purchaseIds)
            .execute()
        : Promise.resolve([]),
      supplierIds.length > 0
        ? db
            .selectFrom("suppliers")
            .selectAll()
            .where("id", "in", supplierIds)
            .execute()
        : Promise.resolve([]),
    ]);

    const itemsByPurchaseId = items.reduce((acc, item) => {
      if (!acc[item.purchaseId]) {
        acc[item.purchaseId] = [];
      }
      acc[item.purchaseId].push(item);
      return acc;
    }, {} as Record<number, typeof items>);

    const suppliersById = suppliers.reduce((acc, supplier) => {
      acc[supplier.id] = supplier;
      return acc;
    }, {} as Record<number, typeof suppliers[0]>);

    const responseData: PurchaseWithItemsAndSupplier[] = purchases.map((purchase) => ({
      ...purchase,
      items: itemsByPurchaseId[purchase.id] || [],
      supplier: suppliersById[purchase.supplierId],
    }));

    return new Response(superjson.stringify({ purchases: responseData } satisfies OutputType));
  } catch (error) {
    console.error("Error fetching purchases:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}