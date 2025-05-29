import React, {useState, useEffect} from 'react'
import CreateBudget from './CreateBudget'
import { useUser } from '@clerk/clerk-react';
import BudgetItem from './BudgetItem';

const BudgetList = () => {
  const [budgetsList, setBudgetsList] = useState([]);
  const {user} = useUser();

  const getBudgetList = async () => {
    try {
      const userId = user.id;
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/budget/budgetSummary/${userId}`);
      const data = await res.json(); 
      console.log(data);
      setBudgetsList(data);
    } catch (err) {
      console.error("Error fetching budgets:", err);
    }
  };

  useEffect(() => {
    user&&getBudgetList();
  }, [user]);

  return (
  <div className="mt-7 px-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {/* CreateBudget card wrapper */}
      <div className="w-full">
        <CreateBudget refreshData={() => getBudgetList()} />
      </div>

      {/* Budgets List */}
      {budgetsList?.length > 0
        ? budgetsList.map((budget, index) => (
            <div className="w-full" key={index}>
              <BudgetItem budget={budget} />
            </div>
          ))
        : // Loading placeholders
          [1, 2, 3, 4, 5].map((item, index) => (
            <div
              key={index}
              className="w-full bg-slate-200 rounded-lg h-[150px] animate-pulse"
            ></div>
          ))}
    </div>
  </div>
);

}

export default BudgetList
