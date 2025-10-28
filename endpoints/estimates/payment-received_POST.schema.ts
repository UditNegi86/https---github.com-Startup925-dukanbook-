import { z } from "zod";
import superjson from "superjson";
import { EstimateWithItems } from "../estimates_GET.schema";
import { PaymentType } from "../../helpers/schema";

// Payment can be received in any form except 'credit' itself.
export const PaymentReceivedModeArrayValues: [PaymentType, ...PaymentType[]] = [
  "cash",
  "upi",
  "card",
];

export const schema = z.object({
  estimateId: z.number().int().positive(),
  paymentReceivedDate: z.date(),
  paymentReceivedMode: z.enum(PaymentReceivedModeArrayValues),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = EstimateWithItems;

export const postEstimatesPaymentReceived = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/estimates/payment-received`, {
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