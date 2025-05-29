import React, { useEffect, useState } from "react";
import IncomeExpenseChart from "../Charts/IncomeExpenseChart";

interface IncomeExpenseData {
  date: string;       
  income: number;     
  expense: number;    
}
interface DateRange {
  from?: Date;
  to?: Date;
}

const DashboardChartSection: React.FC<{ userId: string }> = ({ userId }) => {
  const [chartData, setChartData] = useState<IncomeExpenseData[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/transactions/user/${userId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const { incomes, expenses } = await res.json();
        console.log("incomes", incomes);
        console.log("expenses", expenses);

        // Group data by date
        const dateMap: Record<string, { income: number; expense: number }> = {};

        for (const income of incomes) {
          const date = income.date.slice(0, 10);
          dateMap[date] = dateMap[date] || { income: 0, expense: 0 };
          dateMap[date].income += income.amount;
        }

        for (const expense of expenses) {
          const date = expense.date.slice(0, 10);
          dateMap[date] = dateMap[date] || { income: 0, expense: 0 };
          dateMap[date].expense += expense.amount;
        }

        const merged: IncomeExpenseData[] = Object.entries(dateMap).map(([date, { income, expense }]) => ({
          date,
          income,
          expense,
        }));

        // Sort by date
        merged.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setChartData(merged);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, [userId]);

  return (
    <IncomeExpenseChart
      data={chartData}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
    />
  );
};

export default DashboardChartSection;
