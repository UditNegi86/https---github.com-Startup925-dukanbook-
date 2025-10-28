import { z } from "zod";
import superjson from "superjson";
import { PurchaseWithItemsAndSupplier } from "../purchases_GET.schema";

export const schema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type InputType = z.infer<typeof schema>;

export type SupplierLedgerEntry = {
  supplierId: number;
  supplierName: string;
  contactNumber: string | null;
  email: string | null;
  purchases: PurchaseWithItemsAndSupplier[];
  totalAmountSpent: number;
  purchaseCount: number;
  lastTransactionDate: Date;
};

export type OutputType = SupplierLedgerEntry[];

export const getLedgerSuppliers = async (
  params?: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const searchParams = new URLSearchParams();
  if (params?.startDate) {
    searchParams.set("startDate", params.startDate);
  }
  if (params?.endDate) {
    searchParams.set("endDate", params.endDate);
  }
  const queryString = searchParams.toString();

  const result = await fetch(`/_api/ledger/suppliers?${queryString}`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse<{ error: string }>(
      await result.text()
    );
    throw new Error(errorObject.error);
  }
  return superjson.parse<OutputType>(await result.text());
};