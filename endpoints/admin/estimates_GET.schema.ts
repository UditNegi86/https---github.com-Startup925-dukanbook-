import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Estimates, EstimateItems } from "../../helpers/schema";

// No input schema for GET all
export const schema = z.object({
  userId: z.number().int().positive().optional(),
});

export type InputType = z.infer<typeof schema>;

export type AdminEstimate = Selectable<Estimates> & {
  items: Selectable<EstimateItems>[];
  user: {
    id: number;
    businessName: string;
    ownerName: string;
    contactNumber: string;
    address: string | null;
    pinCode: string | null;
    gstNumber: string | null;
  };
};

export type OutputType = AdminEstimate[];

export const getAdminEstimates = async (
  params?: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const searchParams = new URLSearchParams();
  if (params?.userId) {
    searchParams.set("userId", params.userId.toString());
  }
  const queryString = searchParams.toString();
  const url = `/_api/admin/estimates${queryString ? `?${queryString}` : ""}`;

  const result = await fetch(url, {
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