import { z } from "zod";
import superjson from "superjson";
import { Subuser } from "../subusers_GET.schema";

export const schema = z.object({
  subuserId: z.number(),
  name: z.string().min(2, "Name must be at least 2 characters long."),
  username: z.string().min(3, "Username must be at least 3 characters long."),
  password: z.string().min(6, "Password must be at least 6 characters long.").optional().or(z.literal('')),
  isActive: z.boolean(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  subuser: Subuser;
};

export const postUpdateSubuser = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/subusers/update`, {
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