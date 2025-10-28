import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { InventoryItems } from "../../../helpers/schema";

export const schema = z.object({
  id: z.number(),
  itemName: z.string().min(1, "Item name is required.").optional(),
  quantity: z.coerce.number().min(0, "Quantity must be a positive number.").optional(),
  purchaseValue: z.coerce
    .number()
    .min(0, "Purchase value must be a positive number.")
    .optional(),
  salesValue: z.coerce
    .number()
    .min(0, "Sales value must be a positive number.")
    .optional(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  item: Selectable<InventoryItems>;
};

export const postInventoryItemsUpdate = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/inventory/items/update`, {
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