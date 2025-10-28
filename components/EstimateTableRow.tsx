import React, { useRef, useEffect } from "react";
import { MoreVertical, ChevronDown, Printer, IndianRupee, FileText, Edit, Trash2 } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { EstimateWithItems } from "../endpoints/estimates_GET.schema";
import { useConvertToBill } from "../helpers/useEstimatesQueries";
import { useLanguage } from "../helpers/useLanguage";
import { formatCurrency } from "../helpers/estimateTableHelpers";
import { toast } from "sonner";
import { Button } from "./Button";
import { Spinner } from "./Spinner";
import { PrintEstimate } from "./PrintEstimate";
import { EstimatePaymentBadge } from "./EstimatePaymentBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import styles from "./EstimateTableRow.module.css";

interface EstimateTableRowProps {
  estimate: EstimateWithItems;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: (estimate: EstimateWithItems) => void;
  onDelete: (estimate: EstimateWithItems) => void;
  onReceivePayment: (estimate: EstimateWithItems) => void;
  userIsActive: boolean;
  isSubuser: boolean;
  onPrintTrigger: (estimateId: number) => void;
}

export const EstimateTableRow = ({
  estimate,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onReceivePayment,
  userIsActive,
  isSubuser,
  onPrintTrigger,
}: EstimateTableRowProps) => {
  const { t } = useLanguage();
  const convertToBillMutation = useConvertToBill();

  const shouldShowPaymentButton = () => {
    return estimate.paymentType === "credit" && !estimate.paymentReceivedDate;
  };

  const handleConvertToBill = () => {
    convertToBillMutation.mutate(
      { estimateId: estimate.id },
      {
        onSuccess: () => {
          toast.success(t("estimateTable.convertToBillSuccess"));
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : t("estimateTable.convertToBillError"));
        },
      }
    );
  };

  const showPaymentButton = shouldShowPaymentButton();

  return (
    <tr>
      <td className={styles.expandColumn}>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleExpand}
          className={`${styles.expandButton} ${isExpanded ? styles.expanded : ""}`}
        >
          <ChevronDown size={16} />
        </Button>
      </td>
      <td>
        <div className={styles.numberCell}>
          <span className={styles.estimateNumber}>
            #{estimate.estimateNumber}
          </span>
          {estimate.billNumber && (
            <span className={styles.billNumber}>
              {t("estimateTable.bill")} #{estimate.billNumber}
            </span>
          )}
          {estimate.subuserName && !isSubuser && (
            <span className={styles.subuserBadge}>
              {t("estimateTable.createdBy")}: {estimate.subuserName}
            </span>
          )}
        </div>
      </td>
      <td>{new Date(estimate.date).toLocaleDateString()}</td>
      <td>{estimate.customerName}</td>
      <td>{estimate.mobileNumber}</td>
      <td className={styles.amountColumn}>
        {formatCurrency(estimate.totalAmount)}
      </td>
      <td>
        <EstimatePaymentBadge estimate={estimate} />
      </td>
      <td className={styles.actionsColumn}>
        <div className={styles.actions}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => onPrintTrigger(estimate.id)}
                disabled={!userIsActive}
              >
                <Printer size={14} />
                <span>{t("estimateTable.print")}</span>
              </DropdownMenuItem>
              {userIsActive && !isSubuser && !estimate.billNumber && (
                <DropdownMenuItem 
                  onClick={handleConvertToBill}
                  disabled={convertToBillMutation.isPending}
                >
                  {convertToBillMutation.isPending ? (
                    <Spinner size="sm" />
                  ) : (
                    <FileText size={14} />
                  )}
                  <span>{t("estimateTable.convertToBill")}</span>
                </DropdownMenuItem>
              )}
              {userIsActive && showPaymentButton && (
                <DropdownMenuItem 
                  onClick={() => onReceivePayment(estimate)}
                  className={styles.paymentMenuItem}
                >
                  <IndianRupee size={14} />
                  <span>{t("estimateTable.receivePayment")}</span>
                </DropdownMenuItem>
              )}
              {userIsActive && !isSubuser && !estimate.billNumber && (
                <DropdownMenuItem onClick={() => onEdit(estimate)}>
                  <Edit size={14} />
                  <span>{t("estimateTable.edit")}</span>
                </DropdownMenuItem>
              )}
              {userIsActive && !isSubuser && !estimate.billNumber && (
                <DropdownMenuItem
                  className={styles.deleteMenuItem}
                  onClick={() => onDelete(estimate)}
                >
                  <Trash2 size={14} />
                  <span>{t("estimateTable.delete")}</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
};