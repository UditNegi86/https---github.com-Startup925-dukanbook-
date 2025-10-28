import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Estimates, Purchases, Suppliers } from "../../helpers/schema";

export const schema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export type InputType = z.infer<typeof schema>;

type IncomeTransaction = Pick<
  Selectable<Estimates>,
  "date" | "customerName" | "estimateNumber" | "totalAmount" | "paymentType"
>;

type ExpenseTransaction = {
  date: Selectable<Purchases>["purchaseDate"];
  supplierName: Selectable<Suppliers>["supplierName"];
  billNumber: Selectable<Purchases>["billNumber"];
  totalAmount: Selectable<Purchases>["totalAmount"];
  paymentStatus: Selectable<Purchases>["paymentStatus"];
};

export type OutputType = {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    taxCollected: number;
    discountGiven: number;
  };
  dailyBreakdown: {
    date: string;
    income: number;
    expenses: number;
    profit: number;
  }[];
  incomeTransactions: IncomeTransaction[];
  expenseTransactions: ExpenseTransaction[];
};

export const getIncomeExpenseReport = async (
  params: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedParams = schema.parse(params);
  const searchParams = new URLSearchParams({
    startDate: validatedParams.startDate.toISOString(),
    endDate: validatedParams.endDate.toISOString(),
  });

  const result = await fetch(`/_api/reports/income-expense?${searchParams.toString()}`, {
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