import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getMarketplaceItems } from "../endpoints/marketplace/items_GET.schema";
import { postMarketplaceItems, InputType as CreateItemInput } from "../endpoints/marketplace/items_POST.schema";
import { postMarketplaceItemsUpdate, InputType as UpdateItemInput } from "../endpoints/marketplace/items/update_POST.schema";
import { postMarketplaceItemsDelete, InputType as DeleteItemInput } from "../endpoints/marketplace/items/delete_POST.schema";
import { getMarketplaceOrders } from "../endpoints/marketplace/orders_GET.schema";
import { postMarketplaceOrders, InputType as CreateOrderInput } from "../endpoints/marketplace/orders_POST.schema";
import { postMarketplaceOrdersUpdateStatus, InputType as UpdateStatusInput } from "../endpoints/marketplace/orders/update-status_POST.schema";

export const MARKETPLACE_ITEMS_QUERY_KEY = ["marketplace", "items"];
export const MARKETPLACE_ORDERS_QUERY_KEY = ["marketplace", "orders"];

// Item Queries & Mutations
export const useMarketplaceItems = () => {
  return useQuery({
    queryKey: MARKETPLACE_ITEMS_QUERY_KEY,
    queryFn: getMarketplaceItems,
    select: (data) => data.items,
  });
};

export const useCreateMarketplaceItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newItem: CreateItemInput) => postMarketplaceItems(newItem),
    onSuccess: () => {
      toast.success("Marketplace item created successfully.");
      return queryClient.invalidateQueries({ queryKey: MARKETPLACE_ITEMS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Failed to create item: ${error.message}`);
    },
  });
};

export const useUpdateMarketplaceItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: UpdateItemInput) => postMarketplaceItemsUpdate(item),
    onSuccess: () => {
      toast.success("Marketplace item updated successfully.");
      return queryClient.invalidateQueries({ queryKey: MARKETPLACE_ITEMS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Failed to update item: ${error.message}`);
    },
  });
};

export const useDeleteMarketplaceItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: DeleteItemInput) => postMarketplaceItemsDelete(item),
    onSuccess: () => {
      toast.success("Marketplace item deleted successfully.");
      return queryClient.invalidateQueries({ queryKey: MARKETPLACE_ITEMS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Failed to delete item: ${error.message}`);
    },
  });
};

// Order Queries & Mutations
export const useMarketplaceOrders = () => {
  return useQuery({
    queryKey: MARKETPLACE_ORDERS_QUERY_KEY,
    queryFn: getMarketplaceOrders,
    select: (data) => data.orders,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newOrder: CreateOrderInput) => postMarketplaceOrders(newOrder),
    onSuccess: () => {
      toast.success("Order placed successfully!");
      // Invalidate both orders and items (for stock updates)
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_ITEMS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Failed to place order: ${error.message}`);
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateStatusInput) => postMarketplaceOrdersUpdateStatus(data),
    onSuccess: (data) => {
      toast.success(`Order #${data.order.id} status updated to ${data.order.status}.`);
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_ORDERS_QUERY_KEY });
      // If order was cancelled, item stock may have changed
      if (data.order.status === 'cancelled') {
        queryClient.invalidateQueries({ queryKey: MARKETPLACE_ITEMS_QUERY_KEY });
      }
    },
    onError: (error) => {
      toast.error(`Failed to update order status: ${error.message}`);
    },
  });
};