import { z } from "zod";
import superjson from 'superjson';
import { Selectable } from "kysely";
import { UserQueries } from "../helpers/schema";

export const schema = z.object({
  name: z.string().optional(),
  contactNumber: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters long."),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = Selectable<UserQueries>;

export const postQueries = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/queries`, {
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