import React, { useState, useRef, useMemo, useEffect } from "react";
import { ChevronDown, Printer, Hash, Calendar, IndianRupee } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { CustomerLedgerEntry } from "../endpoints/ledger/customers_GET.schema";
import { PaymentType } from "../helpers/schema";
import { useLanguage } from "../helpers/useLanguage";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Spinner } from "./Spinner";
import { PrintCustomerLedger } from "./PrintCustomerLedger";
import styles from "./CustomerLedger.module.css";

interface CustomerLedgerProps {
  customers: CustomerLedgerEntry[];
  isUpdating: boolean;
}

const PaymentBadge = ({ estimate }: { estimate: CustomerLedgerEntry['estimates'][number] }) => {
  const { t } = useLanguage();
  const { paymentType, paymentReceivedDate, paymentReceivedMode } = estimate;

      if (paymentType !== "credit") {
    const variantMap: Record<Exclude<PaymentType, "credit">, "info" | "success"> = {
      card: "info",
      cash: "success",
      upi: "info",
    };
    return <Badge variant={variantMap[paymentType]}>{paymentType}</Badge>;
  }

  // For credit estimates, show payment status
  if (paymentReceivedDate && paymentReceivedMode) {
    // Determine badge variant based on payment method used
    const paymentVariant = paymentReceivedMode === "cash" ? "success" : "info";
    
    return (
      <div className={styles.paymentStatus}>
        <Badge variant={paymentVariant}>{t("customerLedger.creditPaid")}</Badge>
        <div className={styles.paymentDetails}>
          {new Date(paymentReceivedDate).toLocaleDateString()}
        </div>
        <div className={styles.paymentDetails}>
          {t("customerLedger.via")} {paymentReceivedMode}
        </div>
      </div>
    );
  }

  return <Badge variant="warning">{t("customerLedger.creditPending")}</Badge>;
};

