import { z } from "zod";
import superjson from "superjson";
import { PaymentTypeArrayValues } from "../helpers/schema";
import { EstimateWithItems } from "./estimates_GET.schema";

const estimateItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unitPrice: z.coerce.number().min(0, "Unit price cannot be negative"),
  inventoryItemId: z.number().int().positive().nullable().optional(),
});

export const schema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 characters"),
  date: z.date(),
  paymentType: z.enum(PaymentTypeArrayValues),
  expectedPaymentDate: z.date().nullable().optional(),
  notes: z.string().nullable(),
  discountPercentage: z.coerce.number().min(0, "Discount percentage cannot be negative").max(100, "Discount percentage cannot exceed 100").optional().default(0),
  taxPercentage: z.coerce.number().min(0, "Tax percentage cannot be negative").max(100, "Tax percentage cannot exceed 100").optional().default(0),
  items: z.array(estimateItemSchema).min(1, "At least one item is required"),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = EstimateWithItems;

export const postEstimates = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/estimates`, {
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