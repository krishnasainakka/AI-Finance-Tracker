import React, { useContext, useState } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { ScanLine, Menu } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import AIAddExpense from '../Expenses/AddExpenseAI';
import BudgetContext from '@/context/BudgetContext';

const Header = ({ setSidebarOpen }) => {
  const { user } = useUser();
  const { isSignedIn } = useUser();
  const [open, setOpen] = useState(false);
  const ctx = useContext(BudgetContext);

  if (!ctx) return <div>Loading...</div>;

  const { refreshTransactions } = ctx;

  return (
    <div className='p-5 shadow-sm border-b flex justify-between items-center bg-white'>
      <div className="flex items-center gap-4">
        <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
          <Menu size={24} />
        </button>
        {isSignedIn && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl shadow hover:from-purple-600 hover:to-pink-600 transition text-sm sm:text-base">
                <ScanLine size={18} />
                <span>AI Receipt Scanner</span>
              </button>
            </DialogTrigger>
            <DialogContent className="z-[1000] sm:max-w-xl w-full p-6 bg-white shadow-2xl">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogClose className="text-gray-500 hover:text-gray-700" />
              </DialogHeader>
              <AIAddExpense userId={user.id} refreshData={refreshTransactions} />
            </DialogContent>
          </Dialog>
        )}
      </div>
      <UserButton afterSignOutUrl="/" />
    </div>
  );
};

export default Header;
