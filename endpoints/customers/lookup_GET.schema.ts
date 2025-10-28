import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({
  mobileNumber: z.string().min(1, "Mobile number is required"),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  customerName: string;
  mobileNumber: string;
} | null;

export const getCustomersLookup = async (query: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(query);
  const params = new URLSearchParams({
    mobileNumber: validatedInput.mobileNumber,
  });

  const result = await fetch(`/_api/customers/lookup?${params.toString()}`, {
    method: "GET",
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