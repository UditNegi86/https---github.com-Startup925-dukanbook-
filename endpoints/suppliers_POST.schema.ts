import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Suppliers } from "../helpers/schema";

export const schema = z.object({
  supplierName: z.string().min(1, "Supplier name is required."),
  contactNumber: z.string().optional().nullable(),
  email: z.string().email("Invalid email address.").optional().nullable(),
  address: z.string().optional().nullable(),
  gstNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  supplier: Selectable<Suppliers>;
};

export const postSuppliers = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/suppliers`, {
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