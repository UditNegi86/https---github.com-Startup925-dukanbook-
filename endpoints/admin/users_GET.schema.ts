import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Users } from "../../helpers/schema";

// No input schema for GET all
export const schema = z.undefined();

export type InputType = z.infer<typeof schema>;

export type AdminUser = Selectable<Users> & {
  estimateCount: number;
  totalAmount: string;
};

export type OutputType = AdminUser[];

export const getAdminUsers = async (
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/admin/users`, {
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