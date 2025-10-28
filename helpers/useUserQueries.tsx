import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postQueries, InputType as CreateQueryInput } from "../endpoints/queries_POST.schema";
import { toast } from "sonner";

// Mutation to create a new user query
export const useCreateQuery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQueryInput) => postQueries(data),
    onSuccess: () => {
      toast.success("Your query has been submitted successfully. We will get back to you shortly.");
      // Invalidate admin queries so they see the new one
      queryClient.invalidateQueries({ queryKey: ["admin", "queries"] });
    },
    onError: (error) => {
      toast.error(`Failed to submit query: ${error.message}`);
    },
  });
};