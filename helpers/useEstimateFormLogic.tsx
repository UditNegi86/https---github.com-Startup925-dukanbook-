import { useMemo, useEffect } from "react";
import { z } from "zod";
import {
  useCreateEstimate,
  useUpdateEstimate,
} from "./useEstimatesQueries";
import { EstimateWithItems } from "../endpoints/estimates_GET.schema";
import { schema as createSchema } from "../endpoints/estimates_POST.schema";
import { schema as updateSchema } from "../endpoints/estimates/update_POST.schema";
import { useCustomerLookup } from "./useCustomerLookup";
import { useDebounce } from "./useDebounce";
import { useForm } from "../components/Form";

type CreateFormValues = z.infer<typeof createSchema>;
type UpdateFormValues = z.infer<typeof updateSchema>;
type FormValues = CreateFormValues | UpdateFormValues;

export const useEstimateFormLogic = (
  estimate: EstimateWithItems | null,
  isOpen: boolean,
  onClose: () => void,
) => {
  const isEditMode = !!estimate;

  const defaultValues: FormValues = isEditMode
    ? {
        id: estimate.id,
        customerName: estimate.customerName,
        mobileNumber: estimate.mobileNumber,
        date: new Date(estimate.date),
        paymentType: estimate.paymentType,
        expectedPaymentDate: estimate.expectedPaymentDate
          ? new Date(estimate.expectedPaymentDate)
          : null,
        notes: estimate.notes,
        status: estimate.status,
        discountPercentage: Number(estimate.discountPercentage) || 0,
        taxPercentage: Number(estimate.taxPercentage) || 0,
        items: estimate.items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          inventoryItemId: item.inventoryItemId || null,
        })),
      }
    : {
        customerName: "",
        mobileNumber: "",
        date: new Date(),
        paymentType: "cash",
        expectedPaymentDate: null,
        notes: "",
        discountPercentage: 0,
        taxPercentage: 0,
        items: [{ description: "", quantity: 1, unitPrice: 0, inventoryItemId: null }],
      };

  const form = useForm({
    schema: isEditMode ? updateSchema : createSchema,
    defaultValues,
  });

  const { setValues, values, handleSubmit } = form;

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setValues(defaultValues as FormValues);
    }
  }, [isOpen, estimate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-populate customer name in create mode
  const debouncedMobileNumber = useDebounce(values.mobileNumber || "", 500);
  const shouldLookupCustomer =
    !isEditMode &&
    debouncedMobileNumber.length >= 10 &&
    !values.customerName;

  const { data: customerData } = useCustomerLookup(
    { mobileNumber: debouncedMobileNumber },
    { enabled: shouldLookupCustomer },
  );

  useEffect(() => {
    if (!isEditMode && customerData && !values.customerName) {
      console.log(
        `Auto-populating customer name: ${customerData.customerName} for mobile: ${customerData.mobileNumber}`,
      );
      setValues((p) => ({ ...p, customerName: customerData.customerName }));
    }
  }, [customerData, isEditMode, values.customerName, setValues]);

  // Mutations
  const createMutation = useCreateEstimate();
  const updateMutation = useUpdateEstimate();
  const mutation = isEditMode ? updateMutation : createMutation;

  const onSubmit = (data: CreateFormValues | UpdateFormValues) => {
    if (isEditMode) {
      updateMutation.mutate(data as UpdateFormValues, {
        onSuccess: () => {
          onClose();
        },
      });
    } else {
      createMutation.mutate(data as CreateFormValues, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  // Calculations
  const calculations = useMemo(() => {
    const subtotal = values.items.reduce(
      (acc, item) => acc + (item.quantity || 0) * (item.unitPrice || 0),
      0,
    );

    const discountPercentage = values.discountPercentage || 0;
    const taxPercentage = values.taxPercentage || 0;

    const discountAmount = subtotal * (discountPercentage / 100);
    const amountAfterDiscount = subtotal - discountAmount;
    const taxAmount = amountAfterDiscount * (taxPercentage / 100);
    const totalAmount = amountAfterDiscount + taxAmount;

    return {
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
    };
  }, [values.items, values.discountPercentage, values.taxPercentage]);

  // Item handlers
  const handleAddItem = () => {
    setValues((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unitPrice: 0, inventoryItemId: null }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setValues((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (
    index: number,
    field: "description" | "quantity" | "unitPrice",
    value: string | number,
    inventoryItemId?: number | null,
  ) => {
    setValues((prev) => {
      const newItems = [...prev.items];
      const item = { ...newItems[index] };
      if (field === "description") {
        item.description = value as string;
        // Set inventoryItemId when description is set from inventory
        if (inventoryItemId !== undefined) {
          item.inventoryItemId = inventoryItemId;
        }
      } else {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          item[field] = numValue;
        }
      }
      newItems[index] = item;
      return { ...prev, items: newItems };
    });
  };

  return {
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
  };
};