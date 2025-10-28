import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminUsers } from "../endpoints/admin/users_GET.schema";
import { getAdminEstimates, InputType as GetAdminEstimatesInput } from "../endpoints/admin/estimates_GET.schema";
import { getAdminQueries, InputType as GetAdminQueriesInput } from "../endpoints/admin/queries_GET.schema";
import { postAdminUserUpdate, InputType as UpdateUserInput } from "../endpoints/admin/user/update_POST.schema";
import { postAdminEstimateUpdate, InputType as UpdateEstimateInput } from "../endpoints/admin/estimate/update_POST.schema";
import { postAdminEstimateDelete, InputType as DeleteEstimateInput } from "../endpoints/admin/estimate/delete_POST.schema";
import { postAdminUserResetPin, InputType as ResetPinInput } from "../endpoints/admin/user/reset-pin_POST.schema";
import { postAdminQueryUpdateStatus, InputType as UpdateQueryStatusInput } from "../endpoints/admin/query/update-status_POST.schema";
import { postAdminUserToggleStatus, InputType as ToggleUserStatusInput } from "../endpoints/admin/user/toggle-status_POST.schema";
import { postAdminSubscriptionApprove, InputType as ApproveSubscriptionInput } from "../endpoints/admin/subscription/approve_POST.schema";
import { toast } from "sonner";

const ADMIN_USERS_QUERY_KEY = ["admin", "users"];
const ADMIN_ESTIMATES_QUERY_KEY = ["admin", "estimates"];
const ADMIN_QUERIES_QUERY_KEY = ["admin", "queries"];

// Query to fetch all users for the admin panel
export const useAdminUsers = () => {
  return useQuery({
    queryKey: ADMIN_USERS_QUERY_KEY,
    queryFn: () => getAdminUsers(),
  });
};

// Query to fetch all estimates for the admin panel, with optional filtering
export const useAdminEstimates = (params?: GetAdminEstimatesInput) => {
  return useQuery({
    queryKey: [...ADMIN_ESTIMATES_QUERY_KEY, params],
    queryFn: () => getAdminEstimates(params),
  });
};

// Query to fetch all user queries for the admin panel, with optional status filtering
export const useAdminQueries = (params?: GetAdminQueriesInput) => {
  return useQuery({
    queryKey: [...ADMIN_QUERIES_QUERY_KEY, params],
    queryFn: () => getAdminQueries(params),
  });
};

// Mutation to update a user's details
export const useUpdateUserByAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserInput) => postAdminUserUpdate(data),
    onSuccess: () => {
      toast.success("User updated successfully.");
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });
};

// Mutation to update an estimate
export const useUpdateEstimateByAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEstimateInput) => postAdminEstimateUpdate(data),
    onSuccess: () => {
      toast.success("Estimate updated successfully.");
      queryClient.invalidateQueries({ queryKey: ADMIN_ESTIMATES_QUERY_KEY });
      // Also invalidate user stats as total amount might change
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Failed to update estimate: ${error.message}`);
    },
  });
};

// Mutation to delete an estimate
export const useDeleteEstimateByAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeleteEstimateInput) => postAdminEstimateDelete(data),
    onSuccess: () => {
      toast.success("Estimate deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ADMIN_ESTIMATES_QUERY_KEY });
      // Also invalidate user stats as total amount and count will change
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Failed to delete estimate: ${error.message}`);
    },
  });
};

// Mutation to update a query's status
export const useUpdateQueryStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateQueryStatusInput) => postAdminQueryUpdateStatus(data),
    onSuccess: () => {
      toast.success("Query status updated successfully.");
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERIES_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
};

// Mutation to reset a user's PIN
export const useResetUserPin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ResetPinInput) => postAdminUserResetPin(data),
    onSuccess: () => {
      toast.success("PIN reset successfully.");
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Failed to reset PIN: ${error.message}`);
    },
  });
};

// Mutation to toggle a user's active status
export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ToggleUserStatusInput) => postAdminUserToggleStatus(data),
    onSuccess: (updatedUser) => {
      toast.success(`User status updated to ${updatedUser.isActive ? 'Active' : 'Disabled'}.`);
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
};

// Mutation to approve a pending subscription
export const useApproveSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ApproveSubscriptionInput) => postAdminSubscriptionApprove(data),
    onSuccess: () => {
      toast.success("Subscription approved successfully.");
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Failed to approve subscription: ${error.message}`);
    },
  });
};