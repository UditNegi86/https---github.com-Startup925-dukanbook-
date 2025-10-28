import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Subusers } from "../helpers/schema";

export const schema = z.object({});

export type Subuser = Pick<Selectable<Subusers>, "id" | "name" | "username" | "isActive" | "createdAt">;

export type OutputType = {
  subusers: Subuser[];
};

export const getSubusers = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/subusers`, {
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