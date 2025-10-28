import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { MarketplaceOrders } from "../../helpers/schema";

const orderItemSchema = z.object({
  itemId: z.number().int().positive(),
  quantity: z.number().int().positive("Quantity must be a positive integer."),
});

export const schema = z.object({
  items: z.array(orderItemSchema).min(1, "At least one item is required in the order."),
  deliveryAddress: z.string().min(1, "Delivery address is required."),
  deliveryContact: z.string().min(10, "A valid contact number is required."),
  notes: z.string().optional().nullable(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  order: Selectable<MarketplaceOrders>;
};

export const postMarketplaceOrders = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/marketplace/orders`, {
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