import express from 'express';
import Income from '../models/IncomeModel.js';
import Expense from '../models/ExpenseModel.js';

const router = express.Router();

router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [incomes, expenses] = await Promise.all([
      Income.find({ createdBy: userId }),
      Expense.find({ createdBy: userId })
    ]);

    res.status(200).json({
      message: 'Transactions fetched successfully',
      incomes,
      expenses
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Server error while fetching transactions' });
  }
});

router.get('/user/:userId/current-month-transactions', async (req, res) => {
  const { userId } = req.params;

  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [incomes, expenses] = await Promise.all([
      Income.find({
        createdBy: userId,
        date: { $gte: firstDay, $lte: lastDay },
      }),
      Expense.find({
        createdBy: userId,
        date: { $gte: firstDay, $lte: lastDay },
      }),
    ]);

    // Format transactions
    const incomeTx = incomes.map((i) => ({
      amount: i.amount,
      category: i.category,
      date: i.date.toISOString().split("T")[0],
      type: "Income",
    }));

    const expenseTx = expenses.map((e) => ({
      amount: e.amount,
      category: e.category,
      date: e.date.toISOString().split("T")[0],
      type: "Expense",
    }));

    const transactions = [...incomeTx, ...expenseTx];

    res.status(200).json({
      message: "Current month transactions fetched successfully",
      transactions,
    });
  } catch (error) {
    console.error("Error fetching monthly transactions:", error);
    res.status(500).json({ error: "Server error while fetching transactions" });
  }
});

router.get('/account/:accountId', async (req, res) => {
  const { accountId } = req.params;

  try {
    const [incomes, expenses] = await Promise.all([
      Income.find({ accountId }),
      Expense.find({ accountId })
    ]);

    res.status(200).json({
      message: 'Transactions for account fetched successfully',
      incomes,
      expenses
    });
  } catch (error) {
    console.error('Error fetching account transactions:', error);
    res.status(500).json({ error: 'Server error while fetching account transactions' });
  }
});

export default router;
