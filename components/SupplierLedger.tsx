import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  ChevronDown,
  Printer,
  Hash,
  Calendar,
  IndianRupee,
  FileText,
  CircleDollarSign,
  Clock,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { SupplierLedgerEntry } from "../endpoints/ledger/suppliers_GET.schema";
import { useLanguage } from "../helpers/useLanguage";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Spinner } from "./Spinner";
import { PrintSupplierLedger } from "./PrintSupplierLedger";
import styles from "./SupplierLedger.module.css";

interface SupplierLedgerProps {
  suppliers: SupplierLedgerEntry[];
  isUpdating: boolean;
}

const PaymentStatusBadge = ({
  purchase,
}: {
  purchase: SupplierLedgerEntry["purchases"][number];
}) => {
  const { t } = useLanguage();
  const { paymentStatus } = purchase;

  if (paymentStatus === "paid") {
    return <Badge variant="success">{t("purchase.paid")}</Badge>;
  }
  return <Badge variant="warning">{t("purchase.pending")}</Badge>;
};

export const SupplierLedger = ({
  suppliers,
  isUpdating,
}: SupplierLedgerProps) => {
  const { t } = useLanguage();
  const [expandedSuppliers, setExpandedSuppliers] = useState<Set<number>>(
    new Set()
  );
  const [expandedPurchases, setExpandedPurchases] = useState<Set<number>>(
    new Set()
  );
  const [currentPrintSupplierId, setCurrentPrintSupplierId] = useState<number | null>(null);
  
  // Create a map of refs for each supplier
  const printRefsMap = useRef<Map<number, React.RefObject<HTMLDivElement | null>>>(new Map());

  // Initialize refs for all suppliers
  useMemo(() => {
    suppliers.forEach((supplier) => {
      if (!printRefsMap.current.has(supplier.supplierId)) {
        printRefsMap.current.set(supplier.supplierId, React.createRef<HTMLDivElement>());
      }
    });
  }, [suppliers]);

  // Get current supplier to print
  const currentPrintSupplier = useMemo(() => {
    return currentPrintSupplierId 
      ? suppliers.find(s => s.supplierId === currentPrintSupplierId) 
      : null;
  }, [currentPrintSupplierId, suppliers]);

  const currentPrintRef = currentPrintSupplierId 
    ? printRefsMap.current.get(currentPrintSupplierId) 
    : undefined;

  // Set up print handler at top level
  const handlePrint = useReactToPrint({
    contentRef: currentPrintRef || React.createRef(),
    documentTitle: currentPrintSupplier 
      ? `Supplier_Ledger_${currentPrintSupplier.supplierName.replace(/\s+/g, '_')}_${currentPrintSupplier.supplierId}` 
      : 'Supplier_Ledger',
    onAfterPrint: () => {
      console.log('Print completed or cancelled');
      setCurrentPrintSupplierId(null);
    },
  });

  // Trigger print when currentPrintSupplierId changes
  useEffect(() => {
    if (currentPrintSupplierId && currentPrintRef?.current) {
      console.log('Triggering print for supplier:', currentPrintSupplierId);
      handlePrint();
    }
  }, [currentPrintSupplierId, currentPrintRef, handlePrint]);

  const toggleSupplierRow = (supplierId: number) => {
    setExpandedSuppliers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(supplierId)) {
        newSet.delete(supplierId);
      } else {
        newSet.add(supplierId);
      }
      return newSet;
    });
  };

  const togglePurchaseRow = (purchaseId: number) => {
    setExpandedPurchases((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(purchaseId)) {
        newSet.delete(purchaseId);
      } else {
        newSet.add(purchaseId);
      }
      return newSet;
    });
  };

  const printSupplierLedger = (supplierId: number) => {
    console.log('Setting supplier to print:', supplierId);
    setCurrentPrintSupplierId(supplierId);
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(Number(value));
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return t("supplier.notAvailable");
    return new Date(date).toLocaleDateString();
  };

  if (suppliers.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3>{t("purchase.noPurchasesFound")}</h3>
        <p>{t("purchase.addPurchasePrompt")}</p>
      </div>
    );
  }

  return (
    <>
      {suppliers.map((supplier) => {
        const printRef = printRefsMap.current.get(supplier.supplierId);
        return (
          <PrintSupplierLedger
            key={`print-${supplier.supplierId}`}
            ref={printRef}
            supplierLedger={supplier}
          />
        );
      })}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.expandColumn}></th>
              <th>{t("supplier.supplier")}</th>
              <th className={styles.centerAlign}>{t("purchase.purchases")}</th>
              <th className={styles.rightAlign}>{t("purchase.totalAmount")}</th>
              <th>{t("customerLedger.lastTransaction")}</th>
              <th className={styles.actionsColumn}>
                {isUpdating && <Spinner size="sm" />}
              </th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => {
              const isSupplierExpanded = expandedSuppliers.has(
                supplier.supplierId
              );
              return (
                <React.Fragment key={supplier.supplierId}>
                  <tr className={styles.supplierRow}>
                    <td className={styles.expandColumn}>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => toggleSupplierRow(supplier.supplierId)}
                        className={`${styles.expandButton} ${
                          isSupplierExpanded ? styles.expanded : ""
                        }`}
                      >
                        <ChevronDown size={16} />
                      </Button>
                    </td>
                    <td>
                      <div className={styles.supplierInfo}>
                        <div className={styles.supplierName}>
                          {supplier.supplierName}
                        </div>
                        <div className={styles.supplierContact}>
                          {supplier.contactNumber || supplier.email}
                        </div>
                      </div>
                    </td>
                    <td className={styles.centerAlign}>
                      {supplier.purchaseCount}
                    </td>
                    <td className={styles.rightAlign + " " + styles.totalAmount}>
                      {formatCurrency(supplier.totalAmountSpent)}
                    </td>
                    <td>{formatDate(supplier.lastTransactionDate)}</td>
                    <td className={styles.actionsColumn}>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => printSupplierLedger(supplier.supplierId)}
                        title={t("customerLedger.printCustomerLedger")}
                      >
                        <Printer size={16} />
                      </Button>
                    </td>
                  </tr>
                  {isSupplierExpanded && (
                    <tr className={styles.expandedRow}>
                      <td colSpan={6}>
                        <div className={styles.purchasesBreakdown}>
                          {supplier.purchases.map((purchase) => {
                            const isPurchaseExpanded = expandedPurchases.has(
                              purchase.id
                            );
                            return (
                              <div
                                key={purchase.id}
                                className={styles.purchaseCard}
                              >
                                <div className={styles.purchaseHeader}>
                                  <div className={styles.purchaseDetail}>
                                    <Calendar size={14} />{" "}
                                    {formatDate(purchase.purchaseDate)}
                                  </div>
                                  {purchase.billNumber && (
                                    <div className={styles.purchaseDetail}>
                                      <FileText size={14} />{" "}
                                      {purchase.billNumber}
                                    </div>
                                  )}
                                  <div className={styles.purchaseDetailAmount}>
                                    <IndianRupee size={14} />{" "}
                                    {formatCurrency(purchase.totalAmount)}
                                  </div>
                                  <PaymentStatusBadge purchase={purchase} />
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => togglePurchaseRow(purchase.id)}
                                    className={`${styles.expandButton} ${
                                      isPurchaseExpanded ? styles.expanded : ""
                                    }`}
                                  >
                                    <ChevronDown size={16} />
                                  </Button>
                                </div>
                                {isPurchaseExpanded && (
                                  <div className={styles.itemsTableContainer}>
                                    <div className={styles.paymentDetailsGrid}>
                                      {purchase.paymentMode && (
                                        <div>
                                          <strong>
                                            {t("purchase.paymentMode")}
                                          </strong>
                                          <span>{purchase.paymentMode}</span>
                                        </div>
                                      )}
                                      {purchase.paymentReference && (
                                        <div>
                                          <strong>
                                            {t("purchase.paymentReference")}
                                          </strong>
                                          <span>{purchase.paymentReference}</span>
                                        </div>
                                      )}
                                      {purchase.paymentDate && (
                                        <div>
                                          <strong>
                                            {t("purchase.paymentDate")}
                                          </strong>
                                          <span>
                                            {formatDate(purchase.paymentDate)}
                                          </span>
                                        </div>
                                      )}
                                      {purchase.paymentDueDate && (
                                        <div>
                                          <strong>
                                            {t("purchase.paymentDueDate")}
                                          </strong>
                                          <span>
                                            {formatDate(purchase.paymentDueDate)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <table className={styles.itemsTable}>
                                      <thead>
                                        <tr>
                                          <th>{t("purchase.itemName")}</th>
                                          <th className={styles.rightAlign}>
                                            {t("purchase.quantity")}
                                          </th>
                                          <th className={styles.rightAlign}>
                                            {t("purchase.unitPrice")}
                                          </th>
                                          <th className={styles.rightAlign}>
                                            {t("purchase.amount")}
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {purchase.items.map((item) => (
                                          <tr key={item.id}>
                                            <td>{item.itemName}</td>
                                            <td className={styles.rightAlign}>
                                              {Number(item.quantity)}
                                            </td>
                                            <td className={styles.rightAlign}>
                                              {formatCurrency(item.unitPrice)}
                                            </td>
                                            <td className={styles.rightAlign}>
                                              {formatCurrency(item.amount)}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                      <tfoot>
                                        <tr className={styles.totalRow}>
                                          <td colSpan={3}>
                                            <strong>
                                              {t("purchase.totalAmount")}
                                            </strong>
                                          </td>
                                          <td className={styles.rightAlign}>
                                            <strong>
                                              {formatCurrency(
                                                purchase.totalAmount
                                              )}
                                            </strong>
                                          </td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                )}
                              </div>
                            );
                          })}
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
    </>
  );
};