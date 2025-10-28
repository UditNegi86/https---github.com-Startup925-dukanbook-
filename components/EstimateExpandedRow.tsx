import React from "react";
import { EstimateWithItems } from "../endpoints/estimates_GET.schema";
import { useLanguage } from "../helpers/useLanguage";
import { formatCurrency } from "../helpers/estimateTableHelpers";
import styles from "./EstimateExpandedRow.module.css";

interface EstimateExpandedRowProps {
  estimate: EstimateWithItems;
}

export const EstimateExpandedRow = ({ estimate }: EstimateExpandedRowProps) => {
  const { t } = useLanguage();
  
  const payments = estimate.payments || [];
  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const remainingBalance = Number(estimate.totalAmount) - totalPaid;

  return (
    <tr className={styles.expandedRow}>
      <td colSpan={8}>
        <div className={styles.itemsBreakdown}>
          <h4 className={styles.breakdownTitle}>
            {t("estimateTable.itemsBreakdown")}
          </h4>
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th>{t("estimateTable.description")}</th>
                <th className={styles.numberColumn}>{t("estimateTable.quantity")}</th>
                <th className={styles.numberColumn}>{t("estimateTable.unitPrice")}</th>
                <th className={styles.numberColumn}>{t("estimateTable.amount")}</th>
              </tr>
            </thead>
            <tbody>
              {estimate.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.description}</td>
                  <td className={styles.numberColumn}>
                    {Number(item.quantity)}
                  </td>
                  <td className={styles.numberColumn}>
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className={styles.numberColumn}>
                    <span className={styles.calculation}>
                      {Number(item.quantity)} × {formatCurrency(item.unitPrice)} = {formatCurrency(item.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className={styles.totalLabel}>
                  {t("estimateTable.subtotal")}
                </td>
                <td className={styles.numberColumn}>
                  {formatCurrency(
                    estimate.items.reduce(
                      (sum, item) => sum + Number(item.amount),
                      0
                    )
                  )}
                </td>
              </tr>
              {Number(estimate.discountPercentage) > 0 && (
                <tr>
                  <td colSpan={3} className={styles.totalLabel}>
                    {t("estimateTable.discount")} ({Number(estimate.discountPercentage)}%)
                  </td>
                  <td className={`${styles.numberColumn} ${styles.discountAmount}`}>
                    -{formatCurrency(estimate.discountAmount)}
                  </td>
                </tr>
              )}
              {Number(estimate.taxPercentage) > 0 && (
                <tr>
                  <td colSpan={3} className={styles.totalLabel}>
                    {t("estimateTable.tax")} ({Number(estimate.taxPercentage)}%)
                  </td>
                  <td className={`${styles.numberColumn} ${styles.taxAmount}`}>
                    +{formatCurrency(estimate.taxAmount)}
                  </td>
                </tr>
              )}
              <tr className={styles.totalRow}>
                <td colSpan={3} className={styles.totalLabel}>
                  <strong>{t("estimateTable.totalAmount")}</strong>
                </td>
                <td className={styles.numberColumn}>
                  <strong>{formatCurrency(estimate.totalAmount)}</strong>
                </td>
              </tr>
              {estimate.paymentType === "credit" && payments.length > 0 && (
                <>
                  <tr>
                    <td colSpan={4} className={styles.paymentHistoryHeader}>
                      <strong>{t("paymentDialog.paymentHistory")}</strong>
                    </td>
                  </tr>
                  {payments.map((payment) => (
                    <tr key={payment.id} className={styles.paymentHistoryRow}>
                      <td colSpan={3} className={styles.paymentHistoryDetails}>
                        <span className={styles.paymentDate}>
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </span>
                        <span className={styles.paymentMode}>
                          {payment.paymentMode.charAt(0).toUpperCase() + payment.paymentMode.slice(1)}
                        </span>
                        {payment.notes && (
                          <span className={styles.paymentNotes}>
                            {payment.notes}
                          </span>
                        )}
                      </td>
                      <td className={`${styles.numberColumn} ${styles.paymentAmount}`}>
                        {formatCurrency(payment.amount)}
                      </td>
                    </tr>
                  ))}
                  <tr className={styles.paymentSummaryRow}>
                    <td colSpan={3} className={styles.totalLabel}>
                      {t("paymentDialog.totalPaid")}
                    </td>
                    <td className={`${styles.numberColumn} ${styles.totalPaidAmount}`}>
                      {formatCurrency(totalPaid)}
                    </td>
                  </tr>
                  {remainingBalance > 0 && (
                    <tr className={styles.paymentSummaryRow}>
                      <td colSpan={3} className={styles.totalLabel}>
                        {t("paymentDialog.remainingBalance")}
                      </td>
                      <td className={`${styles.numberColumn} ${styles.remainingBalanceAmount}`}>
                        {formatCurrency(remainingBalance)}
                      </td>
                    </tr>
                  )}
                </>
              )}
              {estimate.paymentType === "credit" && payments.length === 0 && (
                <tr>
                  <td colSpan={4} className={styles.paymentStatusRow}>
                    <span className={styles.paymentStatusMessage}>
                      <strong>{t("estimateTable.paymentStatus")}</strong> {t("estimateTable.pending")}
                      {estimate.expectedPaymentDate && (
                        <> • <strong>{t("estimateTable.expectedPayment")}</strong> {new Date(estimate.expectedPaymentDate).toLocaleDateString()}</>
                      )}
                    </span>
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      </td>
    </tr>
  );
};