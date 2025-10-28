import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { OutputType, schema } from "./cash-flow_GET.schema";
import superjson from "superjson";
import { sql } from "kysely";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const url = new URL(request.url);
    const params = {
      startDate: url.searchParams.get("startDate"),
      endDate: url.searchParams.get("endDate"),
    };

    const validatedParams = schema.parse(params);
    const { startDate, endDate } = validatedParams;

    const endDateEndOfDay = new Date(endDate);
    endDateEndOfDay.setHours(23, 59, 59, 999);

    // --- 1. Opening Balance Calculation ---
    const [openingInflows, openingOutflows] = await Promise.all([
      db
        .selectFrom("estimates")
        .select(db.fn.sum("totalAmount").as("total"))
        .where("userId", "=", user.id)
        .where("status", "=", "completed")
        .where((eb) =>
          eb.or([
            // Non-credit estimates
            eb("paymentType", "!=", "credit"),
            // Credit estimates with payment received
            eb.and([
              eb("paymentType", "=", "credit"),
              eb("paymentReceivedDate", "is not", null),
              eb("paymentReceivedMode", "is not", null),
            ]),
          ])
        )
        .where(
          sql`CASE 
            WHEN payment_type = 'credit' AND payment_received_date IS NOT NULL 
            THEN payment_received_date
            ELSE COALESCE(payment_received_date, date)
          END`,
          "<",
          startDate
        )
        .executeTakeFirst(),
      db
        .selectFrom("purchases")
        .select(db.fn.sum("totalAmount").as("total"))
        .where("userId", "=", user.id)
        .where("paymentStatus", "=", "paid")
        .where(
          sql`COALESCE(payment_date, purchase_date)`,
          "<",
          startDate
        )
        .executeTakeFirst(),
    ]);

    const openingBalance =
      Number(openingInflows?.total ?? 0) - Number(openingOutflows?.total ?? 0);

    // --- 2. Transactions within the date range ---
    const [
      inflowTransactions,
      outflowTransactions,
      dailyInflows,
      dailyOutflows,
    ] = await Promise.all([
      // Inflow Transactions
      db
        .selectFrom("estimates")
        .select([
          sql<Date>`CASE 
            WHEN payment_type = 'credit' AND payment_received_date IS NOT NULL 
            THEN payment_received_date
            ELSE COALESCE(payment_received_date, date)
          END`.as("date"),
          "customerName as source",
          "estimateNumber",
          sql<string>`CASE 
            WHEN payment_type = 'credit' AND payment_received_mode IS NOT NULL 
            THEN payment_received_mode
            ELSE payment_type
          END`.as("paymentMethod"),
          "totalAmount as amount",
        ])
        .where("userId", "=", user.id)
        .where("status", "=", "completed")
        .where((eb) =>
          eb.or([
            // Non-credit estimates
            eb("paymentType", "!=", "credit"),
            // Credit estimates with payment received
            eb.and([
              eb("paymentType", "=", "credit"),
              eb("paymentReceivedDate", "is not", null),
              eb("paymentReceivedMode", "is not", null),
            ]),
          ])
        )
        .where(
          sql`CASE 
            WHEN payment_type = 'credit' AND payment_received_date IS NOT NULL 
            THEN payment_received_date
            ELSE COALESCE(payment_received_date, date)
          END`,
          ">=",
          startDate
        )
        .where(
          sql`CASE 
            WHEN payment_type = 'credit' AND payment_received_date IS NOT NULL 
            THEN payment_received_date
            ELSE COALESCE(payment_received_date, date)
          END`,
          "<=",
          endDateEndOfDay
        )
        .orderBy("date", "desc")
        .execute(),

      // Outflow Transactions
      db
        .selectFrom("purchases")
        .innerJoin("suppliers", "suppliers.id", "purchases.supplierId")
        .select([
          sql<Date>`COALESCE(payment_date, purchase_date)`.as("date"),
          "suppliers.supplierName as purpose",
          "purchases.billNumber",
          "purchases.paymentMode as paymentMethod",
          "purchases.totalAmount as amount",
        ])
        .where("purchases.userId", "=", user.id)
        .where("purchases.paymentStatus", "=", "paid")
        .where(
          sql`COALESCE(payment_date, purchase_date)`,
          ">=",
          startDate
        )
        .where(
          sql`COALESCE(payment_date, purchase_date)`,
          "<=",
          endDateEndOfDay
        )
        .orderBy("date", "desc")
        .execute(),

      // Daily Inflows
      db
        .selectFrom("estimates")
        .select([
          sql<string>`DATE(CASE 
            WHEN payment_type = 'credit' AND payment_received_date IS NOT NULL 
            THEN payment_received_date
            ELSE COALESCE(payment_received_date, date)
          END)`.as("day"),
          db.fn.sum("totalAmount").as("total"),
        ])
        .where("userId", "=", user.id)
        .where("status", "=", "completed")
        .where((eb) =>
          eb.or([
            // Non-credit estimates
            eb("paymentType", "!=", "credit"),
            // Credit estimates with payment received
            eb.and([
              eb("paymentType", "=", "credit"),
              eb("paymentReceivedDate", "is not", null),
              eb("paymentReceivedMode", "is not", null),
            ]),
          ])
        )
        .where(
          sql`CASE 
            WHEN payment_type = 'credit' AND payment_received_date IS NOT NULL 
            THEN payment_received_date
            ELSE COALESCE(payment_received_date, date)
          END`,
          ">=",
          startDate
        )
        .where(
          sql`CASE 
            WHEN payment_type = 'credit' AND payment_received_date IS NOT NULL 
            THEN payment_received_date
            ELSE COALESCE(payment_received_date, date)
          END`,
          "<=",
          endDateEndOfDay
        )
        .groupBy("day")
        .execute(),

      // Daily Outflows
      db
        .selectFrom("purchases")
        .select([
          sql<string>`DATE(COALESCE(payment_date, purchase_date))`.as("day"),
          db.fn.sum("totalAmount").as("total"),
        ])
        .where("userId", "=", user.id)
        .where("paymentStatus", "=", "paid")
        .where(
          sql`COALESCE(payment_date, purchase_date)`,
          ">=",
          startDate
        )
        .where(
          sql`COALESCE(payment_date, purchase_date)`,
          "<=",
          endDateEndOfDay
        )
        .groupBy("day")
        .execute(),
    ]);

    // --- 3. Process & Summarize Data ---
    const totalInflow = inflowTransactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );
    const totalOutflow = outflowTransactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );
    const netCashFlow = totalInflow - totalOutflow;
    const closingBalance = openingBalance + netCashFlow;

    const inflowByPaymentMethod = inflowTransactions.reduce((acc, t) => {
      const method = t.paymentMethod || "unknown";
      acc[method] = (acc[method] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    const outflowByPaymentMethod = outflowTransactions.reduce((acc, t) => {
      const method = t.paymentMethod || "unknown";
      acc[method] = (acc[method] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    // --- 4. Daily Breakdown ---
    const dailyDataMap = new Map<string, { cashIn: number; cashOut: number }>();
    dailyInflows.forEach((d) => {
      dailyDataMap.set(d.day, { cashIn: Number(d.total), cashOut: 0 });
    });
    dailyOutflows.forEach((d) => {
      const existing = dailyDataMap.get(d.day) || { cashIn: 0, cashOut: 0 };
      existing.cashOut = Number(d.total);
      dailyDataMap.set(d.day, existing);
    });

    const dailyBreakdown: OutputType["dailyBreakdown"] = [];
    let currentBalance = openingBalance;
    for (
      let d = new Date(startDate);
      d <= endDateEndOfDay;
      d.setDate(d.getDate() + 1)
    ) {
      const dateString = d.toISOString().split("T")[0];
      const dayData = dailyDataMap.get(dateString) || {
        cashIn: 0,
        cashOut: 0,
      };
      currentBalance += dayData.cashIn - dayData.cashOut;
      dailyBreakdown.push({
        date: dateString,
        cashIn: dayData.cashIn,
        cashOut: dayData.cashOut,
        runningBalance: currentBalance,
      });
    }

    const response: OutputType = {
      summary: {
        openingBalance,
        totalInflow,
        totalOutflow,
        netCashFlow,
        closingBalance,
        inflowByPaymentMethod,
        outflowByPaymentMethod,
      },
      dailyBreakdown,
      inflowTransactions,
      outflowTransactions,
    };

    return new Response(superjson.stringify(response));
  } catch (error) {
    console.error("Error fetching cash flow report:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}