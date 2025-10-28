import { z } from "zod";
import superjson from "superjson";
import { EstimateWithItems } from "../estimates_GET.schema";
import { PaymentType, EstimatePayments } from "../../helpers/schema";
import { Selectable } from "kysely";

// Payment can be received in any form except 'credit' itself.
export const PaymentModeArrayValues: [PaymentType, ...PaymentType[]] = [
  "cash",
  "upi",
  "card",
];

export const schema = z.object({
  estimateId: z.number().int().positive(),
  amount: z.number().positive({ message: "Payment amount must be positive." }),
  paymentDate: z.date(),
  paymentMode: z.enum(PaymentModeArrayValues),
  notes: z.string().optional().nullable(),
});

export type InputType = z.infer<typeof schema>;

export type EstimateWithItemsAndPayments = EstimateWithItems & {
  payments: Selectable<EstimatePayments>[];
};

export type OutputType = EstimateWithItemsAndPayments;

export const postEstimatesRecordPayment = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/estimates/record-payment`, {
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