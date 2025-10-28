import { z } from "zod";
import superjson from 'superjson';
import { Selectable } from "kysely";
import { UserQueries, QueryStatusArrayValues } from "../../helpers/schema";

export const schema = z.object({
  status: z.enum(QueryStatusArrayValues).optional(),
});

export type InputType = z.infer<typeof schema>;

export type AdminQuery = Selectable<UserQueries> & {
  businessName: string | null;
  userOwnerName: string | null;
};

export type OutputType = AdminQuery[];

export const getAdminQueries = async (params?: InputType, init?: RequestInit): Promise<OutputType> => {
  const searchParams = new URLSearchParams();
  if (params?.status) {
    searchParams.set("status", params.status);
  }
  const queryString = searchParams.toString();
  const url = `/_api/admin/queries${queryString ? `?${queryString}` : ""}`;

  const result = await fetch(url, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse<{ error: string }>(await result.text());
    throw new Error(errorObject.error);
  }
  return superjson.parse<OutputType>(await result.text());
};