import { useLanguage } from "../helpers/useLanguage";
import { profileTranslationsData } from "../helpers/profileTranslations";
import { Badge } from "./Badge";
import { formatDate, toDateObject } from "../helpers/dateUtils";
import styles from "./ProfileFormSubscription.module.css";

interface ProfileFormSubscriptionProps {
  subscriptionStatus: string;
  subscriptionPlanMonths: number | null;
  subscriptionStartDate: Date | string | null;
  subscriptionEndDate: Date | string | null;
}

export function ProfileFormSubscription({
  subscriptionStatus,
  subscriptionPlanMonths,
  subscriptionStartDate,
  subscriptionEndDate,
}: ProfileFormSubscriptionProps) {
  const { language } = useLanguage();
  const pt = profileTranslationsData.profile[language];

  return (
    <div className={styles.subscriptionSection}>
      <h3 className={styles.subscriptionTitle}>{pt.subscriptionDetails}</h3>
      <div className={styles.subscriptionContent}>
        <div className={styles.subscriptionItem}>
          <span className={styles.subscriptionLabel}>Status:</span>
          <Badge
            variant={
              subscriptionStatus === "trial"
                ? "info"
                : subscriptionStatus === "pending"
                ? "warning"
                : subscriptionStatus === "active"
                ? "success"
                : subscriptionStatus === "expired"
                ? "destructive"
                : "default"
            }
          >
            {subscriptionStatus === "trial"
              ? "Free Trial"
              : subscriptionStatus === "pending"
              ? "Pending Approval"
              : subscriptionStatus === "active"
              ? "Active"
              : subscriptionStatus === "expired"
              ? "Expired"
              : subscriptionStatus}
          </Badge>
        </div>

        {subscriptionPlanMonths && (
          <div className={styles.subscriptionItem}>
            <span className={styles.subscriptionLabel}>
              {pt.subscriptionPlan}:
            </span>
            <span className={styles.subscriptionValue}>
              {subscriptionPlanMonths} {pt.monthsPlan}
            </span>
          </div>
        )}

        {subscriptionStartDate && (
          <div className={styles.subscriptionItem}>
            <span className={styles.subscriptionLabel}>{pt.startedOn}:</span>
            <span className={styles.subscriptionValue}>
              {formatDate(subscriptionStartDate)}
            </span>
          </div>
        )}

        {subscriptionEndDate && (
          <>
            <div className={styles.subscriptionItem}>
              <span className={styles.subscriptionLabel}>
                {subscriptionStatus === "expired" ? pt.expiredOn : pt.expiresOn}
                :
              </span>
              <span className={styles.subscriptionValue}>
                {formatDate(subscriptionEndDate)}
              </span>
            </div>

            {subscriptionStatus === "active" &&
              (() => {
                const endDateObj = toDateObject(subscriptionEndDate);
                if (!endDateObj) return null;
                
                const today = new Date();
                const daysRemaining = Math.ceil(
                  (endDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                );
                if (daysRemaining > 0) {
                  return (
                    <div className={styles.subscriptionItem}>
                      <span className={styles.subscriptionLabel}></span>
                      <span
                        className={styles.subscriptionValue}
                        style={{
                          color:
                            daysRemaining > 7
                              ? "var(--success)"
                              : "var(--warning)",
                          fontWeight: 600,
                        }}
                      >
                        {daysRemaining} {pt.daysRemaining}
                      </span>
                    </div>
                  );
                }
                return null;
              })()}
          </>
        )}
      </div>
    </div>
  );
}