import React from "react";
import { useReactToPrint } from "react-to-print";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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
import { OutputType as ReportData } from "../endpoints/reports/cash-flow_GET.schema";
import styles from "./CashFlowReport.module.css";

interface CashFlowReportProps {
  data: ReportData;
  dateRange: { from: Date; to: Date };
}

const chartConfig: ChartConfig = {
  runningBalance: {
    label: "Balance",
    color: "var(--info)",
  },
};

export const CashFlowReport = ({
  data,
  dateRange,
}: CashFlowReportProps) => {
  const { t } = useLanguage();
  const printRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Cash-Flow-Report-${formatDate(dateRange.from)}-${formatDate(dateRange.to)}`,
  });

  const { summary, dailyBreakdown, inflowTransactions, outflowTransactions } =
    data;

  const chartData = dailyBreakdown.map((d) => ({
    ...d,
    date: formatDate(d.date),
  }));

  return (
    <div className={styles.reportContainer}>
      <div className={styles.reportHeader}>
        <h2 className={styles.reportTitle}>{t("reports.cashFlow.reportTitle")}</h2>
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
        <div className={styles.printHeader}>
          <h1>{t("reports.cashFlow.reportTitle")}</h1>
          <p>
            {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
          </p>
        </div>

        <div className={styles.summaryCards}>
          <div className={`${styles.card} ${styles.infoCard}`}>
            <h3>{t("reports.cashFlow.openingBalance")}</h3>
            <p>{formatCurrency(summary.openingBalance)}</p>
          </div>
          <div className={`${styles.card} ${styles.incomeCard}`}>
            <h3>{t("reports.cashFlow.cashInflows")}</h3>
            <p>{formatCurrency(summary.totalInflow)}</p>
          </div>
          <div className={`${styles.card} ${styles.expenseCard}`}>
            <h3>{t("reports.cashFlow.cashOutflows")}</h3>
            <p>{formatCurrency(summary.totalOutflow)}</p>
          </div>
          <div className={`${styles.card} ${styles.infoCard}`}>
            <h3>{t("reports.cashFlow.netCashFlow")}</h3>
            <p className={summary.netCashFlow < 0 ? styles.negativeValue : ""}>
              {formatCurrency(summary.netCashFlow)}
            </p>
          </div>
          <div className={`${styles.card} ${styles.infoCard}`}>
            <h3>{t("reports.cashFlow.closingBalance")}</h3>
            <p>{formatCurrency(summary.closingBalance)}</p>
          </div>
        </div>

        <div className={styles.chartSection}>
          <h3>{t("reports.cashFlow.chartTitle")}</h3>
          <div className={styles.chartContainer}>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--muted)" }}
                    content={<ChartTooltipContent />}
                  />
                  <Line
                    type="monotone"
                    dataKey="runningBalance"
                    stroke="var(--color-runningBalance)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

        <Accordion type="multiple" className={styles.accordion}>
          <AccordionItem value="inflows">
            <AccordionTrigger>
              {t("reports.cashFlow.inflowsTitle")} ({inflowTransactions.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t("reports.transactions.date")}</th>
                      <th>{t("reports.cashFlow.source")}</th>
                      <th>{t("reports.transactions.estimateNumber")}</th>
                      <th>{t("reports.transactions.paymentType")}</th>
                      <th className={styles.amountHeader}>{t("reports.transactions.amount")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inflowTransactions.map((tx, i) => (
                      <tr key={`in-${i}`}>
                        <td>{formatDate(tx.date)}</td>
                        <td>{tx.source}</td>
                        <td>{tx.estimateNumber || "-"}</td>
                        <td className={styles.capitalize}>{tx.paymentMethod}</td>
                        <td className={styles.amountCell}>{formatCurrency(tx.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="outflows">
            <AccordionTrigger>
              {t("reports.cashFlow.outflowsTitle")} ({outflowTransactions.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t("reports.transactions.date")}</th>
                      <th>{t("reports.cashFlow.purpose")}</th>
                      <th>{t("reports.transactions.billNumber")}</th>
                      <th>{t("reports.transactions.paymentType")}</th>
                      <th className={styles.amountHeader}>{t("reports.transactions.amount")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outflowTransactions.map((tx, i) => (
                      <tr key={`out-${i}`}>
                        <td>{formatDate(tx.date)}</td>
                        <td>{tx.purpose}</td>
                        <td>{tx.billNumber || "-"}</td>
                        <td className={styles.capitalize}>{tx.paymentMethod || "-"}</td>
                        <td className={styles.amountCell}>{formatCurrency(tx.amount)}</td>
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