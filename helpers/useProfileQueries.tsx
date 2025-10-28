import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postProfileUpdate, InputType } from "../endpoints/profile/update_POST.schema";
import { AUTH_QUERY_KEY } from "./useAuth";
import { User } from "./User";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InputType) => postProfileUpdate(data),
    onSuccess: (data) => {
      if ("user" in data) {
        // Optimistically update the session data
        queryClient.setQueryData<User>(AUTH_QUERY_KEY, data.user);
      }
      // Invalidate to ensure freshness from server, though optimistic update provides instant UI feedback
      return queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
}