import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Plus } from "lucide-react";
import { useLanguage } from "../helpers/useLanguage";
import { inventoryTranslationsData } from "../helpers/inventoryTranslations";
import { useInventoryItems } from "../helpers/useInventoryQueries";
import { InventoryTable } from "../components/InventoryTable";
import { InventoryItemDialog } from "../components/InventoryItemDialog";
import { Button } from "../components/Button";
import { Selectable } from "kysely";
import { InventoryItems } from "../helpers/schema";
import styles from "./inventory.module.css";

export default function InventoryPage() {
  const { t, language } = useLanguage();
  const it = inventoryTranslationsData[language];
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<
    Selectable<InventoryItems> | undefined
  >(undefined);

  const {
    data: inventoryItems,
    isFetching,
    error,
  } = useInventoryItems();

  const handleAddItem = () => {
    setSelectedItem(undefined);
    setIsDialogOpen(true);
  };

  const handleEditItem = (item: Selectable<InventoryItems>) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    setIsDialogOpen(false);
    setSelectedItem(undefined);
  };

  return (
    <>
      <Helmet>
        <title>{it.pageTitle}</title>
        <meta
          name="description"
          content={it.pageDescription}
        />
      </Helmet>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>{it.pageTitle}</h1>
            <p className={styles.subtitle}>
              {it.pageSubtitle}
            </p>
          </div>
          <Button onClick={handleAddItem}>
            <Plus size={16} />
            {it.addItem}
          </Button>
        </header>

        <main className={styles.mainContent}>
          {error && (
            <div className={styles.errorState}>
              <p>{t("common.error")}: {error.message}</p>
            </div>
          )}
          <InventoryTable
            items={inventoryItems ?? []}
            isLoading={isFetching}
            onEdit={handleEditItem}
          />
        </main>
      </div>

      <InventoryItemDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        item={selectedItem}
        onSuccess={handleDialogSuccess}
      />
    </>
  );
}