import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Suppliers } from "../../helpers/schema";
import { schema as createSchema } from "../suppliers_POST.schema";

export const schema = createSchema.extend({
  id: z.number().int().positive(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  supplier: Selectable<Suppliers>;
};

export const postSuppliersUpdate = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/suppliers/update`, {
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