import React from "react";
import { useLanguage } from "../helpers/useLanguage";
import { useEstimateFormLogic } from "../helpers/useEstimateFormLogic";
import { EstimateWithItems } from "../endpoints/estimates_GET.schema";
import { EstimateFormFields } from "./EstimateFormFields";
import { EstimateItemsTable } from "./EstimateItemsTable";
import { EstimateTotalsSection } from "./EstimateTotalsSection";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./Dialog";
import { Form, FormControl, FormItem, FormLabel, FormMessage } from "./Form";
import { Textarea } from "./Textarea";
import { Button } from "./Button";
import { Spinner } from "./Spinner";
import styles from "./EstimateDialog.module.css";

interface EstimateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  estimate: EstimateWithItems | null;
  userIsActive: boolean;
}

export const EstimateDialog = ({
  isOpen,
  onClose,
  estimate,
  userIsActive,
}: EstimateDialogProps) => {
  const { t } = useLanguage();
  const {
    form,
    values,
    setValues,
    handleSubmit,
    isEditMode,
    mutation,
    onSubmit,
    calculations,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
  } = useEstimateFormLogic(estimate, isOpen, onClose);

  const dialogDescription = isEditMode && estimate
    ? t("estimateDialog.editDescription", {
        estimateNumber: estimate.estimateNumber.toString(),
        customerName: estimate.customerName,
      })
    : t("estimateDialog.createDescription");

  // Don't allow opening dialog if user is not active
  if (!userIsActive) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t("estimateDialog.editTitle") : t("estimateDialog.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <EstimateFormFields
              values={values}
              setValues={setValues}
              isEditMode={isEditMode}
            />

            <EstimateItemsTable
              items={values.items}
              handleItemChange={handleItemChange}
              handleRemoveItem={handleRemoveItem}
              handleAddItem={handleAddItem}
            />

            <FormItem name="notes" className={styles.notesField}>
              <FormLabel>{t("estimateDialog.notesOptional")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("estimateDialog.notesPlaceholder")}
                  value={values.notes ?? ""}
                  onChange={(e) =>
                    setValues((p) => ({ ...p, notes: e.target.value }))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <EstimateTotalsSection
              values={values}
              setValues={setValues}
              calculations={calculations}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={mutation.isPending}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <Spinner size="sm" />
                ) : isEditMode ? (
                  t("estimateDialog.saveChanges")
                ) : (
                  t("estimateDialog.createEstimate")
                )}
              </Button>
            </DialogFooter>
            {mutation.error && (
              <p className={styles.mutationError}>
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : t("estimateDialog.unknownError")}
              </p>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};