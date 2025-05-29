import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

interface Budget {
  _id: string;
  icon: string;
  budgetname: string;
  amount: number;
  category: string;
  totalSpentThisMonth: number;
  expenseCountThisMonth: number;
}

const BudgetItem = ({ budget }:{budget:Budget}) => {
  const navigate = useNavigate()
  if (!budget) return null

  const percentSpent = budget.amount
    ? Math.min((budget.totalSpentThisMonth / budget.amount) * 100, 100)
    : 0

  const handleClick = () => {
    navigate(`/dashboard/expenses/${budget._id}`)
  }

  return (
  <motion.div
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    onClick={handleClick}
    className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto"
  >
    <Card className="cursor-pointer transition-shadow duration-300 bg-white border border-slate-200 rounded-xl shadow-md hover:shadow-lg min-h-[180px] flex flex-col justify-between">
      <CardHeader className="flex flex-wrap justify-between items-center gap-3 p-4">
        <div className="flex gap-3 items-center flex-grow min-w-0">
          <div className="text-xl p-3 bg-gradient-to-br from-sky-100 to-sky-200 text-sky-700 rounded-full shadow-sm flex-shrink-0">
            {budget?.icon}
          </div>
          <div className="min-w-0">
            <CardTitle className="font-bold text-slate-800 text-base sm:text-lg truncate">
              {budget.budgetname}
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 truncate">
              {budget.expenseCountThisMonth} Item{budget.expenseCountThisMonth !== 1 ? "s" : ""}
            </CardDescription>
          </div>
        </div>
        <CardTitle className="text-indigo-600 font-bold text-base sm:text-lg flex-shrink-0 ml-auto whitespace-nowrap">
          ₹{budget.amount}
        </CardTitle>
      </CardHeader>


      <CardContent className="pt-1 px-4">
        <div className="flex justify-between mb-1 text-xs sm:text-sm text-slate-500">
          <span>₹{budget.totalSpentThisMonth ?? 0} Spent</span>
          <span>
            ₹{budget.amount - (budget.totalSpentThisMonth ?? 0)} Remaining
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <motion.div
            className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${percentSpent}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </CardContent>

      <CardFooter className="p-0" />
    </Card>
  </motion.div>
);

}

export default BudgetItem
