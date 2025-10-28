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
import { Button } from "./Button";
import { useLanguage } from "../helpers/useLanguage";
import { inventoryTranslationsData } from "../helpers/inventoryTranslations";
import {
  useCreateInventoryItem,
  useUpdateInventoryItem,
} from "../helpers/useInventoryQueries";
import { schema as itemSchema } from "../endpoints/inventory/items_POST.schema";
import { Selectable } from "kysely";
import { InventoryItems } from "../helpers/schema";
import { z } from "zod";
import styles from "./InventoryItemDialog.module.css";

type InventoryItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Selectable<InventoryItems>;
  onSuccess: () => void;
};

export const InventoryItemDialog = ({
  open,
  onOpenChange,
  item,
  onSuccess,
}: InventoryItemDialogProps) => {
  const { t, language } = useLanguage();
  const it = inventoryTranslationsData[language];
  const isEditMode = !!item;

  const createMutation = useCreateInventoryItem();
  const updateMutation = useUpdateInventoryItem();
  const mutation = isEditMode ? updateMutation : createMutation;

  const form = useForm({
    schema: itemSchema,
    defaultValues: {
      itemName: "",
      quantity: 0,
      purchaseValue: 0,
      salesValue: 0,
    },
  });

  const { setValues } = form;

  useEffect(() => {
    if (open && item) {
      setValues({
        itemName: item.itemName,
        quantity: Number(item.quantity),
        purchaseValue: Number(item.purchaseValue),
        salesValue: Number(item.salesValue),
      });
    } else if (!open) {
      // Reset form when dialog is closed
      setValues({
        itemName: "",
        quantity: 0,
        purchaseValue: 0,
        salesValue: 0,
      });
    }
  }, [item, open, setValues]);

  const onSubmit = (values: z.infer<typeof itemSchema>) => {
    if (isEditMode) {
      updateMutation.mutate(
        { id: item.id, ...values },
        { onSuccess }
      );
    } else {
      createMutation.mutate(values, { onSuccess });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? it.editItem : it.addItem}
          </DialogTitle>
          <DialogDescription>
            {it.dialogDescription}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id="inventory-item-form">
            <FormItem name="itemName">
              <FormLabel>{it.itemName}</FormLabel>
              <FormControl>
                <Input
                  placeholder={it.itemNamePlaceholder}
                  value={form.values.itemName}
                  onChange={(e) =>
                    form.setValues((prev) => ({
                      ...prev,
                      itemName: e.target.value,
                    }))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            <div className={styles.grid}>
              <FormItem name="quantity">
                <FormLabel>{it.quantity}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.values.quantity}
                    onChange={(e) =>
                      form.setValues((prev) => ({
                        ...prev,
                        quantity: e.target.valueAsNumber || 0,
                      }))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
              <FormItem name="purchaseValue">
                <FormLabel>{it.purchaseValue}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={form.values.purchaseValue}
                    onChange={(e) =>
                      form.setValues((prev) => ({
                        ...prev,
                        purchaseValue: e.target.valueAsNumber || 0,
                      }))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>
            <FormItem name="salesValue">
                <FormLabel>{it.salesValue}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={form.values.salesValue}
                  onChange={(e) =>
                    form.setValues((prev) => ({
                      ...prev,
                      salesValue: e.target.valueAsNumber || 0,
                    }))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </form>
        </Form>
        <DialogFooter>
          <Button
            type="submit"
            form="inventory-item-form"
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? t("common.saving")
              : t("common.saveChanges")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};