import { useQuery } from "@tanstack/react-query";
import { getIncomeExpenseReport } from "../endpoints/reports/income-expense_GET.schema";
import { getCashFlowReport } from "../endpoints/reports/cash-flow_GET.schema";

export const useIncomeExpenseReport = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ["reports", "income-expense", startDate.toISOString(), endDate.toISOString()],
    queryFn: () => getIncomeExpenseReport({ startDate, endDate }),
    enabled: !!startDate && !!endDate,
  });
};

export const useCashFlowReport = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ["reports", "cash-flow", startDate.toISOString(), endDate.toISOString()],
    queryFn: () => getCashFlowReport({ startDate, endDate }),
    enabled: !!startDate && !!endDate,
  });
};