import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export type InputType = z.infer<typeof schema>;

type CashTransaction = {
  date: Date;
  source?: string;
  purpose?: string;
  estimateNumber?: string | null;
  billNumber?: string | null;
  paymentMethod: string | null;
  amount: number | string;
};

export type OutputType = {
  summary: {
    openingBalance: number;
    totalInflow: number;
    totalOutflow: number;
    netCashFlow: number;
    closingBalance: number;
    inflowByPaymentMethod: Record<string, number>;
    outflowByPaymentMethod: Record<string, number>;
  };
  dailyBreakdown: {
    date: string;
    cashIn: number;
    cashOut: number;
    runningBalance: number;
  }[];
  inflowTransactions: CashTransaction[];
  outflowTransactions: CashTransaction[];
};

export const getCashFlowReport = async (
  params: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedParams = schema.parse(params);
  const searchParams = new URLSearchParams({
    startDate: validatedParams.startDate.toISOString(),
    endDate: validatedParams.endDate.toISOString(),
  });

  const result = await fetch(`/_api/reports/cash-flow?${searchParams.toString()}`, {
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