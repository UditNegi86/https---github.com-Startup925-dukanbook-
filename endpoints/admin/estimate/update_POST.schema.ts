import { z } from "zod";
import superjson from "superjson";
import {
  PaymentTypeArrayValues,
  EstimateStatusArrayValues,
} from "../../../helpers/schema";
import { EstimateWithItems } from "../../estimates_GET.schema";

// This schema is identical to the non-admin update schema,
// as the data structure for an estimate is the same.
// The difference is in the backend handler's authorization logic.
const estimateItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unitPrice: z.coerce.number().min(0, "Unit price cannot be negative"),
});

export const schema = z.object({
  id: z.number().int().positive(),
  customerName: z.string().min(1, "Customer name is required"),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 characters"),
  date: z.date(),
  paymentType: z.enum(PaymentTypeArrayValues),
  expectedPaymentDate: z.date().nullable().optional(),
  notes: z.string().nullable(),
  status: z.enum(EstimateStatusArrayValues),
  discountPercentage: z.coerce.number().min(0).max(100).optional().default(0),
  taxPercentage: z.coerce.number().min(0).max(100).optional().default(0),
  items: z.array(estimateItemSchema).min(1, "At least one item is required"),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = EstimateWithItems;

export const postAdminEstimateUpdate = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/admin/estimate/update`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = superjson.parse<{ error: string }>(
      await result.text()
    );
    throw new Error(errorObject.error);
  }
  return superjson.parse<OutputType>(await result.text());
};