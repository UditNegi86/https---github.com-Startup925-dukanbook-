import React, { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Selectable } from "kysely";
import { Calendar as CalendarIcon, Plus, Trash2, FileUp, FileCheck } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import { Popover, PopoverTrigger, PopoverContent } from "./Popover";
import { Calendar } from "./Calendar";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Button } from "./Button";
import { Spinner } from "./Spinner";
import { FileDropzone } from "./FileDropzone";
import { useSuppliers } from "../helpers/useSupplierQueries";
import {
  useCreatePurchase,
  useUpdatePurchase,
} from "../helpers/usePurchaseQueries";
import { useLanguage } from "../helpers/useLanguage";
import { schema as purchaseSchema } from "../endpoints/purchases_POST.schema";
import { PurchaseWithItemsAndSupplier } from "../endpoints/purchases_GET.schema";
import { formatDate } from "../helpers/dateUtils";
import styles from "./PurchaseDialog.module.css";

interface PurchaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: PurchaseWithItemsAndSupplier | null;
}

type FormValues = z.infer<typeof purchaseSchema>;

export const PurchaseDialog = ({
  isOpen,
  onClose,
  purchase,
}: PurchaseDialogProps) => {
  const { t } = useLanguage();
  const isEditMode = !!purchase;
  const { data: suppliers, isLoading: suppliersLoading } = useSuppliers();
  const createMutation = useCreatePurchase();
  const updateMutation = useUpdatePurchase();
  const mutation = isEditMode ? updateMutation : createMutation;

  const [billFile, setBillFile] = useState<{name: string; type: string; data: string} | null>(null);

  const form = useForm({
    schema: purchaseSchema,
    defaultValues: {
      supplierId: 0,
      purchaseDate: new Date(),
      billNumber: "",
      totalAmount: 0,
      paymentStatus: "pending",
      paymentDate: null,
      paymentDueDate: null,
      paymentMode: null,
      paymentReference: null,
      notes: "",
  items: [{ itemName: "", quantity: 1, unitPrice: 0, addToInventory: false }],
    },
  });

  const { values, setValues } = form;

  const totalAmount = useMemo(() => {
    return values.items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
      0,
    );
  }, [values.items]);

  // Normalize totalAmount - convert NaN to 0 to prevent infinite loops
  const normalizedTotal = Number.isFinite(totalAmount) ? totalAmount : 0;

  useEffect(() => {
    setValues((prev) => {
      // Use Object.is for comparison which handles NaN correctly
      if (Object.is(prev.totalAmount, normalizedTotal)) {
        return prev; // Return the same object to prevent re-render
      }
      return { ...prev, totalAmount: normalizedTotal };
    });
  }, [normalizedTotal, setValues]);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && purchase) {
        setValues({
          supplierId: purchase.supplierId,
          purchaseDate: new Date(purchase.purchaseDate),
          billNumber: purchase.billNumber ?? "",
          totalAmount: Number(purchase.totalAmount),
          paymentStatus: purchase.paymentStatus as "paid" | "pending",
          paymentDate: purchase.paymentDate ? new Date(purchase.paymentDate) : null,
          paymentDueDate: purchase.paymentDueDate ? new Date(purchase.paymentDueDate) : null,
          paymentMode: purchase.paymentMode as "cash" | "card" | "bank_transfer" | "upi" | null,
          paymentReference: purchase.paymentReference ?? null,
          notes: purchase.notes ?? "",
          items: purchase.items.map(item => ({
            itemName: item.itemName,
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            addToInventory: false,
          })),
        });
        if (purchase.billFileName && purchase.billFileType && purchase.billFileData) {
            setBillFile({ name: purchase.billFileName, type: purchase.billFileType, data: purchase.billFileData });
        }
      } else {
        // Reset to default values directly
        setValues({
          supplierId: 0,
          purchaseDate: new Date(),
          billNumber: "",
          totalAmount: 0,
          paymentStatus: "pending",
          paymentDate: null,
          paymentDueDate: null,
          paymentMode: null,
          paymentReference: null,
          notes: "",
          items: [{ itemName: "", quantity: 1, unitPrice: 0, addToInventory: false }],
        });
        setBillFile(null);
      }
    }
  }, [isOpen, isEditMode, purchase, setValues]);

  const handleItemChange = (
    index: number,
    field: keyof FormValues["items"][0],
    value: string | number | boolean,
  ) => {
    setValues((prev) => {
      const newItems = [...prev.items];
      (newItems[index] as any)[field] = value;
      return { ...prev, items: newItems };
    });
  };

  const handleAddItem = () => {
    setValues((prev) => ({
      ...prev,
      items: [...prev.items, { itemName: "", quantity: 1, unitPrice: 0, addToInventory: false }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setValues((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleFileSelect = (files: File[]) => {
    const file = files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        setBillFile({ name: file.name, type: file.type, data: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: FormValues) => {
    console.log("[PurchaseDialog] onSubmit - Raw form data:", data);
    console.log("[PurchaseDialog] onSubmit - Payment status in form data:", data.paymentStatus);
    console.log("[PurchaseDialog] onSubmit - Current form values state:", values);
    
    const payload = {
        ...data,
        billFileData: billFile?.data,
        billFileName: billFile?.name,
        billFileType: billFile?.type,
    };
    
    console.log("[PurchaseDialog] onSubmit - Final payload before mutation:", payload);
    console.log("[PurchaseDialog] onSubmit - Payment status in payload:", payload.paymentStatus);
    
    if (isEditMode && purchase) {
      const updateData = { id: purchase.id, ...payload };
      console.log("[PurchaseDialog] onSubmit - Update mutation data (with ID):", updateData);
      updateMutation.mutate(updateData, { onSuccess: onClose });
    } else {
      console.log("[PurchaseDialog] onSubmit - Create mutation data:", payload);
      createMutation.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t("purchase.editPurchase") : t("purchase.addNewPurchase")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? t("purchase.editPurchaseDescription") : t("purchase.addPurchaseDescription")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.grid}>
              <FormItem name="supplierId">
                <FormLabel>{t("purchase.supplier")}</FormLabel>
                <Select
                  value={values.supplierId > 0 ? String(values.supplierId) : ""}
                  onValueChange={(val) => setValues((p) => ({ ...p, supplierId: Number(val) }))}
                  disabled={suppliersLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("purchase.selectSupplier")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {suppliers?.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.supplierName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
              <FormItem name="purchaseDate">
                <FormLabel>{t("purchase.purchaseDate")}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" className={styles.dateButton}>
                        {values.purchaseDate ? formatDate(values.purchaseDate) : t("purchase.selectDate")}
                        <CalendarIcon size={16} />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent removeBackgroundAndPadding>
                    <Calendar
                      mode="single"
                      selected={values.purchaseDate}
                      onSelect={(date) => date && setValues((p) => ({ ...p, purchaseDate: date }))}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            </div>

            <div className={styles.grid}>
                <FormItem name="billNumber">
                    <FormLabel>{t("purchase.billNumber")}</FormLabel>
                    <FormControl>
                        <Input placeholder={t("purchase.billNumberPlaceholder")} value={values.billNumber ?? ""} onChange={e => setValues(p => ({...p, billNumber: e.target.value}))} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                <FormItem name="billFile">
                    <FormLabel>{t("purchase.uploadBill")}</FormLabel>
                    {billFile ? (
                        <div className={styles.filePreview}>
                            <FileCheck size={16} />
                            <span>{billFile.name}</span>
                            <Button type="button" variant="ghost" size="icon-sm" onClick={() => setBillFile(null)}><Trash2 size={14} /></Button>
                        </div>
                    ) : (
                        <FileDropzone 
                            onFilesSelected={handleFileSelect}
                            maxFiles={1}
                            title={<><FileUp size={16}/> {t("purchase.dropBillHere")}</>}
                            className={styles.dropzone}
                        />
                    )}
                </FormItem>
            </div>

            <div className={styles.itemsSection}>
              <h3 className={styles.itemsHeader}>{t("purchase.items")}</h3>
              <table className={styles.itemsTable}>
                <thead>
                  <tr>
                    <th>{t("purchase.itemName")}</th>
                    <th>{t("purchase.description")}</th>
                    <th>{t("purchase.quantity")}</th>
                    <th>{t("purchase.unitPrice")}</th>
                    <th>{t("purchase.amount")}</th>
                    <th>{t("purchase.addToInventory")}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {values.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <FormItem name={`items.${index}.itemName`} className={styles.tableFormItem}>
                          <FormControl>
                            <Input value={item.itemName} onChange={e => handleItemChange(index, 'itemName', e.target.value)} />
                          </FormControl>
                        </FormItem>
                      </td>
                      <td>
                        <FormItem name={`items.${index}.description`} className={styles.tableFormItem}>
                          <FormControl>
                            <Input value={item.description ?? ""} onChange={e => handleItemChange(index, 'description', e.target.value)} />
                          </FormControl>
                        </FormItem>
                      </td>
                      <td>
                        <FormItem name={`items.${index}.quantity`} className={styles.tableFormItem}>
                          <FormControl>
                            <Input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.valueAsNumber)} className={styles.numberInput} />
                          </FormControl>
                        </FormItem>
                      </td>
                      <td>
                        <FormItem name={`items.${index}.unitPrice`} className={styles.tableFormItem}>
                          <FormControl>
                            <Input type="number" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', e.target.valueAsNumber)} className={styles.numberInput} />
                          </FormControl>
                        </FormItem>
                      </td>
                      <td>
                        <span className={styles.amountCell}>{((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}</span>
                      </td>
                      <td>
                        <FormItem name={`items.${index}.addToInventory`} className={styles.tableFormItem}>
                          <FormControl>
                            <input 
                              type="checkbox" 
                              checked={item.addToInventory ?? false} 
                              onChange={e => handleItemChange(index, 'addToInventory', e.target.checked)}
                              className={styles.checkbox}
                            />
                          </FormControl>
                        </FormItem>
                      </td>
                      <td>
                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => handleRemoveItem(index)} disabled={values.items.length <= 1}>
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className={styles.addItemButton}>
                <Plus size={16} /> {t("purchase.addItem")}
              </Button>
            </div>

            <div className={styles.summaryGrid}>
                <FormItem name="notes">
                    <FormLabel>{t("common.notes")}</FormLabel>
                    <FormControl>
                        <Textarea placeholder={t("purchase.notesPlaceholder")} rows={4} value={values.notes ?? ""} onChange={e => setValues(p => ({...p, notes: e.target.value}))} />
                    </FormControl>
                </FormItem>
                <div className={styles.paymentSection}>
                    <div className={styles.totalAmount}>
                        <span>{t("purchase.totalAmount")}</span>
                        <strong>{totalAmount.toFixed(2)}</strong>
                    </div>
                    <FormItem name="paymentStatus">
                        <FormLabel>{t("purchase.paymentStatusLabel")}</FormLabel>
                        <Select value={values.paymentStatus} onValueChange={val => setValues(p => ({...p, paymentStatus: val as 'paid' | 'pending'}))}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="pending">{t("purchase.paymentStatusPending")}</SelectItem>
                                <SelectItem value="paid">{t("purchase.paymentStatusPaid")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                    <FormItem name="paymentDueDate">
                        <FormLabel>{t("purchase.paymentDueDate")}</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                <Button variant="outline" className={styles.dateButton}>
                                    {values.paymentDueDate ? formatDate(values.paymentDueDate) : t("purchase.selectDate")}
                                    <CalendarIcon size={16} />
                                </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent removeBackgroundAndPadding>
                                <Calendar mode="single" selected={values.paymentDueDate ?? undefined} onSelect={date => date && setValues(p => ({...p, paymentDueDate: date}))} />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    <FormItem name="paymentDate">
                        <FormLabel>{t("purchase.paymentDate")}</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                <Button variant="outline" className={styles.dateButton}>
                                    {values.paymentDate ? formatDate(values.paymentDate) : t("purchase.selectDate")}
                                    <CalendarIcon size={16} />
                                </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent removeBackgroundAndPadding>
                                <Calendar mode="single" selected={values.paymentDate ?? undefined} onSelect={date => date && setValues(p => ({...p, paymentDate: date}))} />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    <FormItem name="paymentMode">
                        <FormLabel>{t("purchase.paymentMode")}</FormLabel>
                        <Select 
                            value={values.paymentMode ?? "__empty"} 
                            onValueChange={val => setValues(p => ({...p, paymentMode: val === "__empty" ? null : val as 'cash' | 'card' | 'bank_transfer' | 'upi'}))}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t("purchase.selectPaymentMode")} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="__empty">{t("purchase.selectPaymentMode")}</SelectItem>
                                <SelectItem value="cash">{t("purchase.paymentModeCash")}</SelectItem>
                                <SelectItem value="card">{t("purchase.paymentModeCard")}</SelectItem>
                                <SelectItem value="bank_transfer">{t("purchase.paymentModeBankTransfer")}</SelectItem>
                                <SelectItem value="upi">{t("purchase.paymentModeUPI")}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    <FormItem name="paymentReference">
                        <FormLabel>{t("purchase.paymentReference")}</FormLabel>
                        <FormControl>
                            <Input 
                                placeholder={t("purchase.paymentReferencePlaceholder")} 
                                value={values.paymentReference ?? ""} 
                                onChange={e => setValues(p => ({...p, paymentReference: e.target.value || null}))} 
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? <Spinner size="sm" /> : isEditMode ? t("common.saveChanges") : t("purchase.createPurchase")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};