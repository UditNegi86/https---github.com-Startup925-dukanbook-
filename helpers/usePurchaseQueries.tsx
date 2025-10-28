import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPurchases } from "../endpoints/purchases_GET.schema";
import {
  postPurchases,
  InputType as CreateInputType,
} from "../endpoints/purchases_POST.schema";
import {
  postPurchasesUpdate,
  InputType as UpdateInputType,
} from "../endpoints/purchases/update_POST.schema";
import {
  postPurchasesDelete,
  InputType as DeleteInputType,
} from "../endpoints/purchases/delete_POST.schema";
import { toast } from "sonner";

export const PURCHASES_QUERY_KEY = ["purchases"];

export const usePurchases = () => {
  return useQuery({
    queryKey: PURCHASES_QUERY_KEY,
    queryFn: () => getPurchases(),
    select: (data) => data.purchases,
  });
};

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newPurchase: CreateInputType) => postPurchases(newPurchase),
    onSuccess: () => {
      toast.success("Purchase created successfully.");
      return queryClient.invalidateQueries({ queryKey: PURCHASES_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Failed to create purchase: ${error.message}`);
    },
  });
};

export const useUpdatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (purchase: UpdateInputType) => postPurchasesUpdate(purchase),
    onSuccess: () => {
      toast.success("Purchase updated successfully.");
      return queryClient.invalidateQueries({ queryKey: PURCHASES_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Failed to update purchase: ${error.message}`);
    },
  });
};

export const useDeletePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (purchase: DeleteInputType) => postPurchasesDelete(purchase),
    onSuccess: () => {
      toast.success("Purchase deleted successfully.");
      return queryClient.invalidateQueries({ queryKey: PURCHASES_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Failed to delete purchase: ${error.message}`);
    },
  });
};