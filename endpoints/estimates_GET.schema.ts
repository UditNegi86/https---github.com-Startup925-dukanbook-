import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Estimates, EstimateItems, EstimatePayments } from "../helpers/schema";

// No input schema for GET all
export const schema = z.undefined();

export type InputType = z.infer<typeof schema>;

export type EstimateWithItems = Selectable<Estimates> & {
  items: Selectable<EstimateItems>[];
  payments?: Selectable<EstimatePayments>[];
  subuserName?: string | null;
  user: {
    businessName: string;
    address: string | null;
    pinCode: string | null;
    gstNumber: string | null;
    contactNumber: string;
  };
};

export type OutputType = EstimateWithItems[];

export const getEstimates = async (
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/estimates`, {
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