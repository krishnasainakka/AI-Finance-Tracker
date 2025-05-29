import { TrendingUp } from "lucide-react"
import { Pie, PieChart, Cell, Tooltip } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface BudgetItem {
  _id: string;
  icon: string;
  budgetname: string;
  amount: number;
  category: string;
  totalSpentThisMonth: number;
  expenseCountThisMonth: number;
}

interface BudgetPieChartProps {
  budgetsList: BudgetItem[]
}

// Currency formatter (INR)
const formatCurrency = (value: number) =>
  value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  })

export function BudgetPieChart({ budgetsList }: BudgetPieChartProps) {
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  const totalSpent = budgetsList.reduce(
    (sum, item) => sum + item.totalSpentThisMonth,
    0
  )

  // Custom Tooltip
  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const { budgetname, totalSpentThisMonth } = payload[0].payload
      const percentage = ((totalSpentThisMonth / totalSpent) * 100).toFixed(1)
      return (
        <div className="rounded-md border bg-background p-2 text-sm shadow-md">
          <div className="font-semibold">{budgetname}</div>
          <div>
            {formatCurrency(totalSpentThisMonth)} ({percentage}%)
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-base">Spending Distribution</CardTitle>
        <CardDescription className="text-sm">Actual Expenses</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center pb-0">
        <PieChart width={240} height={240}>
          <Pie
            data={budgetsList}
            dataKey="totalSpentThisMonth"
            nameKey="budgetname"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
          >
            {budgetsList.map((item, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={renderCustomTooltip} />
        </PieChart>

        {/* Legend */}
        <div className="mt-4 flex flex-col items-start text-xs">
          {budgetsList.map((item, index) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <span className="font-medium">{item.budgetname}</span>
              <span className="text-muted-foreground ml-2">
                {formatCurrency(item.totalSpentThisMonth)} /{" "}
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-1 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Spending overview <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground text-xs">
          Based on your actual expenses this month
        </div>
      </CardFooter>
    </Card>
  )
}
