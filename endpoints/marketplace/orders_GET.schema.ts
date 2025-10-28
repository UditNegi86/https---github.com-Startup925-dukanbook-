import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { MarketplaceOrders } from "../../helpers/schema";

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OrderWithDetails = Selectable<MarketplaceOrders> & {
  user: {
    id: number;
    businessName: string;
    contactNumber: string;
  };
  items: {
    orderId: number;
    quantity: number;
    priceAtPurchase: string;
    subtotal: string;
    itemName: string;
    itemUnit: string;
    itemImageUrl: string | null;
  }[];
};

export type OutputType = {
  orders: OrderWithDetails[];
};

export const getMarketplaceOrders = async (
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/marketplace/orders`, {
    method: "GET",
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