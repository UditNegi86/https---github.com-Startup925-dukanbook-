import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { InventoryItems } from "../../helpers/schema";

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  items: Selectable<InventoryItems>[];
};

export const getInventoryItems = async (
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/inventory/items`, {
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