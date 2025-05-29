import React from "react";
import {
  TrendingDownIcon,
  WalletIcon,
  PiggyBankIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";

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

interface CardInfoProps {
  budgetsList: BudgetItem[];
}


const CardInfo: React.FC<CardInfoProps> = ({ budgetsList }) => {
  // If no budgets, set default empty values
  const hasBudgets = budgetsList && budgetsList.length > 0;

  const totalBudget = hasBudgets
    ? budgetsList.reduce((acc: number, item: BudgetItem) => acc + item.amount, 0)
    : 0;

  const totalSpent = hasBudgets
    ? budgetsList.reduce((acc: number, item: BudgetItem) => acc + item.totalSpentThisMonth, 0)
    : 0;

  const remainingBudget = totalBudget - totalSpent;

  const topSpendingCategory = hasBudgets
    ? budgetsList.reduce((top: BudgetItem | null, item: BudgetItem) => {
        const currentRatio = item.totalSpentThisMonth / item.amount;
        const topRatio = top ? top.totalSpentThisMonth / top.amount : 0;
        return currentRatio > topRatio ? item : top;
      }, null)
    : null;

  const remainingColor = remainingBudget >= 0 ? "text-sky-700" : "text-rose-700";
  const spentColor = totalSpent > totalBudget ? "text-rose-700" : "text-amber-700";

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 px-4 lg:px-8 mt-10">
      {/* Total Budget */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-green-200 to-green-100 shadow-lg hover:scale-[1.02] transition-transform">
          <CardHeader className="relative">
            <CardDescription className="text-green-900 font-semibold">Total Budget</CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums text-green-800">
              ₹{totalBudget.toLocaleString()}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="text-xs bg-green-300 text-green-900">
                <WalletIcon className="size-3 mr-1" /> Healthy Plan
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="text-sm text-green-700">Across all categories</CardFooter>
        </Card>
      </motion.div>

      {/* Total Spent */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-rose-100 to-rose-200 shadow-lg hover:scale-[1.02] transition-transform">
          <CardHeader className="relative">
            <CardDescription className="text-rose-900 font-semibold">Total Spent</CardDescription>
            <CardTitle className={`text-3xl font-bold tabular-nums ${spentColor}`}>
              ₹{totalSpent.toLocaleString()}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="text-xs bg-rose-300 text-rose-900">
                <TrendingDownIcon className="size-3 mr-1" /> Spent
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="text-sm text-rose-800">
            {totalSpent > totalBudget ? "You overspent your budget!" : "On track"}
          </CardFooter>
        </Card>
      </motion.div>

      {/* Remaining Budget */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-sky-100 to-sky-200 shadow-lg hover:scale-[1.02] transition-transform">
          <CardHeader className="relative">
            <CardDescription className="text-sky-900 font-semibold">Remaining Budget</CardDescription>
            <CardTitle className={`text-3xl font-bold tabular-nums ${remainingColor}`}>
              ₹{remainingBudget.toLocaleString()}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge
                variant="outline"
                className={`text-xs ${
                  remainingBudget >= 0 ? "bg-sky-300 text-sky-900" : "bg-rose-300 text-rose-900"
                }`}
              >
                <PiggyBankIcon className="size-3 mr-1" />
                {remainingBudget >= 0 ? "Safe" : "Over"}
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="text-sm text-sky-800">Keep monitoring expenses</CardFooter>
        </Card>
      </motion.div>

      {/* Top Spending Category */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.7 }}
      >
        <Card className="bg-gradient-to-br from-purple-100 to-fuchsia-200 shadow-lg hover:scale-[1.02] transition-transform">
          <CardHeader className="relative">
            <CardDescription className="text-purple-900 font-semibold">Top Spending Category</CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums text-purple-800">
              {/* Show a default message if no budgets */}
              {topSpendingCategory
                ? (
                  <>
                    {topSpendingCategory.icon} {topSpendingCategory.budgetname}
                  </>
                )
                : "No categories yet"}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="text-xs bg-purple-300 text-purple-700">
                ₹{topSpendingCategory?.totalSpentThisMonth?.toLocaleString() ?? 0}
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="text-sm text-purple-800">Based on total expenses</CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};


export default CardInfo;
