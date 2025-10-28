import React, { useState } from "react";
import {
  ChevronDown,
  Edit,
  Trash2,
  MoreVertical,
  Download,
  Package,
} from "lucide-react";
import { PurchaseWithItemsAndSupplier } from "../endpoints/purchases_GET.schema";
import { useDeletePurchase } from "../helpers/usePurchaseQueries";
import { formatDate, formatCurrency } from "../helpers/dateUtils";
import { useLanguage } from "../helpers/useLanguage";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Skeleton } from "./Skeleton";
import { Spinner } from "./Spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import styles from "./PurchaseList.module.css";

interface PurchaseListProps {
  purchases: PurchaseWithItemsAndSupplier[];
  isLoading: boolean;
  onEdit: (purchase: PurchaseWithItemsAndSupplier) => void;
}

export const PurchaseList = ({
  purchases,
  isLoading,
  onEdit,
}: PurchaseListProps) => {
  const { t } = useLanguage();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [deleteCandidate, setDeleteCandidate] = useState<PurchaseWithItemsAndSupplier | null>(null);
  const deleteMutation = useDeletePurchase();

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
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

  const getPaymentModeLabel = (mode: string | null) => {
    if (!mode) return null;
    switch (mode) {
      case 'cash':
        return t("purchase.paymentModeCash");
      case 'card':
        return t("purchase.paymentModeCard");
      case 'bank_transfer':
        return t("purchase.paymentModeBankTransfer");
      case 'upi':
        return t("purchase.paymentModeUPI");
      default:
        return mode;
    }
  };

  const handleDownloadBill = (purchase: PurchaseWithItemsAndSupplier) => {
    if (purchase.billFileData && purchase.billFileType && purchase.billFileName) {
      const byteCharacters = atob(purchase.billFileData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: purchase.billFileType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = purchase.billFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  if (isLoading) {
    return <PurchaseListSkeleton />;
  }

  if (purchases.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Package size={48} className={styles.emptyIcon} />
        <h3>{t("purchase.noPurchasesFound")}</h3>
        <p>{t("purchase.addPurchasePrompt")}</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.expandColumn}></th>
              <th>{t("purchase.date")}</th>
              <th>{t("purchase.billNumber")}</th>
              <th>{t("purchase.supplier")}</th>
              <th className={styles.amountColumn}>{t("purchase.amount")}</th>
              <th>{t("purchase.status")}</th>
              <th className={styles.actionsColumn}>{t("purchase.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => {
              const isExpanded = expandedRows.has(purchase.id);
              return (
                <React.Fragment key={purchase.id}>
                  <tr>
                    <td className={styles.expandColumn}>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => toggleRow(purchase.id)}
                        className={`${styles.expandButton} ${isExpanded ? styles.expanded : ""}`}
                      >
                        <ChevronDown size={16} />
                      </Button>
                    </td>
                    <td data-label={t("purchase.date")}>{formatDate(purchase.purchaseDate)}</td>
                    <td data-label={t("purchase.billNumber")}>{purchase.billNumber || t("purchase.notAvailable")}</td>
                    <td data-label={t("purchase.supplier")}>{purchase.supplier.supplierName}</td>
                    <td data-label={t("purchase.amount")} className={styles.amountColumn}>
                      {formatCurrency(purchase.totalAmount)}
                    </td>
                    <td data-label={t("purchase.status")}>
                      <Badge
                        variant={
                          purchase.paymentStatus === "paid" ? "success" : "warning"
                        }
                      >
                        {purchase.paymentStatus === "paid" ? t("purchase.paymentStatusPaid") : t("purchase.paymentStatusPending")}
                      </Badge>
                    </td>
                    <td className={styles.actionsColumn}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {purchase.billFileData && (
                            <DropdownMenuItem onClick={() => handleDownloadBill(purchase)}>
                              <Download size={14} />
                              <span>{t("purchase.downloadBill")}</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => onEdit(purchase)}>
                            <Edit size={14} />
                            <span>{t("common.edit")}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={styles.deleteMenuItem}
                            onClick={() => setDeleteCandidate(purchase)}
                          >
                            <Trash2 size={14} />
                            <span>{t("common.delete")}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className={styles.expandedRow}>
                      <td colSpan={7}>
                        <div className={styles.itemsBreakdown}>
                          <h4 className={styles.breakdownTitle}>{t("purchase.items")}</h4>
                          <table className={styles.itemsTable}>
                            <thead>
                              <tr>
                                <th>{t("purchase.itemName")}</th>
                                <th>{t("purchase.description")}</th>
                                <th className={styles.numberColumn}>{t("purchase.quantity")}</th>
                                <th className={styles.numberColumn}>{t("purchase.unitPrice")}</th>
                                <th className={styles.numberColumn}>{t("purchase.amount")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {purchase.items.map((item) => (
                                <tr key={item.id}>
                                  <td>{item.itemName}</td>
                                  <td>{item.description || "-"}</td>
                                  <td className={styles.numberColumn}>{Number(item.quantity)}</td>
                                  <td className={styles.numberColumn}>{formatCurrency(item.unitPrice)}</td>
                                  <td className={styles.numberColumn}>{formatCurrency(item.amount)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {purchase.notes && (
                            <div className={styles.notesSection}>
                                <strong>{t("common.notes")}:</strong>
                                <p>{purchase.notes}</p>
                            </div>
                          )}
                          {(purchase.paymentMode || purchase.paymentReference || purchase.paymentDate || purchase.paymentDueDate) && (
                            <div className={styles.paymentDetailsSection}>
                              <strong>{t("purchase.paymentMode")}</strong>
                              <div className={styles.paymentDetailsGrid}>
                                {purchase.paymentMode && (
                                  <div className={styles.paymentDetail}>
                                    <span className={styles.paymentDetailLabel}>{t("purchase.paymentMode")}:</span>
                                    <span className={styles.paymentDetailValue}>{getPaymentModeLabel(purchase.paymentMode)}</span>
                                  </div>
                                )}
                                {purchase.paymentReference && (
                                  <div className={styles.paymentDetail}>
                                    <span className={styles.paymentDetailLabel}>{t("purchase.paymentReference")}:</span>
                                    <span className={styles.paymentDetailValue}>{purchase.paymentReference}</span>
                                  </div>
                                )}
                                {purchase.paymentDate && (
                                  <div className={styles.paymentDetail}>
                                    <span className={styles.paymentDetailLabel}>{t("purchase.paymentDate")}:</span>
                                    <span className={styles.paymentDetailValue}>{formatDate(purchase.paymentDate)}</span>
                                  </div>
                                )}
                                {purchase.paymentDueDate && (
                                  <div className={styles.paymentDetail}>
                                    <span className={styles.paymentDetailLabel}>{t("purchase.paymentDueDate")}:</span>
                                    <span className={styles.paymentDetailValue}>{formatDate(purchase.paymentDueDate)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
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
            <DialogTitle>{t("purchase.deleteConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("purchase.deleteConfirmMessage", { 
                billNumber: deleteCandidate?.billNumber || `ID: ${deleteCandidate?.id}` 
              })}
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
    </>
  );
};

const PurchaseListSkeleton = () => (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.expandColumn}></th>
            <th><Skeleton style={{ height: '1rem', width: '80px' }} /></th>
            <th><Skeleton style={{ height: '1rem', width: '100px' }} /></th>
            <th><Skeleton style={{ height: '1rem', width: '150px' }} /></th>
            <th className={styles.amountColumn}><Skeleton style={{ height: '1rem', width: '100px', marginLeft: 'auto' }} /></th>
            <th><Skeleton style={{ height: '1rem', width: '70px' }} /></th>
            <th className={styles.actionsColumn}><Skeleton style={{ height: '1rem', width: '60px' }} /></th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, index) => (
            <tr key={index}>
              <td className={styles.expandColumn}><Skeleton style={{ height: '24px', width: '24px' }} /></td>
              <td><Skeleton style={{ height: '1rem' }} /></td>
              <td><Skeleton style={{ height: '1rem' }} /></td>
              <td><Skeleton style={{ height: '1rem' }} /></td>
              <td className={styles.amountColumn}><Skeleton style={{ height: '1rem' }} /></td>
              <td><Skeleton style={{ height: '1.5rem', width: '80px', borderRadius: 'var(--radius-full)' }} /></td>
              <td className={styles.actionsColumn}><Skeleton style={{ height: '24px', width: '24px' }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );