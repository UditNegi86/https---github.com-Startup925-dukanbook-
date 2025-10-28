import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { MarketplaceItems } from "../../helpers/schema";

export const schema = z.object({
  name: z.string().min(1, "Item name is required."),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  imageUrl: z.string().url("Must be a valid URL").or(z.string().startsWith("data:image/")).optional().nullable(),
  category: z.string().optional().nullable(),
  stockQuantity: z.coerce.number().int().min(0, "Stock quantity must be a non-negative integer."),
  unit: z.string().min(1, "Unit is required."),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  item: Selectable<MarketplaceItems>;
};

export const postMarketplaceItems = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/marketplace/items`, {
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