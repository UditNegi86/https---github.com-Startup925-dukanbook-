import React, { forwardRef } from 'react';
import type { SupplierLedgerEntry } from '../endpoints/ledger/suppliers_GET.schema';
import { useLanguage } from '../helpers/useLanguage';
import styles from './PrintSupplierLedger.module.css';
import { useAuth } from '../helpers/useAuth';

interface PrintSupplierLedgerProps {
  supplierLedger: SupplierLedgerEntry;
  className?: string;
}

const formatCurrency = (amount: number | string) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(Number(amount));
};

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const PrintSupplierLedger = forwardRef<
  HTMLDivElement,
  PrintSupplierLedgerProps
>(({ supplierLedger, className }, ref) => {
  const { t } = useLanguage();
  const { authState } = useAuth();

  if (!supplierLedger || supplierLedger.purchases.length === 0) {
    return null;
  }

  const userDetails = authState.type === 'authenticated' ? authState.user : null;

  return (
    <div ref={ref} className={`${styles.container} ${className || ''}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('supplier.suppliers')} {t('supplierLedger.ledgerTitle')}</h1>
        {userDetails && (
          <div className={styles.companyDetails}>
            <p className={styles.companyName}>{userDetails.businessName}</p>
            {userDetails.address && <p>{userDetails.address}</p>}
            {userDetails.pinCode && <p>Pincode: {userDetails.pinCode}</p>}
            {userDetails.gstNumber && <p>GSTIN: {userDetails.gstNumber}</p>}
            {userDetails.contactNumber && <p>Contact: {userDetails.contactNumber}</p>}
          </div>
        )}
      </header>

      <section className={styles.supplierInfo}>
        <div>
          <h2 className={styles.sectionTitle}>{t('supplierLedger.supplier')} {t('supplierLedger.details')}</h2>
          <p>{supplierLedger.supplierName}</p>
          {supplierLedger.contactNumber && <p>{supplierLedger.contactNumber}</p>}
          {supplierLedger.email && <p>{supplierLedger.email}</p>}
        </div>
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span>{t('supplierLedger.purchases')}</span>
            <strong>{supplierLedger.purchaseCount}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>{t('printCustomerLedger.totalAmountSpent')}</span>
            <strong>{formatCurrency(supplierLedger.totalAmountSpent)}</strong>
          </div>
        </div>
      </section>

      <section className={styles.transactions}>
        <h2 className={styles.sectionTitle}>{t('printCustomerLedger.transactionHistory')}</h2>
        {supplierLedger.purchases.map((purchase) => (
          <div key={purchase.id} className={styles.purchaseCard}>
            <div className={styles.purchaseHeader}>
              <div>
                <strong>{t('purchase.billNumber')}</strong> {purchase.billNumber || 'N/A'}
              </div>
              <div>
                <strong>{t('purchase.purchaseDate')}</strong> {formatDate(purchase.purchaseDate)}
              </div>
              <div>
                <strong>{t('purchase.paymentStatusLabel')}</strong> {t(`purchase.${purchase.paymentStatus.toLowerCase()}` as any)}
                {purchase.paymentStatus === 'pending' && purchase.paymentDueDate && (
                  <span className={styles.dueDate}> | {t('printCustomerLedger.due')} {formatDate(purchase.paymentDueDate)}</span>
                )}
              </div>
              <div className={styles.purchaseTotal}>
                {formatCurrency(purchase.totalAmount)}
              </div>
            </div>
            <table className={styles.itemsTable}>
              <thead>
                <tr>
                  <th>{t('purchase.itemName')}</th>
                  <th>{t('purchase.quantity')}</th>
                  <th>{t('purchase.unitPrice')}</th>
                  <th>{t('purchase.amount')}</th>
                </tr>
              </thead>
              <tbody>
                {purchase.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.itemName}</td>
                    <td>{Number(item.quantity)}</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td>{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className={styles.totalRow}>
                  <td colSpan={3} className={styles.totalLabel}>
                    <strong>{t('purchase.totalAmount')}</strong>
                  </td>
                  <td className={styles.totalValue}>
                    <strong>{formatCurrency(purchase.totalAmount)}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ))}
      </section>

      <footer className={styles.footer}>
        <div className={styles.grandTotal}>
          <span>{t('printCustomerLedger.grandTotal')}</span>
          <span>{formatCurrency(supplierLedger.totalAmountSpent)}</span>
        </div>
      </footer>
       <div className={styles.printFooter}>
            <p>{t('printCustomerLedger.computerGenerated')}</p>
        </div>
    </div>
  );
});

PrintSupplierLedger.displayName = 'PrintSupplierLedger';