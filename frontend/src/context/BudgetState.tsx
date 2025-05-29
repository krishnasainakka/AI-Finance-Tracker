import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import BudgetContext from "./BudgetContext";

type Account = {
  _id: string;
  accountName: string;
  balance: number;
  createdBy: string;
  createdAt?: string;
};

export type MonthlyTransaction = {
  amount: number;
  category: string;
  date: string;
  type: "Income" | "Expense";
};

type BudgetInfo = {
  _id: string;
  budgetName: string;
  icon: string;
  maxBudget: number;
  totalSpent: number;
  expenseCount: number;
};

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();

  const [accountsData, setAccountsData] = useState<Account[]>([]);
  const [allBudgetsInfo, setAllBudgetsInfo] = useState<BudgetInfo[]>([]);
  const [income, setIncome] = useState<number>(0);
  const [expense, setExpense] = useState<number>(0);
  const [transactions, setTransactions] = useState([]);

  const incomeTypes = [
      { id: 'salary', name: 'Salary' },
      { id: 'freelancing', name: 'Freelancing' },
      { id: 'investments', name: 'Investments' },
      { id: 'rental', name: 'Rental Income' },
      { id: 'business', name: 'Business' },
      { id: 'youtube', name: 'Youtube'},
      { id: 'others', name: 'Others' },
  ];


  const getAllAccounts = async () => {
    try {
      const accRes = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/account/getaccount/${user?.id}`);
      const accData: Account[] = await accRes.json();
      setAccountsData(accData);
      // console.log("Hi")
      // console.log(accountsData)
    } catch (err) {
      console.error("Error fetching accounts:", err);
    }
  };

  const getAllBudgetInfo = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/budget/budgetSummary/${user?.id}`);
      const data: BudgetInfo[] = await res.json();
      setAllBudgetsInfo(data);
    } catch (err) {
      console.error("Error fetching budget info:", err);
    }
  };

  const getAllTransactions = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/transactions/user/${user?.id}`);
      const data = await res.json();
      setIncome(data.incomes.reduce((sum, item) => sum + item.amount, 0));
      setExpense(data.expenses.reduce((sum, item) => sum + item.amount, 0));
      const allTransactions = [...data.incomes, ...data.expenses];
      setTransactions(allTransactions);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const getCurrentMonthTransactions = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/transactions/user/${user?.id}/current-month-transactions`);
      if (!res.ok) {
        throw new Error("Failed to fetch current month transactions");
      }

      const data = await res.json();

      return data.transactions; 
    } catch (error) {
      console.error("Error fetching current month data:", error);
      return []; 
    }
  };


  useEffect(() => {
    if (user?.id) {
      getAllAccounts();
      getAllBudgetInfo();
      getAllTransactions();
    }
  }, [user]);

  return (
    <BudgetContext.Provider
      value={{        
        accountsData,
        allBudgetsInfo,
        income,
        expense,    
        transactions,
        incomeTypes,
        refreshAccounts: getAllAccounts,
        refreshBudgets: getAllBudgetInfo,
        refreshTransactions: getAllTransactions, 
        getCurrentMonthTransactions
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};
