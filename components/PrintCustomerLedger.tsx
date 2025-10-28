import React, { forwardRef } from 'react';
import type { CustomerLedgerEntry } from '../endpoints/ledger/customers_GET.schema';
import { useLanguage } from '../helpers/useLanguage';
import styles from './PrintCustomerLedger.module.css';

interface PrintCustomerLedgerProps {
  customerLedger: CustomerLedgerEntry;
  className?: string;
}

const formatCurrency = (amount: number | string) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(Number(amount));
};

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const PrintCustomerLedger = forwardRef<
  HTMLDivElement,
  PrintCustomerLedgerProps
>(({ customerLedger, className }, ref) => {
  const { t } = useLanguage();

  if (!customerLedger || customerLedger.estimates.length === 0) {
    return null;
  }

  // Extract business details from the first estimate (all estimates belong to the same user)
  const userDetails = customerLedger.estimates[0].user;

  return (
    <div ref={ref} className={`${styles.container} ${className || ''}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('printCustomerLedger.ledgerTitle')}</h1>
        <div className={styles.companyDetails}>
          <p className={styles.companyName}>{userDetails.businessName}</p>
          {userDetails.address && <p>{userDetails.address}</p>}
          {userDetails.pinCode && <p>Pincode: {userDetails.pinCode}</p>}
          {userDetails.gstNumber && <p>GSTIN: {userDetails.gstNumber}</p>}
          {userDetails.contactNumber && <p>Contact: {userDetails.contactNumber}</p>}
        </div>
      </header>

      <section className={styles.customerInfo}>
        <div>
          <h2 className={styles.sectionTitle}>{t('printCustomerLedger.customerDetails')}</h2>
          <p>{customerLedger.customerName}</p>
          <p>{customerLedger.mobileNumber}</p>
        </div>
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span>{t('printCustomerLedger.totalEstimates')}</span>
            <strong>{customerLedger.estimateCount}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>{t('printCustomerLedger.totalAmountSpent')}</span>
            <strong>{formatCurrency(customerLedger.totalAmountSpent)}</strong>
          </div>
        </div>
      </section>

      <section className={styles.transactions}>
        <h2 className={styles.sectionTitle}>{t('printCustomerLedger.transactionHistory')}</h2>
        {customerLedger.estimates.map((estimate) => (
          <div key={estimate.id} className={styles.estimateCard}>
            <div className={styles.estimateHeader}>
              <div>
                <strong>{t('printCustomerLedger.estimateNumber')}</strong> {estimate.estimateNumber}
              </div>
              <div>
                <strong>{t('printCustomerLedger.date')}</strong> {formatDate(estimate.date)}
              </div>
              <div>
                <strong>{t('printCustomerLedger.payment')}</strong> {estimate.paymentType.toUpperCase()}
                {estimate.paymentType === 'credit' && estimate.expectedPaymentDate && (
                  <span className={styles.dueDate}> | {t('printCustomerLedger.due')} {formatDate(estimate.expectedPaymentDate)}</span>
                )}
              </div>
              <div className={styles.estimateTotal}>
                {formatCurrency(estimate.totalAmount)}
              </div>
            </div>
            <table className={styles.itemsTable}>
              <thead>
                <tr>
                  <th>{t('printCustomerLedger.description')}</th>
                  <th>{t('printCustomerLedger.qty')}</th>
                  <th>{t('printCustomerLedger.unitPrice')}</th>
                  <th>{t('printCustomerLedger.amount')}</th>
                </tr>
              </thead>
              <tbody>
                {estimate.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td>{Number(item.quantity)}</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td>{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className={styles.totalLabel}>
                    {t('printCustomerLedger.subtotal')}
                  </td>
                  <td className={styles.totalValue}>
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
                      {t('printCustomerLedger.discount')} ({Number(estimate.discountPercentage)}%)
                    </td>
                    <td className={`${styles.totalValue} ${styles.discountAmount}`}>
                      -{formatCurrency(estimate.discountAmount)}
                    </td>
                  </tr>
                )}
                {Number(estimate.taxPercentage) > 0 && (
                  <tr>
                    <td colSpan={3} className={styles.totalLabel}>
                      {t('printCustomerLedger.tax')} ({Number(estimate.taxPercentage)}%)
                    </td>
                    <td className={`${styles.totalValue} ${styles.taxAmount}`}>
                      +{formatCurrency(estimate.taxAmount)}
                    </td>
                  </tr>
                )}
                <tr className={styles.totalRow}>
                  <td colSpan={3} className={styles.totalLabel}>
                    <strong>{t('printCustomerLedger.totalAmount')}</strong>
                  </td>
                  <td className={styles.totalValue}>
                    <strong>{formatCurrency(estimate.totalAmount)}</strong>
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
          <span>{formatCurrency(customerLedger.totalAmountSpent)}</span>
        </div>
      </footer>
       <div className={styles.printFooter}>
            <p>{t('printCustomerLedger.computerGenerated')}</p>
        </div>
    </div>
  );
});

PrintCustomerLedger.displayName = 'PrintCustomerLedger';