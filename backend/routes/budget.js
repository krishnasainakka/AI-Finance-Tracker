import express from 'express';
import Budget from '../models/BudgetModel.js';
import Expense from '../models/ExpenseModel.js';
import mongoose from 'mongoose';

const router = express.Router();


const ensureOthersBudget = async (userId) => {
  const othersExists = await Budget.findOne({
    createdBy: userId,
    budgetname: 'Others',
    isDefault: true
  });

  if (!othersExists) {
    const othersBudget = new Budget({
      budgetname: "Others",
      amount: 0,
      icon: "🗂️", // or another default icon
      createdBy: userId,
      totalSpent: 0,
      expenseCount: 0,
      isDefault: true,
    });

    await othersBudget.save();
    console.log('✅ Others budget created for user:', userId);
  }
};

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

    // 🚫 Prevent duplicate budget names for the same user
    const existingBudget = await Budget.findOne({
      createdBy,
      budgetname: { $regex: new RegExp(`^${budgetname}$`, 'i') }  // case-insensitive match
    });

    if (existingBudget) {
      return res.status(409).json({ message: 'A budget with this name already exists.' });
    }

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

    // Ensure 'Others' budget exists before fetching budgets
    await ensureOthersBudget(userId);

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
    if (amount == null) {
      return res.status(400).json({ message: 'Amount is required.' });
    }

    if (amount < 0) {
      return res.status(400).json({ message: 'Amount must be non-negative.' });
    }

    const budget = await Budget.findOne({ _id: budgetId, createdBy: userId });
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found or unauthorized.' });
    }

    if (budget.isDefault || budget.budgetname.trim().toLowerCase() === 'others') {
      // Only allow amount update for 'Others' budget
      if (
        budgetname &&
        budgetname.trim().toLowerCase() !== budget.budgetname.trim().toLowerCase()
      ) {
        return res.status(403).json({ message: "You cannot modify the name of the 'Others' budget." });
      }

      if (
        icon &&
        icon.trim().toLowerCase() !== budget.icon.trim().toLowerCase()
      ) {
        return res.status(403).json({ message: "You cannot modify the icon of the 'Others' budget." });
      }

      budget.amount = amount;
      await budget.save();
      return res.status(200).json(budget);
    } else {
      // Allow full update for other budgets
      if (!budgetname || !icon) {
        return res.status(400).json({ message: 'budgetname and icon are required for this budget.' });
      }

      // Check for duplicates
      const duplicate = await Budget.findOne({
        _id: { $ne: budgetId },
        createdBy: userId,
        budgetname: { $regex: new RegExp(`^${budgetname.trim()}$`, 'i') },
      });

      if (duplicate) {
        return res.status(409).json({ message: 'A budget with this name already exists.' });
      }

      budget.budgetname = budgetname.trim();
      budget.amount = amount;
      budget.icon = icon;
      await budget.save();

      return res.status(200).json(budget);
    }
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

    // Prevent deletion of the 'Others' budget
    if (budget.isDefault) {
      return res.status(403).json({ message: "You cannot delete the 'Others' budget." });
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
    // Ensure 'Others' budget exists before fetching budgets
    // console.log("Checking for Others...");

    await ensureOthersBudget(userId);
    // console.log("Check complete. Fetching summary...");


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
    // Ensure 'Others' budget exists before fetching budgets
    await ensureOthersBudget(userId);

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