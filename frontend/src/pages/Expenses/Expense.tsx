import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useContext } from 'react';
import BudgetContext from "@/context/BudgetContext";
import { useUser } from "@clerk/clerk-react";
import BudgetItem from "../Budget/BudgetItem";
import AddExpense from "./AddExpense";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import EditBudget from "./EditBudget";
import DemoPage from "../TransactionTable/page";
import { motion } from "framer-motion";

type BudgetInfo = {
  _id: string;
  budgetname: string;
  amount: number;
  icon: string;
  createdBy: string;
  category: string;
  // expensesThisMonth: Expense[];
  totalSpentThisMonth: number;
  expenseCountThisMonth: number;
};

type ExpenseItem = {
  _id: string;
  name: string;
  amount: number;
  createdBy: string;
  createdAt?: string;
};

const Expense: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();  
  const [budgetInfo, setBudgetInfo] = useState<BudgetInfo | null>(null);
  const [expenseList, setExpenseList] = useState<ExpenseItem[]>([]);

  const ctx = useContext(BudgetContext);

  if (!ctx) {
    return <div>Loading...</div>;
  }

  const { accountsData, allBudgetsInfo, refreshTransactions, refreshBudgets } = ctx;

  const getBudgetInfo = async () => {
    if (!user?.id || !id) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/budget/budgetSummary/${user.id}/${id}`);
      const data: BudgetInfo = await res.json();
      setBudgetInfo(data);
      getExpenseList();
      refreshTransactions();  
      refreshBudgets();    
    } catch (err) {
      console.error("Error fetching budget info:", err);
    }
  };

  const getExpenseList = async () => {
    if (!user?.id || !id) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/expense/getexpense/${user.id}/${id}`);
      const data: ExpenseItem[] = await res.json();
      setExpenseList(data);
    } catch (err) {
      console.error("Error fetching expenses list:", err);
    }
  };

  useEffect(() => {
    if (user && id) {
      getBudgetInfo();
      getExpenseList();      
    }
  }, [user, id]);


  const deleteBudget = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/budget/deleteBudget/${user.id}/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Budget deleted");
        navigate("/dashboard/budget");
      } else {
        const errorData = await res.json();
        toast.error(`Failed to delete budget: ${errorData.message}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Something went wrong while deleting.");
    }
  };

  return (
    <motion.div className="p-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <h2 className="text-2xl font-bold flex justify-between items-center">
        <ArrowLeft onClick={() => navigate(-1)} className="cursor-pointer" />
        My Expenses
        <div className="flex gap-2 items-center ">
          <EditBudget budgetInfo={budgetInfo} refreshData={() => getBudgetInfo()} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <span>
                <Button className="flex gap-2" variant="destructive">
                  <Trash />
                  Delete
                </Button>
              </span>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your budget and all
                  expenses in it and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteBudget}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </h2>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6 mt-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {budgetInfo ? (
          <BudgetItem budget={budgetInfo} />
        ) : (
          <div className="h-[150px] w-full bg-slate-200 rounded-lg animate-pulse"></div>
        )}

        {user && id && (
          <AddExpense budgetId={id} userId={user.id} refreshData={getBudgetInfo} />
        )}
      </motion.div>


      <motion.div className="mt-4" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
        <h2 className="font-bold text-lg">Latest Expenses</h2>
        <DemoPage expenseList={expenseList} accountList={accountsData} categoryList={allBudgetsInfo.map(b => ({ id: b._id, name: b.budgetName }))} refreshData={getBudgetInfo} filters={["account", "recurring"]}/>
      </motion.div>
    </motion.div>
  );
};

export default Expense;
