import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useLanguage } from "../helpers/useLanguage";
import { useAuth } from "../helpers/useAuth";
import { useMarketplaceItems, useMarketplaceOrders } from "../helpers/useMarketplaceQueries";
import { Selectable } from "kysely";
import { MarketplaceItems } from "../helpers/schema";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/Tabs";
import { Skeleton } from "../components/Skeleton";
import { MarketplaceItemCard } from "../components/MarketplaceItemCard";
import { MarketplaceOrderDialog } from "../components/MarketplaceOrderDialog";
import { MarketplaceAdminPanel } from "../components/MarketplaceAdminPanel";
import styles from "./marketplace.module.css";

export default function MarketplacePage() {
  const { t } = useLanguage();
  const { authState } = useAuth();
  const { data: items, isFetching: isFetchingItems, error: itemsError } = useMarketplaceItems();
  const { data: orders, isFetching: isFetchingOrders, error: ordersError } = useMarketplaceOrders();

  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Selectable<MarketplaceItems> | null>(null);

  const user = authState.type === "authenticated" ? authState.user : null;
  const isAdmin = user?.role === "admin";

  const handleOrderClick = (item: Selectable<MarketplaceItems>) => {
    setSelectedItem(item);
    setIsOrderDialogOpen(true);
  };

  const renderShopContent = () => {
    if (isFetchingItems) {
      return (
        <div className={styles.itemsGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <Skeleton style={{ height: '150px', width: '100%', borderRadius: 'var(--radius) var(--radius) 0 0' }} />
              <div className={styles.skeletonContent}>
                <Skeleton style={{ height: '1.25rem', width: '80%' }} />
                <Skeleton style={{ height: '1rem', width: '50%' }} />
                <Skeleton style={{ height: '2rem', width: '100%', marginTop: 'var(--spacing-2)' }} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (itemsError) {
      return <div className={styles.errorState}>{itemsError.message}</div>;
    }

    if (!items || items.length === 0) {
      return <div className={styles.emptyState}>{t("marketplace.noItems")}</div>;
    }

    return (
      <div className={styles.itemsGrid}>
        {items.map((item) => (
          <MarketplaceItemCard key={item.id} item={item} onOrderClick={handleOrderClick} />
        ))}
      </div>
    );
  };

  const renderUserOrders = () => {
    if (isFetchingOrders) {
      return <Skeleton style={{ height: '100px', width: '100%' }} />;
    }
    if (ordersError) {
      return <div className={styles.errorState}>{ordersError.message}</div>;
    }
    if (!orders || orders.length === 0) {
      return <div className={styles.emptyState}>{t("marketplace.noOrders")}</div>;
    }
    // A simple list for now. A more detailed component could be made.
    return (
      <div className={styles.ordersList}>
        {orders.map(order => (
          <div key={order.id} className={styles.orderItem}>
            <span>Order #{order.id}</span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            <span>₹{order.totalAmount}</span>
            <span className={styles.status}>{t(`marketplaceAdmin.${order.status}` as any)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>{t("marketplace.pageTitle")}</title>
        <meta name="description" content={t("marketplace.metaDescription")} />
      </Helmet>
      <div className={styles.pageContainer}>
        <Tabs defaultValue="shop" className={styles.tabs}>
          <TabsList>
            <TabsTrigger value="shop">{t("marketplace.shopTab")}</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin">{t("marketplace.adminTab")}</TabsTrigger>}
          </TabsList>
          <TabsContent value="shop" className={styles.tabContent}>
            {renderShopContent()}
            {!isAdmin && (
              <div className={styles.myOrdersSection}>
                <h2>{t("marketplace.myOrders")}</h2>
                {renderUserOrders()}
              </div>
            )}
          </TabsContent>
          {isAdmin && (
            <TabsContent value="admin" className={styles.tabContent}>
              <MarketplaceAdminPanel />
            </TabsContent>
          )}
        </Tabs>
      </div>
      {selectedItem && (
        <MarketplaceOrderDialog
          item={selectedItem}
          isOpen={isOrderDialogOpen}
          onClose={() => setIsOrderDialogOpen(false)}
        />
      )}
    </>
  );
}