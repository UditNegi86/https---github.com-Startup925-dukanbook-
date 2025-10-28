import React, { useState } from "react";
import { Selectable } from "kysely";
import { InventoryItems } from "../helpers/schema";
import { Button } from "./Button";
import { Edit, Trash2, PackageOpen } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { useLanguage } from "../helpers/useLanguage";
import { inventoryTranslationsData } from "../helpers/inventoryTranslations";
import { useDeleteInventoryItem } from "../helpers/useInventoryQueries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./Dialog";
import styles from "./InventoryTable.module.css";

type InventoryTableProps = {
  items: Selectable<InventoryItems>[];
  isLoading: boolean;
  onEdit: (item: Selectable<InventoryItems>) => void;
};

export const InventoryTable = ({
  items,
  isLoading,
  onEdit,
}: InventoryTableProps) => {
  const { t, language } = useLanguage();
  const it = inventoryTranslationsData[language];
  const [itemToDelete, setItemToDelete] = useState<Selectable<InventoryItems> | null>(null);
  const deleteMutation = useDeleteInventoryItem();

  const handleDeleteClick = (item: Selectable<InventoryItems>) => {
    setItemToDelete(item);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate({ id: itemToDelete.id }, {
        onSuccess: () => {
          setItemToDelete(null);
        }
      });
    }
  };

  if (isLoading) {
    return <InventoryTableSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <PackageOpen size={48} className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>{it.emptyTitle}</h3>
        <p className={styles.emptyText}>{it.emptyText}</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{it.itemName}</th>
              <th>{it.quantity}</th>
              <th>{it.purchaseValue}</th>
              <th>{it.salesValue}</th>
              <th>{it.actions}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td data-label={it.itemName}>{item.itemName}</td>
                <td data-label={it.quantity}>{Number(item.quantity).toLocaleString()}</td>
                <td data-label={it.purchaseValue}>{Number(item.purchaseValue).toLocaleString()}</td>
                <td data-label={it.salesValue}>{Number(item.salesValue).toLocaleString()}</td>
                <td data-label={it.actions} className={styles.actionsCell}>
                  <Button variant="ghost" size="icon-sm" onClick={() => onEdit(item)} title={t("common.edit")}>
                    <Edit size={16} />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteClick(item)} title={t("common.delete")} className={styles.deleteButton}>
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{it.deleteConfirmTitle}</DialogTitle>
            <DialogDescription>
              {it.deleteConfirmText.replace('{itemName}', itemToDelete?.itemName || '')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("common.cancel")}</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t("common.deleting") : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const InventoryTableSkeleton = () => (
  <div className={styles.tableContainer}>
    <table className={styles.table}>
      <thead>
        <tr>
          <th><Skeleton style={{ height: '1rem', width: '120px' }} /></th>
          <th><Skeleton style={{ height: '1rem', width: '80px' }} /></th>
          <th><Skeleton style={{ height: '1rem', width: '100px' }} /></th>
          <th><Skeleton style={{ height: '1rem', width: '100px' }} /></th>
          <th><Skeleton style={{ height: '1rem', width: '60px' }} /></th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 5 }).map((_, index) => (
          <tr key={index}>
            <td><Skeleton style={{ height: '1rem' }} /></td>
            <td><Skeleton style={{ height: '1rem' }} /></td>
            <td><Skeleton style={{ height: '1rem' }} /></td>
            <td><Skeleton style={{ height: '1rem' }} /></td>
            <td>
              <div className={styles.actionsCell}>
                <Skeleton style={{ height: '24px', width: '24px' }} />
                <Skeleton style={{ height: '24px', width: '24px' }} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);