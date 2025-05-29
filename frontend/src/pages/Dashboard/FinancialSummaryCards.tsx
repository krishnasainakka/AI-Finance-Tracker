import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, PiggyBank, IndianRupee } from "lucide-react";

interface FinancialSummaryCardsProps {
  balance: number;
  income: number;
  expense: number;
  savingsGoal: number;
}

const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
  balance,
  income,
  expense,
  savingsGoal
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const actualSavings = income - expense;
  const savingsGoalProgress = savingsGoal > 0 ? (actualSavings / savingsGoal) * 100 : 0;

  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
          <p className="text-xs text-muted-foreground">
            Across all accounts
          </p>
        </CardContent>
      </Card>
      
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Income</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">{formatCurrency(income)}</div>
          <p className="text-xs text-muted-foreground">
            +4.3% from last month
          </p>
        </CardContent>
      </Card>
      
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expenses</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{formatCurrency(expense)}</div>
          <p className="text-xs text-muted-foreground">
            -2.1% from last month
          </p>
        </CardContent>
      </Card>
      
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
          <PiggyBank className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-500">
            {formatCurrency(actualSavings)}
          </div>
          <p className="text-xs text-muted-foreground">
            {savingsGoalProgress >= 100 ? "Goal achieved! 🎉" : `${savingsGoalProgress.toFixed(1)}% of goal`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSummaryCards;