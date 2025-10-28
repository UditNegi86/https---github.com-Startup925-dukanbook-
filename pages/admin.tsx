import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useLanguage } from "../helpers/useLanguage";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/Tabs";
import { AdminUsersTab } from "../components/AdminUsersTab";
import { AdminEstimatesTab } from "../components/AdminEstimatesTab";
import { AdminQueriesTab } from "../components/AdminQueriesTab";
import styles from "./admin.module.css";

export default function AdminPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("users");

  return (
    <>
      <Helmet>
        <title>{t("admin.pageTitle")}</title>
        <meta name="description" content={t("admin.metaDescription")} />
      </Helmet>
      <div className={styles.pageContainer}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>{t("admin.title")}</h1>
            <p className={styles.subtitle}>{t("admin.subtitle")}</p>
          </div>
        </header>

        <main>
          <Tabs value={activeTab} onValueChange={setActiveTab} className={styles.tabs}>
            <TabsList>
              <TabsTrigger value="users">{t("admin.usersTab")}</TabsTrigger>
              <TabsTrigger value="estimates">{t("admin.estimatesTab")}</TabsTrigger>
              <TabsTrigger value="queries">User Queries</TabsTrigger>
            </TabsList>
            <TabsContent value="users" className={styles.tabContent}>
              <AdminUsersTab />
            </TabsContent>
            <TabsContent value="estimates" className={styles.tabContent}>
              <AdminEstimatesTab />
            </TabsContent>
            <TabsContent value="queries" className={styles.tabContent}>
              <AdminQueriesTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}