export const CustomerLedger = ({
  customers,
  isUpdating,
}: CustomerLedgerProps) => {
  const { t } = useLanguage();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPrintMobileNumber, setCurrentPrintMobileNumber] = useState<string | null>(null);
  
  // Create a map of refs for each customer
  const printRefsMap = useRef<Map<string, React.RefObject<HTMLDivElement | null>>>(new Map());

  // Initialize refs for all customers
  useMemo(() => {
    customers.forEach((customer) => {
      if (!printRefsMap.current.has(customer.mobileNumber)) {
        printRefsMap.current.set(customer.mobileNumber, React.createRef<HTMLDivElement>());
      }
    });
  }, [customers]);

  // Get current customer to print
  const currentPrintCustomer = useMemo(() => {
    return currentPrintMobileNumber 
      ? customers.find(c => c.mobileNumber === currentPrintMobileNumber) 
      : null;
  }, [currentPrintMobileNumber, customers]);

  const currentPrintRef = currentPrintMobileNumber 
    ? printRefsMap.current.get(currentPrintMobileNumber) 
    : undefined;

  // Set up print handler at top level
  const handlePrint = useReactToPrint({
    contentRef: currentPrintRef || React.createRef(),
    documentTitle: currentPrintCustomer 
      ? `Customer_Ledger_${currentPrintCustomer.customerName.replace(/\s+/g, '_')}_${currentPrintCustomer.mobileNumber}` 
      : 'Customer_Ledger',
    onAfterPrint: () => {
      console.log('Print completed or cancelled');
      setCurrentPrintMobileNumber(null);
    },
  });

  // Trigger print when currentPrintMobileNumber changes
  useEffect(() => {
    if (currentPrintMobileNumber && currentPrintRef?.current) {
      console.log('Triggering print for customer:', currentPrintMobileNumber);
      handlePrint();
    }
  }, [currentPrintMobileNumber, currentPrintRef, handlePrint]);

  const toggleRow = (mobileNumber: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(mobileNumber)) {
        newSet.delete(mobileNumber);
      } else {
        newSet.add(mobileNumber);
      }
      return newSet;
    });
  };

  const printCustomerLedger = (mobileNumber: string) => {
    console.log('Setting customer to print:', mobileNumber);
    setCurrentPrintMobileNumber(mobileNumber);
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(Number(value));
  };

  if (customers.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3>{t("customerLedger.noCustomerData")}</h3>
        <p>{t("customerLedger.createEstimatesPrompt")}</p>
      </div>
    );
  }

  return (
    <>
      {customers.map((customer) => {
        const printRef = printRefsMap.current.get(customer.mobileNumber);
        return (
          <PrintCustomerLedger
            key={`print-${customer.mobileNumber}`}
            ref={printRef}
            customerLedger={customer}
          />
        );
      })}
      <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.expandColumn}></th>
            <th>{t("customerLedger.customer")}</th>
            <th className={styles.centerAlign}>{t("customerLedger.estimates")}</th>
            <th className={styles.rightAlign}>{t("customerLedger.totalSpent")}</th>
            <th>{t("customerLedger.lastTransaction")}</th>
            <th className={styles.actionsColumn}>
              {isUpdating && <Spinner size="sm" />}
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => {
            const isExpanded = expandedRows.has(customer.mobileNumber);
            return (
              <React.Fragment key={customer.mobileNumber}>
                <tr className={styles.customerRow}>
                  <td className={styles.expandColumn}>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => toggleRow(customer.mobileNumber)}
                      className={`${styles.expandButton} ${isExpanded ? styles.expanded : ""}`}
                    >
                      <ChevronDown size={16} />
                    </Button>
                  </td>
                  <td>
                    <div className={styles.customerInfo}>
                      <div className={styles.customerName}>{customer.customerName}</div>
                      <div className={styles.customerMobile}>{customer.mobileNumber}</div>
                    </div>
                  </td>
                  <td className={styles.centerAlign}>{customer.estimateCount}</td>
                  <td className={styles.rightAlign + ' ' + styles.totalAmount}>
                    {formatCurrency(customer.totalAmountSpent)}
                  </td>
                  <td>{new Date(customer.lastTransactionDate).toLocaleDateString()}</td>
                  <td className={styles.actionsColumn}>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => printCustomerLedger(customer.mobileNumber)}
                      title={t("customerLedger.printCustomerLedger")}
                    >
                      <Printer size={16} />
                    </Button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className={styles.expandedRow}>
                    <td colSpan={6}>
                      <div className={styles.estimatesBreakdown}>
                        <h4 className={styles.breakdownTitle}>{t("customerLedger.transactionHistory")}</h4>
                        {customer.estimates.map(estimate => (
                          <div key={estimate.id} className={styles.estimateCard}>
                            <div className={styles.estimateHeader}>
                               <div className={styles.estimateDetail}>
                                <Hash size={14} /> #{estimate.estimateNumber}
                               </div>
                               <div className={styles.estimateDetail}>
                                <Calendar size={14} /> {new Date(estimate.date).toLocaleDateString()}
                               </div>
                               <div className={styles.estimateDetailAmount}>
                                <IndianRupee size={14} /> {formatCurrency(estimate.totalAmount)}
                               </div>
                               <PaymentBadge estimate={estimate} />
                            </div>
                            <div className={styles.itemsTableContainer}>
                                <table className={styles.itemsTable}>
                                    <tbody>
                                        {estimate.items.map(item => (
                                            <tr key={item.id}>
                                                <td>{item.description}</td>
                                                <td className={styles.rightAlign}>{Number(item.quantity)} x {formatCurrency(item.unitPrice)}</td>
                                                <td className={styles.rightAlign}>{formatCurrency(item.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                      <tr>
                                        <td colSpan={2} className={styles.totalLabel}>
                                          {t("customerLedger.subtotal")}
                                        </td>
                                        <td className={styles.rightAlign}>
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
                                          <td colSpan={2} className={styles.totalLabel}>
                                            {t("customerLedger.discount")} ({Number(estimate.discountPercentage)}%)
                                          </td>
                                          <td className={`${styles.rightAlign} ${styles.discountAmount}`}>
                                            -{formatCurrency(estimate.discountAmount)}
                                          </td>
                                        </tr>
                                      )}
                                      {Number(estimate.taxPercentage) > 0 && (
                                        <tr>
                                          <td colSpan={2} className={styles.totalLabel}>
                                            {t("customerLedger.tax")} ({Number(estimate.taxPercentage)}%)
                                          </td>
                                          <td className={`${styles.rightAlign} ${styles.taxAmount}`}>
                                            +{formatCurrency(estimate.taxAmount)}
                                          </td>
                                        </tr>
                                      )}
                                      <tr className={styles.totalRow}>
                                        <td colSpan={2} className={styles.totalLabel}>
                                          <strong>{t("customerLedger.totalAmount")}</strong>
                                        </td>
                                        <td className={styles.rightAlign}>
                                          <strong>{formatCurrency(estimate.totalAmount)}</strong>
                                        </td>
                                      </tr>
                                    </tfoot>
                                </table>
                            </div>
                          </div>
                        ))}
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