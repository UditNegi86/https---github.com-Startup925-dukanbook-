import { EstimateWithItems } from "../endpoints/estimates_GET.schema";
import { useLanguage } from "../helpers/useLanguage";
import { calculateDaysUntilDue, getDueDateColorClass } from "../helpers/estimateTableHelpers";
import { Badge } from "./Badge";
import { PaymentType } from "../helpers/schema";
import styles from "./EstimatePaymentBadge.module.css";

interface EstimatePaymentBadgeProps {
  estimate: EstimateWithItems;
}

export const EstimatePaymentBadge = ({ estimate }: EstimatePaymentBadgeProps) => {
  const { t } = useLanguage();
  const { paymentType, paymentReceivedDate, paymentReceivedMode, expectedPaymentDate } = estimate;
  
  const daysRemaining = calculateDaysUntilDue(expectedPaymentDate);
  const colorClass = getDueDateColorClass(daysRemaining);

  if (paymentType !== "credit") {
    const variantMap: Record<Exclude<PaymentType, "credit">, "info" | "success"> = {
      card: "info",
      cash: "success",
      upi: "info",
    };
    return <Badge variant={variantMap[paymentType]}>{t(`common.${paymentType}`)}</Badge>;
  }

  // For credit estimates, show payment status
  if (paymentReceivedDate && paymentReceivedMode) {
    // Determine badge variant based on payment method used
    const paymentVariant = paymentReceivedMode === "cash" ? "success" : "info";
    
    return (
      <div className={styles.paymentStatus}>
        <Badge variant={paymentVariant}>{t("estimateTable.creditPaid")}</Badge>
        <div className={styles.paymentDetails}>
          {new Date(paymentReceivedDate).toLocaleDateString()}
        </div>
        <div className={styles.paymentDetails}>
          {t("estimateTable.via")} {t(`common.${paymentReceivedMode}`)}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.paymentStatus}>
      <Badge variant="warning" className={styles[colorClass]}>
        {t("estimateTable.creditPending")}
      </Badge>
      {estimate.expectedPaymentDate && (
        <div className={`${styles.paymentDetails} ${styles[colorClass]}`}>
          {t("estimateTable.due")} {new Date(estimate.expectedPaymentDate).toLocaleDateString()}
          {daysRemaining !== null && (
            <span className={styles.daysRemaining}>
              {daysRemaining <= 0 
                ? ` (${Math.abs(daysRemaining)} ${Math.abs(daysRemaining) === 1 ? t("estimateTable.dayOverdue") : t("estimateTable.daysOverdue")})` 
                : ` (${daysRemaining} ${daysRemaining === 1 ? t("estimateTable.dayLeft") : t("estimateTable.daysLeft")})`}
            </span>
          )}
        </div>
      )}
    </div>
  );
};