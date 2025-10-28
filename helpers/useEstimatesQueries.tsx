import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getEstimates } from "../endpoints/estimates_GET.schema";
import {
  postEstimates,
  InputType as CreateInputType,
} from "../endpoints/estimates_POST.schema";
import {
  postEstimatesUpdate,
  InputType as UpdateInputType,
} from "../endpoints/estimates/update_POST.schema";
import {
  postEstimatesPaymentReceived,
  InputType as PaymentReceivedInputType,
} from "../endpoints/estimates/payment-received_POST.schema";
import {
  postEstimatesDelete,
  InputType as DeleteInputType,
} from "../endpoints/estimates/delete_POST.schema";
import {
  postEstimatesRecordPayment,
  InputType as RecordPaymentInputType,
} from "../endpoints/estimates/record-payment_POST.schema";
import {
  postEstimatesConvertToBill,
  InputType as ConvertToBillInputType,
} from "../endpoints/estimates/convert-to-bill_POST.schema";
import { ledgerQueryKeys } from "./useLedgerQueries";

const estimatesQueryKey = ["estimates"];

export const useEstimates = () => {
  return useQuery({
    queryKey: estimatesQueryKey,
    queryFn: () => getEstimates(),
  });
};

export const useCreateEstimate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInputType) => postEstimates(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: estimatesQueryKey });
      queryClient.invalidateQueries({ queryKey: ledgerQueryKeys.all });
    },
  });
};

export const useUpdateEstimate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateInputType) => postEstimatesUpdate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: estimatesQueryKey });
      queryClient.invalidateQueries({ queryKey: ledgerQueryKeys.all });
    },
  });
};

export const useRecordPaymentReceived = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PaymentReceivedInputType) =>
      postEstimatesPaymentReceived(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: estimatesQueryKey });
      queryClient.invalidateQueries({ queryKey: ledgerQueryKeys.all });
    },
  });
};

export const useDeleteEstimate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeleteInputType) => postEstimatesDelete(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: estimatesQueryKey });
      queryClient.invalidateQueries({ queryKey: ledgerQueryKeys.all });
    },
  });
};

export const useRecordPartialPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RecordPaymentInputType) =>
      postEstimatesRecordPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: estimatesQueryKey });
      queryClient.invalidateQueries({ queryKey: ledgerQueryKeys.all });
    },
  });
};

export const useConvertToBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ConvertToBillInputType) =>
      postEstimatesConvertToBill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: estimatesQueryKey });
      queryClient.invalidateQueries({ queryKey: ledgerQueryKeys.all });
    },
  });
};