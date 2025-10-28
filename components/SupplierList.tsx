import React, { useState } from "react";
import { Selectable } from "kysely";
import { Suppliers } from "../helpers/schema";
import { Button } from "./Button";
import { Edit, Trash2, Users } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { useDeleteSupplier } from "../helpers/useSupplierQueries";
import { useLanguage } from "../helpers/useLanguage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./Dialog";
import { Spinner } from "./Spinner";
import styles from "./SupplierList.module.css";

interface SupplierListProps {
  suppliers: Selectable<Suppliers>[];
  isLoading: boolean;
  onEdit: (supplier: Selectable<Suppliers>) => void;
}

export const SupplierList = ({
  suppliers,
  isLoading,
  onEdit,
}: SupplierListProps) => {
  const { t } = useLanguage();
  const [deleteCandidate, setDeleteCandidate] = useState<Selectable<Suppliers> | null>(null);
  const deleteMutation = useDeleteSupplier();

  const handleDelete = () => {
    if (deleteCandidate) {
      deleteMutation.mutate(
        { id: deleteCandidate.id },
        {
          onSuccess: () => {
            setDeleteCandidate(null);
          },
        },
      );
    }
  };

  if (isLoading) {
    return <SupplierListSkeleton />;
  }

  if (suppliers.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Users size={48} className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>{t("supplier.noSuppliersFound")}</h3>
        <p className={styles.emptyText}>
          {t("supplier.addSupplierPrompt")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t("supplier.supplierName")}</th>
              <th>{t("supplier.contact")}</th>
              <th>{t("supplier.email")}</th>
              <th>{t("supplier.gstNumber")}</th>
              <th>{t("supplier.address")}</th>
              <th className={styles.actionsColumn}>{t("supplier.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td data-label={t("supplier.supplierName")}>{supplier.supplierName}</td>
                <td data-label={t("supplier.contact")}>{supplier.contactNumber || t("supplier.notAvailable")}</td>
                <td data-label={t("supplier.email")}>{supplier.email || t("supplier.notAvailable")}</td>
                <td data-label={t("supplier.gstNumber")}>{supplier.gstNumber || t("supplier.notAvailable")}</td>
                <td data-label={t("supplier.address")} className={styles.addressCell}>{supplier.address || t("supplier.notAvailable")}</td>
                <td className={styles.actionsColumn}>
                  <div className={styles.actions}>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit(supplier)}
                      title={t("supplier.editSupplier")}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteCandidate(supplier)}
                      className={styles.deleteButton}
                      title={t("supplier.deleteSupplier")}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!deleteCandidate} onOpenChange={() => setDeleteCandidate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("supplier.deleteConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("supplier.deleteConfirmMessage", { supplierName: deleteCandidate?.supplierName || "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={deleteMutation.isPending}>
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Spinner size="sm" /> : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const SupplierListSkeleton = () => (
  <div className={styles.tableContainer}>
    <table className={styles.table}>
      <thead>
        <tr>
          <th><Skeleton style={{ height: '1rem', width: '120px' }} /></th>
          <th><Skeleton style={{ height: '1rem', width: '100px' }} /></th>
          <th><Skeleton style={{ height: '1rem', width: '150px' }} /></th>
          <th><Skeleton style={{ height: '1rem', width: '120px' }} /></th>
          <th><Skeleton style={{ height: '1rem', width: '200px' }} /></th>
          <th className={styles.actionsColumn}><Skeleton style={{ height: '1rem', width: '60px' }} /></th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 5 }).map((_, index) => (
          <tr key={index}>
            <td><Skeleton style={{ height: '1rem' }} /></td>
            <td><Skeleton style={{ height: '1rem' }} /></td>
            <td><Skeleton style={{ height: '1rem' }} /></td>
            <td><Skeleton style={{ height: '1rem' }} /></td>
            <td><Skeleton style={{ height: '1rem' }} /></td>
            <td className={styles.actionsColumn}>
              <div className={styles.actions}>
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