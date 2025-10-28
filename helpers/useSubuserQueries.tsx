import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSubusers, Subuser } from "../endpoints/subusers_GET.schema";
import { postSubuser, InputType as CreateInput } from "../endpoints/subusers_POST.schema";
import { postUpdateSubuser, InputType as UpdateInput } from "../endpoints/subusers/update_POST.schema";
import { postDeleteSubuser, InputType as DeleteInput } from "../endpoints/subusers/delete_POST.schema";
import { toast } from "sonner";

export const SUBUSERS_QUERY_KEY = ["subusers"] as const;

export const useSubusers = () => {
  return useQuery({
    queryKey: SUBUSERS_QUERY_KEY,
    queryFn: () => getSubusers(),
    select: (data) => data.subusers,
  });
};

export const useCreateSubuser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newSubuser: CreateInput) => postSubuser(newSubuser),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SUBUSERS_QUERY_KEY });
      toast.success(`Subuser "${data.subuser.name}" created successfully.`);
    },
    onError: (error) => {
      toast.error(`Failed to create subuser: ${error.message}`);
    },
  });
};

export const useUpdateSubuser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updatedSubuser: UpdateInput) => postUpdateSubuser(updatedSubuser),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(SUBUSERS_QUERY_KEY, (oldData: { subusers: Subuser[] } | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          subusers: oldData.subusers.map((subuser) =>
            subuser.id === variables.subuserId ? data.subuser : subuser
          ),
        };
      });
      toast.success(`Subuser "${data.subuser.name}" updated successfully.`);
    },
    onError: (error) => {
      toast.error(`Failed to update subuser: ${error.message}`);
    },
  });
};

export const useDeleteSubuser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: DeleteInput) => postDeleteSubuser(variables),
    onSuccess: (_, variables) => {
      queryClient.setQueryData(SUBUSERS_QUERY_KEY, (oldData: { subusers: Subuser[] } | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          subusers: oldData.subusers.filter((subuser) => subuser.id !== variables.subuserId),
        };
      });
      toast.success("Subuser deleted successfully.");
    },
    onError: (error) => {
      toast.error(`Failed to delete subuser: ${error.message}`);
    },
  });
};