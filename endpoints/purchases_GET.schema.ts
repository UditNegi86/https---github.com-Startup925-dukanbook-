import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Purchases, PurchaseItems, Suppliers } from "../helpers/schema";

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type PurchaseWithItemsAndSupplier = Selectable<Purchases> & {
  items: Selectable<PurchaseItems>[];
  supplier: Selectable<Suppliers>;
};

export type OutputType = {
  purchases: PurchaseWithItemsAndSupplier[];
};

export const getPurchases = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/purchases`, {
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