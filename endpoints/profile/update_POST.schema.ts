import { z } from "zod";
import superjson from "superjson";
import { User } from "../../helpers/User";

export const schema = z
  .object({
    businessName: z.string().min(1),
    ownerName: z.string().min(1),
    displayName: z.string().min(1),
    businessType: z.string().min(1),
    email: z.string().email().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    pinCode: z.string().optional().or(z.literal("")),
    gstNumber: z.string().optional().or(z.literal("")),
    enabledModules: z.array(z.string()).optional(),
  })
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided to update."
  );

export type InputType = z.infer<typeof schema>;

export type OutputType =
  | {
      user: User;
    }
  | {
      error: string;
    };

export const postProfileUpdate = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/profile/update`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = await result.json();
    throw new Error(errorObject.error || "Failed to update profile");
  }

  return result.json();
};