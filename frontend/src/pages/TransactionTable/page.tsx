import type { Transaction} from "./columns"

import { getColumns } from "./columns"
import { DataTable } from "./data-table"

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
type Account = {
  _id: string;
  accountName: string;
  balance: number;
  createdBy: string;
  createdAt?: string;
};
type Category = {
  id: string;
  name: string;
}

interface DemoPageProps {
  expenseList: TransactionItem[];
  accountList: Account[];
  categoryList: Category[];
  refreshData: () => void;
  filters: string[];
}

export default function DemoPage({ expenseList, accountList, categoryList, refreshData, filters }: DemoPageProps) {
  const data = expenseList;    
  // console.log("📦 expenseList demo page:", expenseList);
  // console.log("🏦 accountList:", accountList);
  // console.log("💰 budgetList:", budgetList);

  if (!expenseList) {
    console.warn("❗ expenseList is null or undefined");
  }

  if (!accountList) {
    console.warn("❗ accountList is null or undefined");
  }

  if (!categoryList) {
    console.warn("❗ budgetList is null or undefined");
  }

  return (
    <div className="container mx-auto py-10">
      
      <DataTable columns={getColumns(refreshData)} data={data} accountList={accountList} categoryList={categoryList} filters={filters}/>
    </div>
  )
}
