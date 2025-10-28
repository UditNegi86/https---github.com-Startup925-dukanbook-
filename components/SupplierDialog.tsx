import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./Dialog";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "./Form";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Button } from "./Button";
import { Spinner } from "./Spinner";
import {
  useCreateSupplier,
  useUpdateSupplier,
} from "../helpers/useSupplierQueries";
import { useLanguage } from "../helpers/useLanguage";
import { schema as supplierSchema } from "../endpoints/suppliers_POST.schema";
import { Selectable } from "kysely";
import { Suppliers } from "../helpers/schema";
import { z } from "zod";
import styles from "./SupplierDialog.module.css";

interface SupplierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Selectable<Suppliers> | null;
}

export const SupplierDialog = ({
  isOpen,
  onClose,
  supplier,
}: SupplierDialogProps) => {
  const { t } = useLanguage();
  const isEditMode = !!supplier;
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const mutation = isEditMode ? updateMutation : createMutation;

  const form = useForm({
    schema: supplierSchema,
    defaultValues: {
      supplierName: "",
      contactNumber: "",
      email: "",
      address: "",
      gstNumber: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && supplier) {
        form.setValues({
          supplierName: supplier.supplierName,
          contactNumber: supplier.contactNumber ?? "",
          email: supplier.email ?? "",
          address: supplier.address ?? "",
          gstNumber: supplier.gstNumber ?? "",
          notes: supplier.notes ?? "",
        });
      } else {
        form.setValues({
          supplierName: "",
          contactNumber: "",
          email: "",
          address: "",
          gstNumber: "",
          notes: "",
        });
      }
    }
  }, [isOpen, isEditMode, supplier, form.setValues]);

  const onSubmit = (values: z.infer<typeof supplierSchema>) => {
    const payload = {
      ...values,
      contactNumber: values.contactNumber || null,
      email: values.email || null,
      address: values.address || null,
      gstNumber: values.gstNumber || null,
      notes: values.notes || null,
    };

    if (isEditMode && supplier) {
      updateMutation.mutate({ id: supplier.id, ...payload }, { onSuccess: onClose });
    } else {
      createMutation.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t("supplier.editSupplier") : t("supplier.addNewSupplier")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("supplier.editSupplierDescription")
              : t("supplier.addSupplierDescription")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
            <FormItem name="supplierName">
              <FormLabel>{t("supplier.supplierName")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("supplier.supplierNamePlaceholder")}
                  value={form.values.supplierName}
                  onChange={(e) => form.setValues((p) => ({ ...p, supplierName: e.target.value }))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <div className={styles.grid}>
              <FormItem name="contactNumber">
                <FormLabel>{t("supplier.contactNumber")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("supplier.contactNumberPlaceholder")}
                    value={form.values.contactNumber ?? ""}
                    onChange={(e) => form.setValues((p) => ({ ...p, contactNumber: e.target.value }))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
              <FormItem name="email">
                <FormLabel>{t("supplier.emailAddress")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("supplier.emailPlaceholder")}
                    value={form.values.email ?? ""}
                    onChange={(e) => form.setValues((p) => ({ ...p, email: e.target.value }))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>

            <FormItem name="gstNumber">
              <FormLabel>{t("supplier.gstNumber")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("supplier.gstNumberPlaceholder")}
                  value={form.values.gstNumber ?? ""}
                  onChange={(e) => form.setValues((p) => ({ ...p, gstNumber: e.target.value }))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem name="address">
              <FormLabel>{t("supplier.address")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("supplier.addressPlaceholder")}
                  rows={3}
                  value={form.values.address ?? ""}
                  onChange={(e) => form.setValues((p) => ({ ...p, address: e.target.value }))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem name="notes">
              <FormLabel>{t("supplier.notes")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("supplier.notesPlaceholder")}
                  rows={3}
                  value={form.values.notes ?? ""}
                  onChange={(e) => form.setValues((p) => ({ ...p, notes: e.target.value }))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? <Spinner size="sm" /> : isEditMode ? t("common.saveChanges") : t("supplier.createSupplier")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};