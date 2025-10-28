import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { subDays, startOfWeek, startOfMonth, startOfYear, endOfDay, startOfDay } from "date-fns";
import { useLanguage } from "../helpers/useLanguage";
import { Button } from "../components/Button";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "../components/Popover";
import { Calendar } from "../components/Calendar";
import { useIncomeExpenseReport } from "../helpers/useReportQueries";
import { IncomeExpenseReport } from "../components/IncomeExpenseReport";
import { CashFlowReport } from "../components/CashFlowReport";
import { Skeleton } from "../components/Skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/Tabs";
import { useCashFlowReport } from "../helpers/useReportQueries";
import styles from "./reports.module.css";

type DateRange = {
  from: Date;
  to: Date;
};

type QuickFilter = "today" | "week" | "month" | "year";

export default function ReportsPage() {
  const { t } = useLanguage();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [activeFilter, setActiveFilter] = useState<QuickFilter | "custom">(
    "month"
  );
  const [submittedDateRange, setSubmittedDateRange] = useState<DateRange>(dateRange);

  const {
    data: incomeExpenseData,
    isFetching: isFetchingIncomeExpense,
    error: incomeExpenseError,
  } = useIncomeExpenseReport(submittedDateRange.from, submittedDateRange.to);

  const {
    data: cashFlowData,
    isFetching: isFetchingCashFlow,
    error: cashFlowError,
  } = useCashFlowReport(submittedDateRange.from, submittedDateRange.to);

  const handleQuickFilter = (filter: QuickFilter) => {
    setActiveFilter(filter);
    let fromDate = new Date();
    const toDate = endOfDay(new Date());

    switch (filter) {
      case "today":
        fromDate = startOfDay(new Date());
        break;
      case "week":
        fromDate = startOfWeek(new Date());
        break;
      case "month":
        fromDate = startOfMonth(new Date());
        break;
      case "year":
        fromDate = startOfYear(new Date());
        break;
    }
    const newRange = { from: fromDate, to: toDate };
    setDateRange(newRange);
    setSubmittedDateRange(newRange);
  };

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      setDateRange({ from: range.from, to: range.to });
      setActiveFilter("custom");
    }
  };

  const handleApplyFilter = () => {
    setSubmittedDateRange(dateRange);
  };

  const renderIncomeExpenseContent = () => {
    if (isFetchingIncomeExpense) {
      return (
        <div className={styles.skeletonContainer}>
          <div className={styles.summaryCards}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className={styles.summaryCardSkeleton} />
            ))}
          </div>
          <Skeleton className={styles.chartSkeleton} />
          <Skeleton className={styles.tableSkeleton} />
        </div>
      );
    }

    if (incomeExpenseError) {
      return (
        <div className={styles.errorState}>
          <p>{t("reports.error.title")}</p>
          <p>
            <em>
              {incomeExpenseError instanceof Error
                ? incomeExpenseError.message
                : t("reports.error.unknown")}
            </em>
          </p>
        </div>
      );
    }

    if (incomeExpenseData) {
      return (
        <IncomeExpenseReport
          data={incomeExpenseData}
          dateRange={submittedDateRange}
        />
      );
    }

    return null;
  };

  const renderCashFlowContent = () => {
    if (isFetchingCashFlow) {
      return (
        <div className={styles.skeletonContainer}>
          <div className={styles.summaryCards}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className={styles.summaryCardSkeleton} />
            ))}
          </div>
          <Skeleton className={styles.chartSkeleton} />
          <Skeleton className={styles.tableSkeleton} />
        </div>
      );
    }

    if (cashFlowError) {
      return (
        <div className={styles.errorState}>
          <p>{t("reports.error.title")}</p>
          <p>
            <em>
              {cashFlowError instanceof Error
                ? cashFlowError.message
                : t("reports.error.unknown")}
            </em>
          </p>
        </div>
      );
    }

    if (cashFlowData) {
      return (
        <CashFlowReport data={cashFlowData} dateRange={submittedDateRange} />
      );
    }

    return null;
  };

  return (
    <>
      <Helmet>
        <title>{t("reports.pageTitle")}</title>
        <meta name="description" content={t("reports.metaDescription")} />
      </Helmet>
      <div className={styles.pageContainer}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>{t("reports.title")}</h1>
            <p className={styles.subtitle}>{t("reports.subtitle")}</p>
          </div>
        </header>

        <div className={styles.filterContainer}>
          <div className={styles.quickFilters}>
            <Button
              variant={activeFilter === "today" ? "primary" : "outline"}
              onClick={() => handleQuickFilter("today")}
            >
              {t("reports.filters.today")}
            </Button>
            <Button
              variant={activeFilter === "week" ? "primary" : "outline"}
              onClick={() => handleQuickFilter("week")}
            >
              {t("reports.filters.thisWeek")}
            </Button>
            <Button
              variant={activeFilter === "month" ? "primary" : "outline"}
              onClick={() => handleQuickFilter("month")}
            >
              {t("reports.filters.thisMonth")}
            </Button>
            <Button
              variant={activeFilter === "year" ? "primary" : "outline"}
              onClick={() => handleQuickFilter("year")}
            >
              {t("reports.filters.thisYear")}
            </Button>
          </div>
          <div className={styles.customFilters}>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={styles.datePickerTrigger}>
                  <CalendarIcon size={16} />
                  <span>
                    {dateRange.from.toLocaleDateString()} -{" "}
                    {dateRange.to.toLocaleDateString()}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent removeBackgroundAndPadding>
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDateSelect}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button
              onClick={handleApplyFilter}
              disabled={isFetchingIncomeExpense || isFetchingCashFlow}
            >
              {t("reports.filters.apply")}
            </Button>
          </div>
        </div>

        <main className={styles.mainContent}>
          <Tabs defaultValue="income-expense">
            <TabsList>
              <TabsTrigger value="income-expense">
                {t("reports.report.title")}
              </TabsTrigger>
              <TabsTrigger value="cash-flow">
                {t("reports.cashFlow.reportTitle")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="income-expense">
              {renderIncomeExpenseContent()}
            </TabsContent>

            <TabsContent value="cash-flow">
              {renderCashFlowContent()}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}