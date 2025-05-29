import cron from 'node-cron';
import mongoose from 'mongoose';
import Expense from '../models/ExpenseModel.js';
import Budget from '../models/BudgetModel.js';

// Helper: Update budget summary totals
export async function updateBudgetSummary(budgetId) {
  const result = await Expense.aggregate([
    { $match: { budgetId: new mongoose.Types.ObjectId(budgetId) } },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: "$amount" },
        expenseCount: { $sum: 1 }
      }
    }
  ]);

  const { totalSpent = 0, expenseCount = 0 } = result[0] || {};

  await Budget.findByIdAndUpdate(budgetId, {
    totalSpent,
    expenseCount
  });
}

// Helper: Add a recurring expense instance for given recurring expense template
async function createRecurringExpenseInstance(recurringExpense) {
  const today = new Date();

  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfToday.getDate() + 1);

  // Avoid duplicate expense creation for the day
  const existing = await Expense.findOne({
    originalRecurringId: recurringExpense._id,
    date: { $gte: startOfToday, $lt: startOfTomorrow }
  });

  if (existing) {
    return; // Already created today's instance
  }

  const newExpense = new Expense({
    name: recurringExpense.name,
    amount: recurringExpense.amount,
    budgetId: recurringExpense.budgetId,
    category: recurringExpense.category,
    account: recurringExpense.account,
    recurring: false, // instance itself is not recurring
    date: today,
    createdBy: recurringExpense.createdBy,
    originalRecurringId: recurringExpense._id,
  });

  await newExpense.save();

  // Update budget summary after adding new expense instance
  await updateBudgetSummary(recurringExpense.budgetId);
}

// Cron job runs every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log("Running recurring expenses job at", new Date());

  try {
    const recurringExpenses = await Expense.find({ recurring: true });

    for (const recExp of recurringExpenses) {
      const lastInstance = await Expense.findOne({
        originalRecurringId: recExp._id,
        recurring: false,
      }).sort({ date: -1 });

      const now = new Date();
      let shouldCreate = false;

      if (!lastInstance) {
        shouldCreate = true;
      } else {
        const diffDays = Math.floor((now - lastInstance.date) / (1000 * 60 * 60 * 24));

        if (recExp.recurringPeriod === 'daily' && diffDays >= 1) {
          shouldCreate = true;
        } else if (recExp.recurringPeriod === 'weekly' && diffDays >= 7) {
          shouldCreate = true;
        } else if (recExp.recurringPeriod === 'monthly') {
          if (
            now.getFullYear() > lastInstance.date.getFullYear() ||
            now.getMonth() > lastInstance.date.getMonth()
          ) {
            shouldCreate = true;
          }
        } else if (recExp.recurringPeriod === 'yearly') {
          if (
            now.getFullYear() > lastInstance.date.getFullYear() &&
            now.getMonth() === lastInstance.date.getMonth() &&
            now.getDate() === lastInstance.date.getDate()
          ) {
            shouldCreate = true;
          }
        }
      }

      if (shouldCreate) {
        await createRecurringExpenseInstance(recExp);
      }
    }
  } catch (err) {
    console.error("Error running recurring expenses cron job:", err);
  }
});
