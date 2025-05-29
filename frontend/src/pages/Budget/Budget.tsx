import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import CardInfo from './CardInfo';
import BudgetList from './BudgetList';
import { BudgetPieChart } from '../Charts/BudgetPieChart';
import BudgetBarChart from '../Charts/BudgetBarChart';
import MonthlySummary from '../Budget/AIMonthlySummary';
import { motion } from 'framer-motion';

const Budget = () => {
  const { user } = useUser();
  const [budgetsList, setBudgetsList] = useState([]);
  const [selectedChart, setSelectedChart] = useState("pie");

  const getBudgetList = async () => {
    try {
      const userId = user.id;
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/budget/budgetSummary/${userId}`);
      const data = await res.json();
      setBudgetsList(data);
    } catch (err) {
      console.error("Error fetching budgets:", err);
    }
  };

  useEffect(() => {
    user && getBudgetList()
  }, [user]);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <>
      <motion.div className='p-5' initial="hidden" animate="show" variants={fadeUp}>
        <h2 className='font-bold text-2xl'>Budget Overview</h2>
        <CardInfo budgetsList={budgetsList} />
      </motion.div>

      <motion.div initial="hidden" animate="show" variants={fadeUp}>
        <h2 className="font-bold text-2xl m-5">Insights & Analysis</h2>
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-start">           */}
          <motion.div variants={fadeUp}>
            <MonthlySummary/>
          </motion.div>
        {/* </div> */}
      </motion.div>

      <motion.div className='p-10' initial="hidden" animate="show" variants={fadeUp}>
        <h2 className='font-bold text-3xl mb-4'>My Budgets</h2>
        <BudgetList />
      </motion.div>
    </>
  );
};

export default Budget;
