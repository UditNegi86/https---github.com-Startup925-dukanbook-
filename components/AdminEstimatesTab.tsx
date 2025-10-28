import React, { useState, useMemo } from "react";
import { useLanguage } from "../helpers/useLanguage";
import { useAdminEstimates, useAdminUsers } from "../helpers/useAdminQueries";
import { Skeleton } from "./Skeleton";
import { Input } from "./Input";
import { Badge } from "./Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";
import { Search, Calendar, Phone, Building2, CreditCard, IndianRupee } from "lucide-react";
import styles from "./AdminEstimatesTab.module.css";
import { formatDate, formatCurrency, getRelativeTimeString } from "../helpers/dateUtils";

const STATUS_TRANSLATION_MAP = {
  completed: "common.completed" as const,
  draft: "common.draft" as const,
};

const PAYMENT_TYPE_TRANSLATION_MAP = {
  cash: "common.cash" as const,
  card: "common.card" as const,
  upi: "common.upi" as const,
  credit: "common.credit" as const,
};

const PAYMENT_TYPE_ICONS = {
  cash: IndianRupee,
  card: CreditCard,
  upi: CreditCard,
  credit: CreditCard,
};

export const AdminEstimatesTab = () => {
  const { t } = useLanguage();
  const [selectedUserId, setSelectedUserId] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users, isFetching: isFetchingUsers } = useAdminUsers();
  const { data: estimates, isFetching, error } = useAdminEstimates({
    userId: selectedUserId === "all" ? undefined : selectedUserId,
  });

  const filteredEstimates = useMemo(() => {
    if (!estimates) return [];
    if (!searchQuery.trim()) return estimates;

    const query = searchQuery.toLowerCase().trim();
    return estimates.filter(
      (estimate) =>
        estimate.customerName.toLowerCase().includes(query) ||
        estimate.mobileNumber.includes(query) ||
        estimate.estimateNumber.toLowerCase().includes(query) ||
        estimate.user.businessName.toLowerCase().includes(query)
    );
  }, [estimates, searchQuery]);

  const renderContent = () => {
    if ((isFetching && !estimates) || (isFetchingUsers && !users)) {
      return (
        <div className={styles.skeletonContainer}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} style={{ height: "3rem" }} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorState}>
          <p>{t("admin.errorLoadingEstimates")}</p>
          <p><em>{error.message}</em></p>
        </div>
      );
    }

    if (!filteredEstimates || filteredEstimates.length === 0) {
        return <div className={styles.emptyState}>{t("admin.noEstimatesFound")}</div>;
    }

    return (
      <>
        {/* Desktop Table View */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("admin.estimates.estimateNo")}</th>
                <th>{t("admin.estimates.customer")}</th>
                <th>{t("admin.estimates.businessName")}</th>
                <th>{t("admin.estimates.date")}</th>
                <th>{t("admin.estimates.amount")}</th>
                <th>{t("admin.estimates.paymentType")}</th>
                <th>{t("admin.estimates.status")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredEstimates.map((estimate) => (
                <tr key={estimate.id}>
                  <td data-label={t("admin.estimates.estimateNo")}>{estimate.estimateNumber}</td>
                  <td data-label={t("admin.estimates.customer")}>{estimate.customerName}</td>
                  <td data-label={t("admin.estimates.businessName")}>{estimate.user.businessName}</td>
                  <td data-label={t("admin.estimates.date")}>{new Date(estimate.date).toLocaleDateString()}</td>
                  <td data-label={t("admin.estimates.amount")}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(estimate.totalAmount))}</td>
                  <td data-label={t("admin.estimates.paymentType")}><span className={styles.paymentType}>{t(PAYMENT_TYPE_TRANSLATION_MAP[estimate.paymentType as keyof typeof PAYMENT_TYPE_TRANSLATION_MAP] || estimate.paymentType)}</span></td>
                  <td data-label={t("admin.estimates.status")}><span className={`${styles.statusBadge} ${styles[estimate.status as keyof typeof styles]}`}>{t(STATUS_TRANSLATION_MAP[estimate.status as keyof typeof STATUS_TRANSLATION_MAP] || estimate.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className={styles.cardsContainer}>
          {filteredEstimates.map((estimate) => {
            const PaymentIcon = PAYMENT_TYPE_ICONS[estimate.paymentType as keyof typeof PAYMENT_TYPE_ICONS] || CreditCard;
            
            return (
              <div key={estimate.id} className={styles.estimateCard}>
                {/* Card Header */}
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderContent}>
                    <h3 className={styles.estimateNumber}>{estimate.estimateNumber}</h3>
                    <Badge variant={estimate.status === 'completed' ? 'success' : 'warning'}>
                      {t(STATUS_TRANSLATION_MAP[estimate.status as keyof typeof STATUS_TRANSLATION_MAP] || estimate.status)}
                    </Badge>
                  </div>
                  <div className={styles.customerName}>{estimate.customerName}</div>
                  <div className={styles.dateInfo}>
                    <Calendar size={14} />
                    <span>{formatDate(estimate.date)}</span>
                  </div>
                </div>

                {/* Business Info Section */}
                <div className={styles.cardSection}>
                  <div className={styles.sectionTitle}>Business</div>
                  <div className={styles.infoRow}>
                    <Building2 size={16} className={styles.icon} />
                    <span>{estimate.user.businessName}</span>
                  </div>
                </div>

                {/* Contact Info Section */}
                <div className={styles.cardSection}>
                  <div className={styles.sectionTitle}>Contact</div>
                  <div className={styles.infoRow}>
                    <Phone size={16} className={styles.icon} />
                    <span>{estimate.mobileNumber}</span>
                  </div>
                </div>

                {/* Payment Section */}
                <div className={styles.cardSection}>
                  <div className={styles.sectionTitle}>Payment Method</div>
                  <div className={styles.paymentBadge}>
                    <PaymentIcon size={16} />
                    <Badge variant="outline" className={styles.paymentTypeBadge}>
                      {t(PAYMENT_TYPE_TRANSLATION_MAP[estimate.paymentType as keyof typeof PAYMENT_TYPE_TRANSLATION_MAP] || estimate.paymentType)}
                    </Badge>
                  </div>
                </div>

                {/* Amount Section */}
                <div className={styles.cardSection}>
                  <div className={styles.amountSection}>
                    <div className={styles.amountLabel}>
                      <IndianRupee size={16} className={styles.amountIcon} />
                      <span>Total Amount</span>
                    </div>
                    <div className={styles.amountValue}>{formatCurrency(estimate.totalAmount)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.searchInputWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <Input
            type="text"
            placeholder={t("admin.estimates.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <Select
          value={String(selectedUserId)}
          onValueChange={(value) => setSelectedUserId(value === "all" ? "all" : Number(value))}
        >
          <SelectTrigger className={styles.userFilter}>
            <SelectValue placeholder={t("admin.estimates.filterByUser")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.allUsers")}</SelectItem>
            {users?.map((user) => (
              <SelectItem key={user.id} value={String(user.id)}>
                {user.businessName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {renderContent()}
    </div>
  );
};