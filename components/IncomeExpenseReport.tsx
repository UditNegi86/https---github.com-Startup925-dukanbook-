import React from "react";
import { useReactToPrint } from "react-to-print";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
} from "./Chart";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./Accordion";
import { Button } from "./Button";
import { Download } from "lucide-react";
import { useLanguage } from "../helpers/useLanguage";
import { formatCurrency, formatDate } from "../helpers/dateUtils";
import { OutputType as ReportData } from "../endpoints/reports/income-expense_GET.schema";
import styles from "./IncomeExpenseReport.module.css";

interface IncomeExpenseReportProps {
  data: ReportData;
  dateRange: { from: Date; to: Date };
}

const chartConfig: ChartConfig = {
  income: {
    label: "Income",
    color: "var(--success)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--error)",
  },
};

export const IncomeExpenseReport = ({
  data,
  dateRange,
}: IncomeExpenseReportProps) => {
  const { t } = useLanguage();
  const printRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Income-Expense-Report-${formatDate(dateRange.from)}-${formatDate(dateRange.to)}`,
  });

  const { summary, dailyBreakdown, incomeTransactions, expenseTransactions } =
    data;

  const chartData = dailyBreakdown.map((d) => ({
    ...d,
    date: formatDate(d.date),
  }));

  return (
    <div className={styles.reportContainer}>
      <div className={styles.reportHeader}>
        <h2 className={styles.reportTitle}>{t("reports.report.title")}</h2>
        <Button onClick={handlePrint} variant="outline">
          <Download size={16} />
          {t("reports.downloadPdf")}
        </Button>
      </div>
      <p className={styles.dateRange}>
        {t("reports.report.forPeriod")}: {formatDate(dateRange.from)} -{" "}
        {formatDate(dateRange.to)}
      </p>

      <div ref={printRef} className={styles.printArea}>
        {/* This header is only visible in the print view */}
        <div className={styles.printHeader}>
          <h1>{t("reports.report.title")}</h1>
          <p>
            {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
          </p>
        </div>

        <div className={styles.summaryCards}>
          <div className={`${styles.card} ${styles.incomeCard}`}>
            <h3>{t("reports.summary.totalIncome")}</h3>
            <p>{formatCurrency(summary.totalIncome)}</p>
          </div>
          <div className={`${styles.card} ${styles.expenseCard}`}>
            <h3>{t("reports.summary.totalExpenses")}</h3>
            <p>{formatCurrency(summary.totalExpenses)}</p>
          </div>
          <div className={`${styles.card} ${styles.profitCard}`}>
            <h3>{t("reports.summary.netProfit")}</h3>
            <p
              className={
                summary.netProfit < 0 ? styles.negativeProfit : ""
              }
            >
              {formatCurrency(summary.netProfit)}
            </p>
          </div>
          <div className={styles.card}>
            <h3>{t("reports.summary.taxCollected")}</h3>
            <p>{formatCurrency(summary.taxCollected)}</p>
          </div>
          <div className={styles.card}>
            <h3>{t("reports.summary.discountGiven")}</h3>
            <p>{formatCurrency(summary.discountGiven)}</p>
          </div>
        </div>

        <div className={styles.chartSection}>
          <h3>{t("reports.chart.title")}</h3>
          <div className={styles.chartContainer}>
            <ChartContainer config={chartConfig}>
              <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 6)}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => formatCurrency(value).replace("₹", "₹ ")}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        <Accordion type="multiple" className={styles.accordion}>
          <AccordionItem value="income">
            <AccordionTrigger>
              {t("reports.transactions.incomeTitle")} (
              {incomeTransactions.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t("reports.transactions.date")}</th>
                      <th>{t("reports.transactions.customer")}</th>
                      <th>{t("reports.transactions.estimateNumber")}</th>
                      <th>{t("reports.transactions.paymentType")}</th>
                      <th className={styles.amountHeader}>
                        {t("reports.transactions.amount")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeTransactions.map((tx, i) => (
                      <tr key={`inc-${i}`}>
                        <td>{formatDate(tx.date)}</td>
                        <td>{tx.customerName}</td>
                        <td>#{tx.estimateNumber}</td>
                        <td className={styles.capitalize}>{tx.paymentType}</td>
                        <td className={styles.amountCell}>
                          {formatCurrency(tx.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="expenses">
            <AccordionTrigger>
              {t("reports.transactions.expenseTitle")} (
              {expenseTransactions.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t("reports.transactions.date")}</th>
                      <th>{t("reports.transactions.supplier")}</th>
                      <th>{t("reports.transactions.billNumber")}</th>
                      <th>{t("reports.transactions.paymentStatus")}</th>
                      <th className={styles.amountHeader}>
                        {t("reports.transactions.amount")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseTransactions.map((tx, i) => (
                      <tr key={`exp-${i}`}>
                        <td>{formatDate(tx.date)}</td>
                        <td>{tx.supplierName}</td>
                        <td>{tx.billNumber || "-"}</td>
                        <td className={styles.capitalize}>{tx.paymentStatus}</td>
                        <td className={styles.amountCell}>
                          {formatCurrency(tx.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};