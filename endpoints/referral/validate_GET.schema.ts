import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({
  referralCode: z.string().nullable().optional(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  valid: boolean;
  referrerName?: string;
};

export const getValidate = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(params);
  const searchParams = new URLSearchParams();
  if (validatedInput.referralCode) {
    searchParams.set("referralCode", validatedInput.referralCode);
  }

  const result = await fetch(`/_api/referral/validate?${searchParams.toString()}`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse<{ error: string }>(await result.text());
    throw new Error(errorObject.error || "Failed to validate referral code");
  }
  return superjson.parse<OutputType>(await result.text());
};