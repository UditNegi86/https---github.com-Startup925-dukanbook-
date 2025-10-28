import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({
  planMonths: z.union([z.literal(3), z.literal(6), z.literal(9), z.literal(12)]),
  amount: z.number().positive(),
  upiTransactionId: z.string().optional(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  message: string;
};

export const postSubscriptionRequest = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/subscription/request`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = superjson.parse<{ error: string }>(await result.text());
    throw new Error(errorObject.error);
  }
  return superjson.parse<OutputType>(await result.text());
};