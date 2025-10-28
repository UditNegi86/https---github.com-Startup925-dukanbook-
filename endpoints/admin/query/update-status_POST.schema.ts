import { z } from "zod";
import superjson from 'superjson';
import { Selectable } from "kysely";
import { UserQueries, QueryStatusArrayValues } from "../../../helpers/schema";

export const schema = z.object({
  id: z.number().int().positive(),
  status: z.enum(QueryStatusArrayValues),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = Selectable<UserQueries>;

export const postAdminQueryUpdateStatus = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/admin/query/update-status`, {
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