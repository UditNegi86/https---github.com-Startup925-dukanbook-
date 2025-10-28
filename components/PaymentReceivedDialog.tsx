import React, { useEffect, useMemo } from "react";
import { z } from "zod";
import { Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../helpers/useLanguage";
import { EstimateWithItems } from "../endpoints/estimates_GET.schema";
import { EstimateWithItemsAndPayments } from "../endpoints/estimates/record-payment_POST.schema";
import {
  schema as recordPaymentSchema,
  PaymentModeArrayValues,
} from "../endpoints/estimates/record-payment_POST.schema";
import { useRecordPartialPayment } from "../helpers/useEstimatesQueries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./Dialog";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "./Form";
import { Button } from "./Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { Calendar } from "./Calendar";
import { Input } from "./Input";
import { Spinner } from "./Spinner";
import styles from "./PaymentReceivedDialog.module.css";

interface PaymentReceivedDialogProps {
  estimate: EstimateWithItems | EstimateWithItemsAndPayments;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// The form schema doesn't need estimateId, as it comes from props.
const formSchema = recordPaymentSchema.omit({ estimateId: true });
type FormValues = z.infer<typeof formSchema>;

export const PaymentReceivedDialog = ({
  estimate,
  open,
  onOpenChange,
  onSuccess,
}: PaymentReceivedDialogProps) => {
  const { t } = useLanguage();

  // Calculate total paid and remaining balance
  const { totalPaid, remainingBalance, payments } = useMemo(() => {
    const payments =
      "payments" in estimate ? estimate.payments || [] : [];
    const totalPaid = payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );
    const totalAmount = Number(estimate.totalAmount);
    const remainingBalance = totalAmount - totalPaid;

    return {
      totalPaid,
      remainingBalance,
      payments,
    };
  }, [estimate]);

  const defaultValues: FormValues = {
    amount: remainingBalance,
    paymentDate: new Date(),
    paymentMode: "cash",
    notes: null,
  };

  const form = useForm({
    schema: formSchema,
    defaultValues,
  });

  const { setValues, values, handleSubmit, errors } = form;

  useEffect(() => {
    if (open) {
      // Recalculate default amount when dialog opens
      setValues({
        ...defaultValues,
        amount: remainingBalance,
      });
    }
  }, [open, remainingBalance]); // eslint-disable-line react-hooks/exhaustive-deps

  const recordPaymentMutation = useRecordPartialPayment();

  const onSubmit = (data: FormValues) => {
    recordPaymentMutation.mutate(
      {
        ...data,
        estimateId: estimate.id,
      },
      {
        onSuccess: () => {
          toast.success(
            t("paymentDialog.successToast", {
              estimateNumber: estimate.estimateNumber,
            })
          );
          onSuccess();
          onOpenChange(false);
        },
        onError: (error) => {
          console.error("Failed to record payment:", error);
          // Error is handled by the mutation error display below the footer
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>{t("paymentDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("paymentDialog.description", {
              estimateNumber: estimate.estimateNumber,
              customerName: estimate.customerName,
            })}
          </DialogDescription>
        </DialogHeader>

        {/* Payment History Section */}
        {payments.length > 0 && (
          <div className={styles.paymentHistory}>
            <h4 className={styles.paymentHistoryTitle}>
              {t("paymentDialog.paymentHistory")}
            </h4>
            <div className={styles.paymentHistoryList}>
              {payments.map((payment) => (
                <div key={payment.id} className={styles.paymentHistoryItem}>
                  <span className={styles.paymentDate}>
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </span>
                  <span className={styles.paymentMode}>
                    {payment.paymentMode.charAt(0).toUpperCase() +
                      payment.paymentMode.slice(1)}
                  </span>
                  <span className={styles.paymentAmount}>
                    ₹{Number(payment.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.paymentSummary}>
              <div className={styles.paymentSummaryRow}>
                <span>{t("paymentDialog.totalPaid")}:</span>
                <span className={styles.totalPaid}>
                  ₹{totalPaid.toFixed(2)}
                </span>
              </div>
              <div className={styles.paymentSummaryRow}>
                <span>{t("paymentDialog.remainingBalance")}:</span>
                <span className={styles.remainingBalance}>
                  ₹{remainingBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <FormItem name="amount">
              <FormLabel>{t("paymentDialog.amountLabel")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max={remainingBalance}
                  value={values.amount}
                  onChange={(e) =>
                    setValues((p) => ({
                      ...p,
                      amount: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </FormControl>
              <div className={styles.helperText}>
                <div>
                  {t("paymentDialog.totalAmount")}: ₹
                  {Number(estimate.totalAmount).toFixed(2)}
                </div>
                {payments.length > 0 && (
                  <div>
                    {t("paymentDialog.remainingBalance")}: ₹
                    {remainingBalance.toFixed(2)}
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>

            <FormItem name="paymentDate">
              <FormLabel>{t("paymentDialog.dateLabel")}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="outline" className={styles.dateButton}>
                      {values.paymentDate ? (
                        new Date(values.paymentDate).toLocaleDateString()
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon size={16} />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent removeBackgroundAndPadding>
                  <Calendar
                    mode="single"
                    selected={values.paymentDate}
                    onSelect={(date) =>
                      date && setValues((p) => ({ ...p, paymentDate: date }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>

            <FormItem name="paymentMode">
              <FormLabel>{t("paymentDialog.modeLabel")}</FormLabel>
              <Select
                value={values.paymentMode}
                onValueChange={(value) =>
                  setValues((p) => ({
                    ...p,
                    paymentMode: value as FormValues["paymentMode"],
                  }))
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PaymentModeArrayValues.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>

            <FormItem name="notes">
              <FormLabel>{t("common.notes")} (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder={t("common.notesPlaceholder")}
                  value={values.notes || ""}
                  onChange={(e) =>
                    setValues((p) => ({
                      ...p,
                      notes: e.target.value || null,
                    }))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={recordPaymentMutation.isPending}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={recordPaymentMutation.isPending}>
                {recordPaymentMutation.isPending ? (
                  <Spinner size="sm" />
                ) : (
                  t("paymentDialog.recordPayment")
                )}
              </Button>
            </DialogFooter>
            {recordPaymentMutation.error && (
              <p className={styles.mutationError}>
                {recordPaymentMutation.error instanceof Error
                  ? recordPaymentMutation.error.message
                  : t("estimateDialog.unknownError")}
              </p>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};