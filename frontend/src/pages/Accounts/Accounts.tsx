import { useEffect, useState, useContext } from 'react';
import { motion } from 'framer-motion';
import CreditCardSlider from '../Dashboard/CreditCardSlider';
import DemoPage from '../TransactionTable/page';
import BudgetContext from '@/context/BudgetContext';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CreateAccount from './CreateAccount';

const Accounts = () => {
  const ctx = useContext(BudgetContext);
  const [selectedAccountId, setSelectedAccountId] = useState<string>();

  // Always define useEffect, even if it doesn't do anything
  useEffect(() => {
    if (ctx && ctx.accountsData.length > 0 && !selectedAccountId) {
      setSelectedAccountId(ctx.accountsData[0]._id);
    }
  }, [ctx, selectedAccountId]);

  if (!ctx) return <div>Loading...</div>;

  const {    
    accountsData,
    allBudgetsInfo,
    transactions,
    incomeTypes,
    refreshTransactions,
    refreshAccounts
  } = ctx;  

  const filteredTransactions = selectedAccountId
    ? transactions.filter((tx) => tx.accountId === selectedAccountId)
    : [];

  const combinedCategories = [
    ...allBudgetsInfo.map(b => ({ id: b._id, name: b.budgetname })),
    ...incomeTypes
  ];

  return (
    <motion.div
      className="p-5 flex flex-col gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Create Account */}
        <div className="lg:w-[35%] w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold mb-2">Create Account</h3>
            <CreateAccount refreshAccounts={refreshAccounts} />
          </motion.div>
        </div>

        {/* Right: Linked Accounts */}
        {accountsData.length > 0 && selectedAccountId && (
          <div className="relative lg:w-[35%] w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <h3 className="text-xl font-semibold mb-2">Linked Accounts</h3>

              {/* Card Wrapper to allow absolute positioning */}
              <div className="relative">
                <CreditCardSlider
                  accountsData={accountsData}
                  selectedAccountId={selectedAccountId}
                  onAccountChange={(newId) => setSelectedAccountId(newId)}
                />                
              </div>
            </motion.div>
          </div>
        )}

      </div>

      {/* Transactions for Selected Account */}
      {selectedAccountId && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle>Transactions for Selected Account</CardTitle>
            </CardHeader>
            <CardContent>
              <DemoPage
                expenseList={filteredTransactions}
                accountList={accountsData}
                categoryList={combinedCategories}
                refreshData={refreshTransactions}
                filters={["category", "recurring"]}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Accounts;
