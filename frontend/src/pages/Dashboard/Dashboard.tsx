import React, { useEffect, useState, useContext } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

import DashboardChartSection from './DashBoardChartSection';
import FinancialSummaryCards from './FinancialSummaryCards';
import CreditCardSlider from './CreditCardSlider';
import DemoPage from '../TransactionTable/page';
import BudgetContext from '@/context/BudgetContext';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BudgetPieChart } from '../Charts/BudgetPieChart';
// import BudgetBarChart from '../Charts/BudgetBarChart';


const Dashboard = () => {
  const { user } = useUser();
  const [selectedAccountId, setSelectedAccountId] = useState<string>();
  const ctx = useContext(BudgetContext);

   useEffect(() => {
      if (!ctx) return;

      const { accountsData } = ctx;
      if (accountsData.length > 0 && !selectedAccountId) {
        setSelectedAccountId(accountsData[0]._id);
      }
    }, [ctx, selectedAccountId]);

    if (!ctx) {
      return <div>Loading...</div>;
    }

  const { income, expense, accountsData, allBudgetsInfo, transactions, incomeTypes, refreshTransactions } = ctx;
  const combinedCategories = [
    ...allBudgetsInfo.map(b => ({ id: b._id, name: b.budgetname })),
    ...incomeTypes
  ];
  console.log("combined",combinedCategories)
  

  return (
    <motion.div
      className='p-5'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className='font-bold text-3xl mb-2'>Hi {user?.fullName}!</h2>
      <p className='text-gray-500 mb-6'>Here's what’s happening with your money. Let’s manage your expenses.</p>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT SECTION */}
        <div className="lg:w-[70%] w-full flex flex-col gap-6">
          {/* Financial Summary */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold mb-2">Financial Summary</h3>
            <FinancialSummaryCards
              balance={accountsData.reduce((sum, account) => sum + account.balance, 0)}
              income={income}
              expense={expense}
              savingsGoal={5000}
            />
          </motion.div>

          {/* Chart Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold mb-2">Expense & Income Charts</h3>
            <DashboardChartSection userId={user?.id} />
          </motion.div>

          {/* Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <DemoPage
                  expenseList={transactions}
                  accountList={accountsData}
                  categoryList={combinedCategories}
                  refreshData={refreshTransactions}
                  filters={["account","category"]}                  
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* RIGHT SECTION */}
        <div className="lg:w-[30%] w-full flex flex-col gap-6">
          {accountsData.length > 0 && selectedAccountId && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h3 className="text-xl font-semibold mb-2">Linked Accounts</h3>
              <CreditCardSlider
                accountsData={accountsData}
                selectedAccountId={selectedAccountId}
                onAccountChange={(newId) => setSelectedAccountId(newId)}
              />
            </motion.div>
          )}
          <BudgetPieChart budgetsList={allBudgetsInfo} />
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
