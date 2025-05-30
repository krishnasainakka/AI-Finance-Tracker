import cron from 'node-cron';
import mongoose from 'mongoose';
import Expense from '../models/ExpenseModel.js';
import Income from '../models/IncomeModel.js';  // Separate Income model without budgetId
import Budget from '../models/BudgetModel.js';

// Helper: Update budget summary totals for given budgetId (only for expenses)
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

// Create recurring expense instance
async function createRecurringExpenseInstance(recurringExpense) {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfToday.getDate() + 1);

  // Avoid duplicates
  const existing = await Expense.findOne({
    originalRecurringId: recurringExpense._id,
    date: { $gte: startOfToday, $lt: startOfTomorrow }
  });
  if (existing) return;

  const newExpense = new Expense({
    name: recurringExpense.name,
    amount: recurringExpense.amount,
    budgetId: recurringExpense.budgetId,
    category: recurringExpense.category,
    accountId: recurringExpense.accountId,
    accountName: recurringExpense.accountName,
    recurring: false,
    date: today,
    createdBy: recurringExpense.createdBy,
    originalRecurringId: recurringExpense._id,
    type: 'expense',
  });

  await newExpense.save();

  await updateBudgetSummary(recurringExpense.budgetId);
}

// Create recurring income instance
async function createRecurringIncomeInstance(recurringIncome) {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfToday.getDate() + 1);

  // Avoid duplicates
  const existing = await Income.findOne({
    originalRecurringId: recurringIncome._id,
    date: { $gte: startOfToday, $lt: startOfTomorrow }
  });
  if (existing) return;

  const newIncome = new Income({
    name: recurringIncome.name,
    amount: recurringIncome.amount,
    category: recurringIncome.category,
    accountId: recurringIncome.accountId,
    accountName: recurringIncome.accountName,
    recurring: false,
    date: today,
    createdBy: recurringIncome.createdBy,
    originalRecurringId: recurringIncome._id,
    type: 'income',
  });

  await newIncome.save();
}

// Utility: Should create new instance based on period & last date
function shouldCreateNewInstance(recurringPeriod, lastDate) {
  const now = new Date();
  if (!lastDate) return true;

  const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
  
  if (recurringPeriod === 'Daily' && diffDays >= 1) return true;
  if (recurringPeriod === 'Weekly' && diffDays >= 7) return true;
  if (recurringPeriod === 'Monthly') {
    return now.getFullYear() > lastDate.getFullYear() || now.getMonth() > lastDate.getMonth();
  }
  if (recurringPeriod === 'Yearly') {
    return now.getFullYear() > lastDate.getFullYear() &&
           now.getMonth() === lastDate.getMonth() &&
           now.getDate() === lastDate.getDate();
  }

  return false;
}

// Cron job runs every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log("Running recurring transactions job at", new Date());

  try {
    // Process recurring expenses
    const recurringExpenses = await Expense.find({ recurring: true, type: 'expense' });
    console.log(`Found ${recurringExpenses.length} recurring expenses`);

    for (const recExp of recurringExpenses) {
      const lastInstance = await Expense.findOne({
        originalRecurringId: recExp._id,
        recurring: false,
      }).sort({ date: -1 });

      if (shouldCreateNewInstance(recExp.recurringPeriod, lastInstance?.date)) {
        await createRecurringExpenseInstance(recExp);
      }
    }

    // Process recurring incomes
    const recurringIncomes = await Income.find({ recurring: true, type: 'income' });
    console.log(`Found ${recurringIncomes.length} recurring incomes`);

    for (const recInc of recurringIncomes) {
      const lastInstance = await Income.findOne({
        originalRecurringId: recInc._id,
        recurring: false,
      }).sort({ date: -1 });

      if (shouldCreateNewInstance(recInc.recurringPeriod, lastInstance?.date)) {
        await createRecurringIncomeInstance(recInc);
      }
    }

  } catch (err) {
    console.error("Error running recurring transactions cron job:", err);
  }
});
