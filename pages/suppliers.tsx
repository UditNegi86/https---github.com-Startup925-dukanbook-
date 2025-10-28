import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Plus } from "lucide-react";
import { Button } from "../components/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/Tabs";
import { SupplierList } from "../components/SupplierList";
import { PurchaseList } from "../components/PurchaseList";
import { SupplierLedger } from "../components/SupplierLedger";
import { SupplierDialog } from "../components/SupplierDialog";
import { PurchaseDialog } from "../components/PurchaseDialog";
import { Selectable } from "kysely";
import { Suppliers } from "../helpers/schema";
import { PurchaseWithItemsAndSupplier } from "../endpoints/purchases_GET.schema";
import { useSuppliers } from "../helpers/useSupplierQueries";
import { usePurchases } from "../helpers/usePurchaseQueries";
import { useSuppliersLedger } from "../helpers/useLedgerQueries";
import { useLanguage } from "../helpers/useLanguage";
import styles from "./suppliers.module.css";

export default function SuppliersPage() {
  const { t } = useLanguage();
  const { data: suppliers = [], isFetching: isSuppliersLoading } = useSuppliers();
  const { data: purchases = [], isFetching: isPurchasesLoading } = usePurchases();
  const { data: supplierLedger = [], isFetching: isSupplierLedgerLoading } = useSuppliersLedger();
  
  const [activeTab, setActiveTab] = useState("suppliers");
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Selectable<Suppliers> | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseWithItemsAndSupplier | null>(null);

  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setIsSupplierDialogOpen(true);
  };

  const handleEditSupplier = (supplier: Selectable<Suppliers>) => {
    setSelectedSupplier(supplier);
    setIsSupplierDialogOpen(true);
  };

  const handleAddPurchase = () => {
    setSelectedPurchase(null);
    setIsPurchaseDialogOpen(true);
  };

  const handleEditPurchase = (purchase: PurchaseWithItemsAndSupplier) => {
    setSelectedPurchase(purchase);
    setIsPurchaseDialogOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>{t("supplier.pageTitle")}</title>
        <meta name="description" content={t("supplier.pageDescription")} />
      </Helmet>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>{t("supplier.suppliers")}</h1>
            <p className={styles.subtitle}>{t("supplier.subtitle")}</p>
          </div>
          {activeTab !== 'supplierLedger' && (
            <Button onClick={activeTab === 'suppliers' ? handleAddSupplier : handleAddPurchase}>
              <Plus size={16} />
              {activeTab === 'suppliers' ? t("supplier.addSupplier") : t("purchase.addPurchase")}
            </Button>
          )}
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className={styles.tabs}>
          <TabsList>
            <TabsTrigger value="suppliers">{t("supplier.suppliersTab")}</TabsTrigger>
            <TabsTrigger value="purchases">{t("purchase.purchasesTab")}</TabsTrigger>
            <TabsTrigger value="supplierLedger">{t("supplierLedger.supplierLedgerTab")}</TabsTrigger>
          </TabsList>
          <TabsContent value="suppliers" className={styles.tabContent}>
            <SupplierList 
              suppliers={suppliers} 
              isLoading={isSuppliersLoading}
              onEdit={handleEditSupplier} 
            />
          </TabsContent>
          <TabsContent value="purchases" className={styles.tabContent}>
            <PurchaseList 
              purchases={purchases}
              isLoading={isPurchasesLoading}
              onEdit={handleEditPurchase} 
            />
          </TabsContent>
          <TabsContent value="supplierLedger" className={styles.tabContent}>
            <SupplierLedger 
              suppliers={supplierLedger}
              isUpdating={isSupplierLedgerLoading}
            />
          </TabsContent>
        </Tabs>
      </div>

      <SupplierDialog
        isOpen={isSupplierDialogOpen}
        onClose={() => setIsSupplierDialogOpen(false)}
        supplier={selectedSupplier}
      />

      <PurchaseDialog
        isOpen={isPurchaseDialogOpen}
        onClose={() => setIsPurchaseDialogOpen(false)}
        purchase={selectedPurchase}
      />
    </>
  );
}