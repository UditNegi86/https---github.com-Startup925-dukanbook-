import { db } from "../../helpers/db";
import { OutputType, schema } from "./suppliers_GET.schema";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Purchases, PurchaseItems, Suppliers } from "../../helpers/schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    const url = new URL(request.url);
    const { startDate, endDate } = schema.parse({
      startDate: url.searchParams.get("startDate") || undefined,
      endDate: url.searchParams.get("endDate") || undefined,
    });

    let query = db
      .selectFrom("purchases")
      .innerJoin("suppliers", "suppliers.id", "purchases.supplierId")
      .selectAll("purchases")
      .select([
        "suppliers.id as supplierId",
        "suppliers.supplierName",
        "suppliers.contactNumber",
        "suppliers.email",
        "suppliers.address",
        "suppliers.gstNumber",
      ])
      .where("purchases.userId", "=", user.id)
      .orderBy("purchases.purchaseDate", "desc");

    if (startDate) {
      query = query.where("purchases.purchaseDate", ">=", new Date(startDate));
    }
    if (endDate) {
      const inclusiveEndDate = new Date(endDate);
      inclusiveEndDate.setDate(inclusiveEndDate.getDate() + 1);
      query = query.where("purchases.purchaseDate", "<", inclusiveEndDate);
    }

    const purchasesWithSupplier = await query.execute();

    if (purchasesWithSupplier.length === 0) {
      return new Response(superjson.stringify([] satisfies OutputType));
    }

    const purchaseIds = purchasesWithSupplier.map((p) => p.id);
    const items = await db
      .selectFrom("purchaseItems")
      .selectAll()
      .where("purchaseId", "in", purchaseIds)
      .execute();

    const itemsByPurchaseId = items.reduce<
      Record<number, Selectable<PurchaseItems>[]>
    >((acc, item) => {
      if (!acc[item.purchaseId]) {
        acc[item.purchaseId] = [];
      }
      acc[item.purchaseId].push(item);
      return acc;
    }, {});

    const suppliersMap = new Map<number, OutputType[number]>();

    for (const p of purchasesWithSupplier) {
      const supplierId = p.supplierId;

      if (!suppliersMap.has(supplierId)) {
        suppliersMap.set(supplierId, {
          supplierId: supplierId,
          supplierName: p.supplierName,
          contactNumber: p.contactNumber,
          email: p.email,
          purchases: [],
          totalAmountSpent: 0,
          purchaseCount: 0,
          lastTransactionDate: new Date(0),
        });
      }

      const supplierLedger = suppliersMap.get(supplierId)!;

      const purchaseData: Selectable<Purchases> = {
        id: p.id,
        userId: p.userId,
        supplierId: p.supplierId,
        purchaseDate: p.purchaseDate,
        billNumber: p.billNumber,
        totalAmount: p.totalAmount,
        paymentStatus: p.paymentStatus,
        paymentDate: p.paymentDate,
        paymentDueDate: p.paymentDueDate,
        paymentMode: p.paymentMode,
        paymentReference: p.paymentReference,
        notes: p.notes,
        billFileData: p.billFileData,
        billFileName: p.billFileName,
        billFileType: p.billFileType,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };

      const supplierData: Selectable<Suppliers> = {
        id: p.supplierId,
        userId: p.userId,
        supplierName: p.supplierName,
        contactNumber: p.contactNumber,
        email: p.email,
        address: p.address,
        gstNumber: p.gstNumber,
        notes: null, // Not fetched in main query, can be null
        createdAt: null, // Not fetched
        updatedAt: null, // Not fetched
      };

      supplierLedger.purchases.push({
        ...purchaseData,
        items: itemsByPurchaseId[p.id] || [],
        supplier: supplierData,
      });

      supplierLedger.totalAmountSpent += Number(p.totalAmount);
      supplierLedger.purchaseCount += 1;
      if (new Date(p.purchaseDate) > new Date(supplierLedger.lastTransactionDate)) {
        supplierLedger.lastTransactionDate = p.purchaseDate;
      }
    }

    const result = Array.from(suppliersMap.values());
    result.sort(
      (a, b) =>
        new Date(b.lastTransactionDate).getTime() -
        new Date(a.lastTransactionDate).getTime()
    );

    return new Response(superjson.stringify(result));
  } catch (error) {
    console.error("Error fetching supplier ledger:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({
        error: `Failed to fetch supplier ledger: ${errorMessage}`,
      }),
      { status: 500 }
    );
  }
}