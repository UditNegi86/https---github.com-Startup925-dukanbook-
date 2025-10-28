import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  getLedgerCustomers,
  InputType as LedgerInput,
} from "../endpoints/ledger/customers_GET.schema";
import { getLedgerSuppliers } from "../endpoints/ledger/suppliers_GET.schema";

export const ledgerQueryKeys = {
  all: ["ledger"] as const,
  lists: () => [...ledgerQueryKeys.all, "list"] as const,
  list: (filters: LedgerInput) =>
    [...ledgerQueryKeys.lists(), filters] as const,
};

export const useCustomersLedger = (filters: LedgerInput = {}) => {
  return useQuery({
    queryKey: ledgerQueryKeys.list(filters),
    queryFn: () => getLedgerCustomers(filters),
    placeholderData: keepPreviousData,
  });
};

export const supplierLedgerQueryKeys = {
  all: ["supplierLedger"] as const,
  lists: () => [...supplierLedgerQueryKeys.all, "list"] as const,
  list: (filters: LedgerInput) =>
    [...supplierLedgerQueryKeys.lists(), filters] as const,
};

export const useSuppliersLedger = (filters: LedgerInput = {}) => {
  return useQuery({
    queryKey: supplierLedgerQueryKeys.list(filters),
    queryFn: () => getLedgerSuppliers(filters),
    placeholderData: keepPreviousData,
  });
};