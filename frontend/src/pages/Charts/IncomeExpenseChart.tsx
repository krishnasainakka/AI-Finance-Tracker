import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { format } from "date-fns";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface IncomeExpenseData {
  date: string;
  income: number;
  expense: number;
}

interface DateRange {
  from?: Date;
  to?: Date;
}

interface IncomeExpenseChartProps {
  data: IncomeExpenseData[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({
  data,
  dateRange,
  onDateRangeChange,
}) => {
  const filteredData = data.filter((item) => {
    const date = new Date(item.date);
    return (
      (!dateRange.from || date >= dateRange.from) &&
      (!dateRange.to || date <= dateRange.to)
    );
  });

  const chartData = {
    labels: filteredData.map((item) => format(new Date(item.date), "MMM dd")),
    datasets: [
      {
        label: "Income",
        data: filteredData.map((item) => item.income),
        backgroundColor: "rgba(34, 197, 94, 0.6)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 2,
      },
      {
        label: "Expenses",
        data: filteredData.map((item) => item.expense),
        backgroundColor: "rgba(239, 68, 68, 0.6)",
        borderColor: "rgb(239, 68, 68)",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: {
            dataset: { label?: string };
            parsed: { y: number | null };
          }) {
            let label = context.dataset.label || "";
            if (label) label += ": ";
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          callback: function (value: number | string) {
            return "₹" + value;
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    animation: {
      duration: 1000,
    },
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-lg relative overflow-visible">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-4">
        <CardTitle className="text-lg font-semibold">Income vs Expenses</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 bg-gray-50 rounded-md p-3 shadow-inner overflow-visible">
          <div className="flex flex-col min-w-[140px]">
            <label
              htmlFor="from-date"
              className="mb-1 text-sm font-medium text-gray-700"
            >
              From:
            </label>
            <input
              id="from-date"
              type="date"
              value={dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : ""}
              onChange={(e) =>
                onDateRangeChange({
                  ...dateRange,
                  from: e.target.value ? new Date(e.target.value) : undefined,
                })
              }
              className="border border-gray-300 rounded-md px-3 py-2 text-sm transition 
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                hover:border-green-400"
            />
          </div>
          <div className="flex flex-col min-w-[140px]">
            <label
              htmlFor="to-date"
              className="mb-1 text-sm font-medium text-gray-700"
            >
              To:
            </label>
            <input
              id="to-date"
              type="date"
              value={dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
              onChange={(e) =>
                onDateRangeChange({
                  ...dateRange,
                  to: e.target.value ? new Date(e.target.value) : undefined,
                })
              }
              className="border border-gray-300 rounded-md px-3 py-2 text-sm transition
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500
                hover:border-red-400"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-80">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeExpenseChart;
