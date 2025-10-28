import React from "react";
import { Helmet } from "react-helmet";
import { useCustomersLedger } from "../helpers/useLedgerQueries";
import { CustomerLedger } from "../components/CustomerLedger";
import { Skeleton } from "../components/Skeleton";
import { useLanguage } from "../helpers/useLanguage";
import styles from "./ledger.module.css";

const LedgerPage = () => {
  const { t } = useLanguage();
  // Note: Date range filtering UI can be added here in the future
  const { data, error, isFetching } = useCustomersLedger();

  const renderContent = () => {
    if (isFetching && !data) {
      return (
        <div className={styles.skeletonContainer}>
          <Skeleton style={{ height: "2.5rem", width: "100%" }} />
          <Skeleton style={{ height: "2.5rem", width: "100%" }} />
          <Skeleton style={{ height: "2.5rem", width: "100%" }} />
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorState}>
          <h3>{t("ledger.errorFetching")}</h3>
          <p>{error.message}</p>
        </div>
      );
    }

    if (data) {
      return <CustomerLedger customers={data} isUpdating={isFetching} />;
    }

    return null;
  };

  return (
    <>
      <Helmet>
        <title>{t("ledger.pageTitle")}</title>
        <meta
          name="description"
          content={t("ledger.metaDescription")}
        />
      </Helmet>
      <div className={styles.pageContainer}>
        <header className={styles.header}>
          <h1 className={styles.title}>{t("ledger.title")}</h1>
          <p className={styles.subtitle}>
            {t("ledger.subtitle")}
          </p>
        </header>
        <main className={styles.content}>{renderContent()}</main>
      </div>
    </>
  );
};

export default LedgerPage;