import React, { useEffect, useState } from "react";
import { useContext } from 'react';
import BudgetContext from "@/context/BudgetContext";
import { useUser } from "@clerk/clerk-react";

import DemoPage from "../TransactionTable/page";
import { motion } from "framer-motion";
import AddIncome from "./AddIncome";

type IncomeItem = {
  _id: string;
  name: string;
  amount: number;
  category: string;
  accountName: string; 
  createdBy: string;
  createdAt?: string;
};

const Income: React.FC = () => {
  const { user } = useUser();  
  const [incomeList, setIncomeList] = useState<IncomeItem[]>([]);
  
  const ctx = useContext(BudgetContext);

  if (!ctx) {
    return <div>Loading...</div>;
  }

  const { accountsData, incomeTypes, refreshTransactions } = ctx;  

  const getIncomeList = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/income/getincome/${user.id}`);
      const data: IncomeItem[] = await res.json();
      setIncomeList(data);      
    } catch (err) {
      console.error("Error fetching expenses list:", err);
    }
  };

  useEffect(() => {
    if (user) {
      getIncomeList()           
    }
  }, [user]);  

  return (
  <motion.div
    className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div
      className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-6"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {user && (
        <div className="w-full">
          <AddIncome
            userId={user.id}
            incomeTypes={incomeTypes}
            refreshTransactions={getIncomeList}
          />
        </div>
      )}
      {/* If you want, put another component or placeholder here */}
      <div className="hidden md:block" />
    </motion.div>

    <motion.div
      className="mt-8"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <h2 className="font-bold text-lg mb-4">Latest Incomes</h2>
      <DemoPage
        expenseList={incomeList}
        accountList={accountsData}
        categoryList={incomeTypes}
        refreshData={getIncomeList}
        filters={["account", "category", "recurring"]}
      />
    </motion.div>
  </motion.div>
);

};

export default Income;
