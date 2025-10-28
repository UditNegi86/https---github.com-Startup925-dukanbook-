import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInventoryItems,
} from "../endpoints/inventory/items_GET.schema";
import {
  postInventoryItems,
  InputType as CreateInputType,
} from "../endpoints/inventory/items_POST.schema";
import {
  postInventoryItemsUpdate,
  InputType as UpdateInputType,
} from "../endpoints/inventory/items/update_POST.schema";
import {
  postInventoryItemsDelete,
  InputType as DeleteInputType,
} from "../endpoints/inventory/items/delete_POST.schema";
import { toast } from "sonner";

const INVENTORY_QUERY_KEY = ["inventory", "items"];

export const useInventoryItems = () => {
  return useQuery({
    queryKey: INVENTORY_QUERY_KEY,
    queryFn: () => getInventoryItems(),
    select: (data) => data.items,
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newItem: CreateInputType) => postInventoryItems(newItem),
    onSuccess: () => {
      toast.success("Inventory item created successfully.");
      return queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Failed to create item: ${error.message}`);
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: UpdateInputType) => postInventoryItemsUpdate(item),
    onSuccess: () => {
      toast.success("Inventory item updated successfully.");
      return queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Failed to update item: ${error.message}`);
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: DeleteInputType) => postInventoryItemsDelete(item),
    onSuccess: () => {
      toast.success("Inventory item deleted successfully.");
      return queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Failed to delete item: ${error.message}`);
    },
  });
};