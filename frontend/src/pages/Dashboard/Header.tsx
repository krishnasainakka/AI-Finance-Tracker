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

interface HeaderProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const { user } = useUser();
  const { isSignedIn } = useUser();
  const [open, setOpen] = useState(false);
  const ctx = useContext(BudgetContext);

  if (!ctx) return <div>Loading...</div>;

  const { refreshTransactions } = ctx;

  return (
    <div className='p-4 sm:p-5 shadow-sm border-b bg-white relative flex items-center justify-between'>
      {/* Left side: Menu */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Centered title */}
      <h1 className="absolute left-1/2 -translate-x-[60%] text-[1.5rem] sm:text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600 tracking-wider font-serif text-center">
        Personal Budget Tracker
      </h1>

      {/* Right side: Scanner + User */}
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        {isSignedIn && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="flex flex-col items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-lg shadow hover:from-purple-600 hover:to-pink-600 transition text-xs sm:text-sm max-w-[60px] sm:max-w-[130px] text-center whitespace-normal leading-tight">
                <ScanLine size={16} />
                <span className="text-[10px] sm:text-xs">AI Receipt Scanner</span>
              </button>
            </DialogTrigger>
            <DialogContent
              className="z-[1000] sm:max-w-xl w-full p-6 bg-white shadow-2xl"
              style={{ maxHeight: '80vh', overflowY: 'auto' }}
            >
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogClose className="text-gray-500 hover:text-gray-700" />
              </DialogHeader>
              <AIAddExpense userId={user?.id} refreshData={refreshTransactions} />
            </DialogContent>
          </Dialog>
        )}

        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

export default Header;
