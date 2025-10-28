import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Purchases, PurchaseItems, Suppliers } from "../helpers/schema";

const purchaseItemSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  description: z.string().optional().nullable(),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unitPrice: z.coerce.number().min(0, "Unit price cannot be negative"),
  addToInventory: z.boolean().optional(),
});

export const schema = z.object({
  supplierId: z.number().int().positive(),
  purchaseDate: z.date(),
  billNumber: z.string().optional().nullable(),
  billFileData: z.string().optional().nullable(),
  billFileName: z.string().optional().nullable(),
  billFileType: z.string().optional().nullable(),
  totalAmount: z.coerce.number().min(0),
  paymentStatus: z.enum(["paid", "pending"]),
  paymentDate: z.date().optional().nullable(),
  paymentDueDate: z.date().optional().nullable(),
  paymentMode: z.enum(["cash", "card", "bank_transfer", "upi"]).optional().nullable(),
  paymentReference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(purchaseItemSchema).min(1, "At least one item is required"),
});

export type InputType = z.infer<typeof schema>;

export type PurchaseWithItemsAndSupplier = Selectable<Purchases> & {
  items: Selectable<PurchaseItems>[];
  supplier: Selectable<Suppliers>;
};

export type OutputType = {
  purchase: PurchaseWithItemsAndSupplier;
};

export const postPurchases = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/purchases`, {
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