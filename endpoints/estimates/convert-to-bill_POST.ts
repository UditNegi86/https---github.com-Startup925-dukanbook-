import { db } from "../../helpers/db";
import { schema, OutputType } from "./convert-to-bill_POST.schema";
import superjson from "superjson";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { Kysely, sql } from "kysely";
import { DB } from "../../helpers/schema";

async function generateNextBillNumber(
  db: Kysely<DB>,
  userId: number
): Promise<string> {
  const result = await db
    .selectFrom("estimates")
    .select(sql<string>`bill_number`.as("billNumber"))
    .where("userId", "=", userId)
    .where("billNumber", "is not", null)
    .orderBy(sql`LENGTH(bill_number)`, "desc")
    .orderBy("billNumber", "desc")
    .limit(1)
    .executeTakeFirst();

  if (!result || !result.billNumber) {
    return "BILL-001";
  }

  const match = result.billNumber.match(/BILL-(\d+)/);
  if (!match) {
    console.warn(
      `Could not parse bill number "${result.billNumber}" for user ${userId}. Starting from 1.`
    );
    return "BILL-001";
  }

  const currentNum = parseInt(match[1], 10);
  const nextNum = currentNum + 1;
  return `BILL-${String(nextNum).padStart(3, "0")}`;
}

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    
    if (user.isActive === false) {
      return new Response(
        superjson.stringify({ error: "Your account is disabled. Please contact admin for access." }),
        { status: 403 }
      );
    }
    
    const json = superjson.parse(await request.text());
    const { estimateId } = schema.parse(json);

    const estimate = await db
      .selectFrom("estimates")
      .selectAll()
      .where("id", "=", estimateId)
      .where("userId", "=", user.id)
      .executeTakeFirst();

    if (!estimate) {
      return new Response(
        superjson.stringify({
          error: "Estimate not found or you do not have permission to access it.",
        }),
        { status: 404 }
      );
    }

    if (estimate.billNumber) {
      return new Response(
        superjson.stringify({ error: "Estimate has already been converted to a bill." }),
        { status: 400 }
      );
    }

    const nextBillNumber = await generateNextBillNumber(db, user.id);

    await db
      .updateTable("estimates")
      .set({ billNumber: nextBillNumber })
      .where("id", "=", estimateId)
      .execute();

    // Fetch the updated estimate with its items and payments
    const updatedEstimate = await db
      .selectFrom("estimates")
      .selectAll()
      .where("id", "=", estimateId)
      .executeTakeFirst();

    if (!updatedEstimate) {
      // This should not happen if the update was successful
      throw new Error("Failed to retrieve the updated estimate.");
    }

    const items = await db
      .selectFrom("estimateItems")
      .selectAll()
      .where("estimateId", "=", estimateId)
      .execute();

    const payments = await db
      .selectFrom("estimatePayments")
      .selectAll()
      .where("estimateId", "=", estimateId)
      .orderBy("paymentDate", "asc")
      .execute();

    // Fetch user information
    const userInfo = await db
      .selectFrom("users")
      .select([
        "businessName",
        "address",
        "pinCode",
        "gstNumber",
        "contactNumber",
      ])
      .where("id", "=", user.id)
      .executeTakeFirstOrThrow();

    const response: OutputType = {
      ...updatedEstimate,
      items: items || [],
      payments: payments || [],
      user: {
        businessName: userInfo.businessName,
        address: userInfo.address,
        pinCode: userInfo.pinCode,
        gstNumber: userInfo.gstNumber,
        contactNumber: userInfo.contactNumber,
      },
    };

    return new Response(superjson.stringify(response));
  } catch (error) {
    console.error("Error converting estimate to bill:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: `Failed to convert estimate: ${errorMessage}` }),
      { status: 400 }
    );
  }
}