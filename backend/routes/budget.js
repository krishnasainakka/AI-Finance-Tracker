import express from 'express';
import Budget from '../models/BudgetModel.js';
import Expense from '../models/ExpenseModel.js';
import mongoose from 'mongoose';

const router = express.Router();

// Create a new budget
router.post('/addBudget', async (req, res) => {
  try {
    const { budgetname, amount, icon, createdBy } = req.body;

    if (!budgetname || amount == null || !icon || !createdBy) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (amount < 0) {
      return res.status(400).json({ message: 'Amount must be non-negative.' });
    }

    // Create new budget with amountSpent and numberOfExpenses defaulting to 0
    const newBudget = new Budget({
      budgetname,
      amount,
      icon,
      createdBy,
      toalSpent: 0,
      expenseCount: 0
    });

    await newBudget.save();
    res.status(201).json({ message: 'Budget created successfully', budget: newBudget });
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all budgets of specific user
router.get('/getBudgets/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const budgets = await Budget.find({ createdBy: userId }).sort({ createdAt: -1 });

    res.status(200).json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a budget
router.put('/updateBudget/:userId/:budgetId', async (req, res) => {
  const { userId, budgetId } = req.params;
  const { budgetname, amount, icon } = req.body;

  try {
    if (!budgetname || amount == null || !icon) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    if (amount < 0) {
      return res.status(400).json({ message: 'Amount must be non-negative.' });
    }

    const updatedBudget = await Budget.findOneAndUpdate(
      { _id: budgetId, createdBy: userId },
      {
        budgetname,
        amount,
        icon,
      },
      { new: true }
    );

    if (!updatedBudget) {
      return res.status(404).json({ message: 'Budget not found or unauthorized.' });
    }

    res.status(200).json(updatedBudget);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a specific Budget and Related Expenses
router.delete('/deleteBudget/:userId/:budgetId', async (req, res) => {
  const { userId, budgetId } = req.params;

  try {
    // Check if the budget exists and belongs to the user
    const budget = await Budget.findOne({ _id: budgetId, createdBy: userId });
    if (!budget) {
      return res.status(404).json({ message: "Budget not found or unauthorized access" });
    }

    // Delete all associated expenses
    await Expense.deleteMany({ budgetId });

    // Delete the budget
    await Budget.deleteOne({ _id: budgetId });

    res.status(200).json({ message: "Budget and associated expenses deleted successfully" });
  } catch (error) {
    console.error("Error deleting budget:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get('/budgetSummary/:userId', async (req, res) => {
  const { userId } = req.params;

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  try {
    const summary = await Budget.aggregate([
      { $match: { createdBy: userId } },
      {
        $lookup: {
          from: 'expenses',
          let: { budgetId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$budgetId', '$$budgetId'] },
                date: { $gte: firstDay, $lte: lastDay }
              }
            }
          ],
          as: 'expensesThisMonth'
        }
      },
      {
        $addFields: {
          totalSpentThisMonth: { $sum: '$expensesThisMonth.amount' },
          expenseCountThisMonth: { $size: '$expensesThisMonth' }
        }
      },
      {
        $project: {
          _id: 1,
          budgetname: 1,
          amount: 1,
          icon: 1,
          createdBy: 1,
          totalSpentThisMonth: 1,
          expenseCountThisMonth: 1,
          expensesThisMonth: 1
        }
      }
    ]);

    res.status(200).json(summary);
  } catch (error) {
    console.error("Error fetching budgets summary:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Get a budget summary(totalSpent and count including budgets) for a specific budget and user
router.get('/budgetSummary/:userId/:budgetId', async (req, res) => {
  const { userId, budgetId } = req.params;

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  try {
    const summary = await Budget.aggregate([
      {
        $match: {
          createdBy: userId,
          _id: new mongoose.Types.ObjectId(budgetId)
        }
      },
      {
        $lookup: {
          from: 'expenses',
          let: { budgetId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$budgetId', '$$budgetId'] },
                date: { $gte: firstDay, $lte: lastDay }
              }
            }
          ],
          as: 'expensesThisMonth'
        }
      },
      {
        $addFields: {
          totalSpentThisMonth: { $sum: '$expensesThisMonth.amount' },
          expenseCountThisMonth: { $size: '$expensesThisMonth' }
        }
      },
      {
        $project: {
          _id: 1,
          budgetname: 1,
          amount: 1,
          icon: 1,
          createdBy: 1,
          totalSpentThisMonth: 1,
          expenseCountThisMonth: 1,
          expensesThisMonth: 1
        }
      }
    ]);

    if (summary.length === 0) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.status(200).json(summary[0]); // Return only one object
  } catch (error) {
    console.error("Error fetching specific budget summary:", error);
    res.status(500).json({ message: "Server error" });
  }
});



export default router