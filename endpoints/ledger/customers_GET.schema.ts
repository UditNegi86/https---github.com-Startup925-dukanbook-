import { z } from "zod";
import superjson from "superjson";
import { EstimateWithItems } from "../estimates_GET.schema";

export const schema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type InputType = z.infer<typeof schema>;

export type CustomerLedgerEntry = {
  customerName: string;
  mobileNumber: string;
  estimates: EstimateWithItems[];
  totalAmountSpent: number;
  estimateCount: number;
  lastTransactionDate: Date;
};

export type OutputType = CustomerLedgerEntry[];

export const getLedgerCustomers = async (
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

  const result = await fetch(`/_api/ledger/customers?${queryString}`, {
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