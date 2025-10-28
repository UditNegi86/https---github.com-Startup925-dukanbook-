import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSuppliers } from "../endpoints/suppliers_GET.schema";
import {
  postSuppliers,
  InputType as CreateInputType,
} from "../endpoints/suppliers_POST.schema";
import {
  postSuppliersUpdate,
  InputType as UpdateInputType,
} from "../endpoints/suppliers/update_POST.schema";
import {
  postSuppliersDelete,
  InputType as DeleteInputType,
} from "../endpoints/suppliers/delete_POST.schema";
import { toast } from "sonner";

export const SUPPLIERS_QUERY_KEY = ["suppliers"];

export const useSuppliers = () => {
  return useQuery({
    queryKey: SUPPLIERS_QUERY_KEY,
    queryFn: () => getSuppliers(),
    select: (data) => data.suppliers,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newSupplier: CreateInputType) => postSuppliers(newSupplier),
    onSuccess: () => {
      toast.success("Supplier created successfully.");
      return queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Failed to create supplier: ${error.message}`);
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (supplier: UpdateInputType) => postSuppliersUpdate(supplier),
    onSuccess: () => {
      toast.success("Supplier updated successfully.");
      return queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Failed to update supplier: ${error.message}`);
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (supplier: DeleteInputType) => postSuppliersDelete(supplier),
    onSuccess: () => {
      toast.success("Supplier deleted successfully.");
      return queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Failed to delete supplier: ${error.message}`);
    },
  });
};