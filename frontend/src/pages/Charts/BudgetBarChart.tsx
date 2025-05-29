import { TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


interface Expense {
  _id: string;
  name: string;
  amount: number;
  budgetId: string;
  category: string;
  accountId: string;
  accountName: string;
  recurring: boolean;
  recurringPeriod: string | null;
  date: string;
  createdBy: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface BudgetItem {
  _id: string;
  budgetname: string;
  amount: number;
  icon: string;
  createdBy: string;
  expensesThisMonth: Expense[];
  totalSpentThisMonth: number;
  expenseCountThisMonth: number;
}

interface ChartInfoProps {
  budgetsList: BudgetItem[];
}

const BudgetBarChart: React.FC<ChartInfoProps> = ({ budgetsList }) => {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs. Spent</CardTitle>
        <CardDescription>Track your monthly budget usage</CardDescription>
      </CardHeader>

      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={budgetsList}
            margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="category"
              tick={{ fontSize: 12 }}
              tickMargin={10}
              angle={-25}
              textAnchor="end"
            />
            <YAxis
              tickFormatter={(val) => formatCurrency(val)}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
            />
            <Legend verticalAlign="top" height={36} />
            <Bar
              dataKey="totalSpentThisMonth"
              name="Spent"
              fill="#ef4444" // Red-500
              radius={[6, 6, 0, 0]}
              barSize={30}
            />
            <Bar
              dataKey="amount"
              name="Budget"
              fill="#3b82f6" // Blue-500
              radius={[6, 6, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Review your budget allocation
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div className="leading-none text-muted-foreground">
          Compare actual spending with your allowed budget
        </div>
      </CardFooter>
    </Card>
  );
}

export default BudgetBarChart