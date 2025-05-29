import express from 'express';

import Budget from "../models/BudgetModel.js";
import Expense from "../models/ExpenseModel.js";

const router = express.Router();

router.get("/summary/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch all budgets created by the user
    const budgets = await Budget.aggregate([
      { $match: { createdBy: userId } },
      {
        $lookup: {
          from: "expenses", // name of the collection
          localField: "_id",
          foreignField: "budgetId",
          as: "expenses"
        }
      },
      {
        $addFields: {
          totalSpent: { $sum: "$expenses.amount" },
          expenseCount: { $size: "$expenses" }
        }
      }
    ]);

    res.status(200).json(budgets);
  } catch (error) {
    console.error("Error getting budget summaries:", error);
    res.status(500).json({ error: "Server error" });
  }
});
