import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { OutputType, schema } from "./income-expense_GET.schema";
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

    // To include the whole end day, we set the time to the end of the day.
    const endDateEndOfDay = new Date(endDate);
    endDateEndOfDay.setHours(23, 59, 59, 999);

    const [
      incomeSummary,
      expenseSummary,
      dailyIncome,
      dailyExpenses,
      incomeTransactions,
      expenseTransactions,
    ] = await Promise.all([
      // 1. Income Summary
      db
        .selectFrom("estimates")
        .select([
          db.fn.sum("totalAmount").as("totalIncome"),
          db.fn.sum("taxAmount").as("taxCollected"),
          db.fn.sum("discountAmount").as("discountGiven"),
        ])
        .where("userId", "=", user.id)
        .where("status", "=", "completed")
        .where("date", ">=", startDate)
        .where("date", "<=", endDateEndOfDay)
        .executeTakeFirst(),

      // 2. Expense Summary
      db
        .selectFrom("purchases")
        .select([db.fn.sum("totalAmount").as("totalExpenses")])
        .where("userId", "=", user.id)
        .where("purchaseDate", ">=", startDate)
        .where("purchaseDate", "<=", endDateEndOfDay)
        .executeTakeFirst(),

      // 3. Daily Income
      db
        .selectFrom("estimates")
        .select([
          sql<string>`DATE(date)`.as("day"),
          db.fn.sum("totalAmount").as("income"),
        ])
        .where("userId", "=", user.id)
        .where("status", "=", "completed")
        .where("date", ">=", startDate)
        .where("date", "<=", endDateEndOfDay)
        .groupBy("day")
        .orderBy("day")
        .execute(),

      // 4. Daily Expenses
      db
        .selectFrom("purchases")
        .select([
          sql<string>`DATE(purchase_date)`.as("day"),
          db.fn.sum("totalAmount").as("expenses"),
        ])
        .where("userId", "=", user.id)
        .where("purchaseDate", ">=", startDate)
        .where("purchaseDate", "<=", endDateEndOfDay)
        .groupBy("day")
        .orderBy("day")
        .execute(),

      // 5. Income Transactions
      db
        .selectFrom("estimates")
        .select([
          "date",
          "customerName",
          "estimateNumber",
          "totalAmount",
          "paymentType",
        ])
        .where("userId", "=", user.id)
        .where("status", "=", "completed")
        .where("date", ">=", startDate)
        .where("date", "<=", endDateEndOfDay)
        .orderBy("date", "desc")
        .execute(),

      // 6. Expense Transactions
      db
        .selectFrom("purchases")
        .innerJoin("suppliers", "suppliers.id", "purchases.supplierId")
        .select([
          "purchases.purchaseDate as date",
          "suppliers.supplierName",
          "purchases.billNumber",
          "purchases.totalAmount",
          "purchases.paymentStatus",
        ])
        .where("purchases.userId", "=", user.id)
        .where("purchases.purchaseDate", ">=", startDate)
        .where("purchases.purchaseDate", "<=", endDateEndOfDay)
        .orderBy("purchases.purchaseDate", "desc")
        .execute(),
    ]);

    // Process Summary
    const totalIncome = Number(incomeSummary?.totalIncome ?? 0);
    const totalExpenses = Number(expenseSummary?.totalExpenses ?? 0);
    const summary = {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      taxCollected: Number(incomeSummary?.taxCollected ?? 0),
      discountGiven: Number(incomeSummary?.discountGiven ?? 0),
    };

    // Process Daily Breakdown
    const dailyDataMap = new Map<string, { income: number; expenses: number }>();
    dailyIncome.forEach((item) => {
      dailyDataMap.set(item.day, { income: Number(item.income), expenses: 0 });
    });
    dailyExpenses.forEach((item) => {
      const existing = dailyDataMap.get(item.day) || { income: 0, expenses: 0 };
      existing.expenses = Number(item.expenses);
      dailyDataMap.set(item.day, existing);
    });

    const dailyBreakdown = Array.from(dailyDataMap.entries())
      .map(([date, { income, expenses }]) => ({
        date,
        income,
        expenses,
        profit: income - expenses,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const response: OutputType = {
      summary,
      dailyBreakdown,
      incomeTransactions,
      expenseTransactions,
    };

    return new Response(superjson.stringify(response));
  } catch (error) {
    console.error("Error fetching income/expense report:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}