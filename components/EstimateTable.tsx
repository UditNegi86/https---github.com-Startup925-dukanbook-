import React, { useState, useRef, useMemo, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { EstimateWithItems } from "../endpoints/estimates_GET.schema";
import { useDeleteEstimate } from "../helpers/useEstimatesQueries";
import { useLanguage } from "../helpers/useLanguage";
import { useAuth } from "../helpers/useAuth";
import { Button } from "./Button";
import { Spinner } from "./Spinner";
import { PrintEstimate } from "./PrintEstimate";
import { PaymentReceivedDialog } from "./PaymentReceivedDialog";
import { EstimateTableRow } from "./EstimateTableRow";
import { EstimateExpandedRow } from "./EstimateExpandedRow";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./Dialog";
import styles from "./EstimateTable.module.css";

interface EstimateTableProps {
  estimates: EstimateWithItems[];
  onEdit: (estimate: EstimateWithItems) => void;
  isUpdating: boolean;
  userIsActive: boolean;
}

export const EstimateTable = ({
  estimates,
  onEdit,
  isUpdating,
  userIsActive,
}: EstimateTableProps) => {
  const { t } = useLanguage();
  const { authState } = useAuth();
  const [deleteCandidate, setDeleteCandidate] = useState<EstimateWithItems | null>(null);
  const [paymentCandidate, setPaymentCandidate] = useState<EstimateWithItems | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [currentPrintEstimateId, setCurrentPrintEstimateId] = useState<number | null>(null);
  const deleteMutation = useDeleteEstimate();
  
  // Check if current user is a subuser
  const isSubuser = authState.type === "authenticated" && authState.user.userType === "subuser";
  
  // Create a map of refs for each estimate
  const printRefsMap = useRef<Map<number, React.RefObject<HTMLDivElement | null>>>(new Map());

  // Initialize refs for all estimates
  useMemo(() => {
    estimates.forEach((estimate) => {
      if (!printRefsMap.current.has(estimate.id)) {
        printRefsMap.current.set(estimate.id, React.createRef<HTMLDivElement>());
      }
    });
  }, [estimates]);

  // Get current estimate to print
  const currentPrintEstimate = useMemo(() => {
    return currentPrintEstimateId 
      ? estimates.find(e => e.id === currentPrintEstimateId) 
      : null;
  }, [currentPrintEstimateId, estimates]);

  const currentPrintRef = currentPrintEstimateId 
    ? printRefsMap.current.get(currentPrintEstimateId) 
    : undefined;

  // Set up print handler at top level
  const handlePrint = useReactToPrint({
    contentRef: currentPrintRef || React.createRef(),
    documentTitle: currentPrintEstimate 
      ? `Estimate_${currentPrintEstimate.estimateNumber}` 
      : 'Estimate',
    onAfterPrint: () => {
      console.log('Print completed or cancelled');
      setCurrentPrintEstimateId(null);
    },
  });

  // Trigger print when currentPrintEstimateId changes
  useEffect(() => {
    if (currentPrintEstimateId && currentPrintRef?.current) {
      console.log('Triggering print for estimate:', currentPrintEstimateId);
      handlePrint();
    }
  }, [currentPrintEstimateId, currentPrintRef, handlePrint]);

  const handlePrintEstimate = (estimateId: number) => {
    console.log('Setting estimate to print:', estimateId);
    setCurrentPrintEstimateId(estimateId);
  };

  const handleDelete = () => {
    if (deleteCandidate) {
      deleteMutation.mutate(
        { id: deleteCandidate.id },
        {
          onSuccess: () => {
            setDeleteCandidate(null);
          },
        },
      );
    }
  };

  const toggleRow = (estimateId: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(estimateId)) {
        newSet.delete(estimateId);
      } else {
        newSet.add(estimateId);
      }
      return newSet;
    });
  };

  if (estimates.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3>{t("estimateTable.noEstimatesFound")}</h3>
        <p>{t("estimateTable.createEstimateToStart")}</p>
      </div>
    );
  }

  return (
    <>
      {estimates.map((estimate) => {
        const printRef = printRefsMap.current.get(estimate.id);
        return (
          <PrintEstimate
            key={`print-${estimate.id}`}
            ref={printRef}
            estimate={estimate}
          />
        );
      })}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.expandColumn}></th>
              <th>{t("estimateTable.estimateNumberBillNumber")}</th>
              <th>{t("estimateTable.date")}</th>
              <th>{t("estimateTable.customer")}</th>
              <th>{t("estimateTable.mobile")}</th>
              <th className={styles.amountColumn}>{t("estimateTable.amount")}</th>
              <th>{t("estimateTable.payment")}</th>
              <th className={styles.actionsColumn}>
                {isUpdating && <Spinner size="sm" />}
              </th>
            </tr>
          </thead>
          <tbody>
            {estimates.map((estimate) => {
              const isExpanded = expandedRows.has(estimate.id);
              return (
                <React.Fragment key={estimate.id}>
                  <EstimateTableRow
                    estimate={estimate}
                    isExpanded={isExpanded}
                    onToggleExpand={() => toggleRow(estimate.id)}
                    onEdit={onEdit}
                    onDelete={setDeleteCandidate}
                    onReceivePayment={setPaymentCandidate}
                    userIsActive={userIsActive}
                    isSubuser={isSubuser}
                    onPrintTrigger={handlePrintEstimate}
                  />
                  {isExpanded && (
                    <EstimateExpandedRow estimate={estimate} />
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={!!deleteCandidate} onOpenChange={() => setDeleteCandidate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("estimateTable.areYouSure")}</DialogTitle>
            <DialogDescription>
              {t("estimateTable.deleteConfirmation")}{" "}
              <strong>{deleteCandidate?.customerName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={deleteMutation.isPending}>
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Spinner size="sm" /> : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {paymentCandidate && (
        <PaymentReceivedDialog
          estimate={paymentCandidate}
          open={!!paymentCandidate}
          onOpenChange={(open) => !open && setPaymentCandidate(null)}
          onSuccess={() => {
            setPaymentCandidate(null);
          }}
        />
      )}
    </>
  );
};