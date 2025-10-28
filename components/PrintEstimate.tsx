import React, { forwardRef } from 'react';
import type { EstimateWithItems } from '../endpoints/estimates_GET.schema';
import { useLanguage } from '../helpers/useLanguage';
import styles from './PrintEstimate.module.css';

interface PrintEstimateProps {
  estimate: EstimateWithItems;
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

export const PrintEstimate = forwardRef<HTMLDivElement, PrintEstimateProps>(
  ({ estimate, className }, ref) => {
    const { t } = useLanguage();

    if (!estimate) {
      return null;
    }

    return (
      <div ref={ref} className={`${styles.container} ${className || ''}`}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            {estimate.billNumber ? t('printEstimate.bill') : t('printEstimate.estimate')}
          </h1>
          <div className={styles.companyDetails}>
            <p className={styles.companyName}>{estimate.user.businessName}</p>
            {estimate.user.address && <p>{estimate.user.address}</p>}
            {estimate.user.pinCode && <p>{estimate.user.pinCode}</p>}
            {estimate.user.gstNumber && <p>GSTIN: {estimate.user.gstNumber}</p>}
            {estimate.user.contactNumber && <p>{estimate.user.contactNumber}</p>}
          </div>
        </header>

        <section className={styles.metaInfo}>
          <div className={styles.customerInfo}>
            <h2 className={styles.sectionTitle}>{t('printEstimate.billTo')}</h2>
            <p>{estimate.customerName}</p>
            <p>{estimate.mobileNumber}</p>
          </div>
          <div className={styles.estimateDetails}>
            <p>
              <strong>{t('printEstimate.estimateNumber')}</strong> {estimate.estimateNumber}
            </p>
            {estimate.billNumber && (
              <p>
                <strong>{t('printEstimate.billNumber')}</strong> {estimate.billNumber}
              </p>
            )}
            <p>
              <strong>{t('printEstimate.date')}</strong> {formatDate(estimate.date)}
            </p>
          </div>
        </section>

        <section className={styles.itemsSection}>
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th>{t('printEstimate.description')}</th>
                <th>{t('printEstimate.quantity')}</th>
                <th>{t('printEstimate.unitPrice')}</th>
                <th>{t('printEstimate.amount')}</th>
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
          </table>
        </section>

        <footer className={styles.footer}>
          <div className={styles.notesAndPayment}>
            {estimate.notes && (
              <div className={styles.notes}>
                <h3 className={styles.sectionTitle}>{t('printEstimate.notes')}</h3>
                <p>{estimate.notes}</p>
              </div>
            )}
            <div className={styles.paymentType}>
              <h3 className={styles.sectionTitle}>{t('printEstimate.paymentType')}</h3>
              <p>{estimate.paymentType.toUpperCase()}</p>
              {estimate.paymentType === 'credit' && estimate.expectedPaymentDate && (
                <div className={styles.expectedPaymentDate}>
                  <strong>{t('printEstimate.expectedPaymentDate')}</strong> {formatDate(estimate.expectedPaymentDate)}
                </div>
              )}
            </div>
          </div>
          <div className={styles.totalSection}>
            <div className={styles.totalRow}>
              <span>{t('printEstimate.subtotal')}</span>
              <span>{formatCurrency(
                estimate.items.reduce(
                  (sum, item) => sum + Number(item.amount),
                  0
                )
              )}</span>
            </div>
            {Number(estimate.discountPercentage) > 0 && (
              <div className={`${styles.totalRow} ${styles.discountRow}`}>
                <span>{t('printEstimate.discount')} ({Number(estimate.discountPercentage)}%)</span>
                <span>-{formatCurrency(estimate.discountAmount)}</span>
              </div>
            )}
            {Number(estimate.taxPercentage) > 0 && (
              <div className={`${styles.totalRow} ${styles.taxRow}`}>
                <span>{t('printEstimate.tax')} ({Number(estimate.taxPercentage)}%)</span>
                <span>+{formatCurrency(estimate.taxAmount)}</span>
              </div>
            )}
            <div className={`${styles.totalRow} ${styles.grandTotal}`}>
              <span><strong>{t('printEstimate.totalAmount')}</strong></span>
              <span><strong>{formatCurrency(estimate.totalAmount)}</strong></span>
            </div>
          </div>
        </footer>
        <div className={styles.printFooter}>
            <p>{t('printEstimate.thankYou')}</p>
        </div>
      </div>
    );
  }
);

PrintEstimate.displayName = 'PrintEstimate';