import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postSubscriptionRequest, InputType } from '../endpoints/subscription/request_POST.schema';
import { AUTH_QUERY_KEY } from './useAuth';

/**
 * A React Query mutation hook for requesting a new subscription.
 * This hook calls the `postSubscriptionRequest` endpoint.
 *
 * On success, it invalidates the current user's session query (`AUTH_QUERY_KEY`)
 * to ensure the UI reflects the new 'pending' subscription status.
 *
 * @returns A mutation object from `useMutation`.
 */
export const useRequestSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InputType) => postSubscriptionRequest(data),
    onSuccess: () => {
      // Invalidate session to refetch user data with updated subscription status
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
};