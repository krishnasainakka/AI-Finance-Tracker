import { createContext } from "react";

type BudgetInfo = {
  _id: string;
  budgetname: string;
  icon: string;
  maxBudget: number;
  totalSpent: number;
  expenseCount: number;
};

// type ExpenseItem = {
//   _id: string;
//   name: string;
//   amount: number;
//   createdBy: string;
//   createdAt?: string;
//   type: string;
// };

type Account = {
  _id: string;
  accountName: string;
  balance: number;
  createdBy: string;
  createdAt?: string;
};

export type TransactionItem = {
  _id: string;
  name: string;
  amount: number;
  accountId: string;
  accountName: string;
  recurring: boolean;
  recurringPeriod?: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  originalRecurringId?: string;
  date: string;
  createdBy: string;
  type: 'income' | 'expense';  
  budgetId?: string;
  category: string;
};

// type MonthlyTransaction = {
//   amount: number;
//   category: string;
//   date: string;
//   type: "Income" | "Expense";
// };


// Define types
export interface BudgetContextType {
  accountsData: Account[];
  allBudgetsInfo: BudgetInfo[];
  income: number;
  expense: number;
  transactions: TransactionItem[];
  incomeTypes: { id: string; name: string }[];
  refreshAccounts: () => void;
  refreshBudgets: () => void;
  refreshTransactions: () => void;
  getCurrentMonthTransactions: () => Promise<void>;
}



const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export default BudgetContext