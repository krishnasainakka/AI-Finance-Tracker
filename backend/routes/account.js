import express from "express";
import Account from "../models/AccountModel.js";
import Expense from "../models/ExpenseModel.js";
import Income from "../models/IncomeModel.js";
import Budget from "../models/BudgetModel.js";

const router = express.Router();

// Create account
router.post("/addaccount", async (req, res) => {
  try {
    const { accountName, balance, createdBy } = req.body;
    if(!accountName || ! balance){
        return res.status(400).json({message: "All fields are required!"});
    }
    const account = new Account({ accountName, balance, createdBy });
    await account.save();
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all accounts for a user
router.get("/getaccount/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId ) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const accounts = await Account.find({ createdBy: userId });
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update account (name or balance)
router.put("/updateaccount/:id", async (req, res) => {
  try {
    const account = await Account.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!account) return res.status(404).json({ message: "Account not found" });
    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete account (and cascade delete incomes and expenses)
router.delete("/deleteaccount/:id", async (req, res) => {
  try {
    const accountId = req.params.id;

    // Step 1: Find related expenses
    const relatedExpenses = await Expense.find({ accountId });

    // Step 2: Group expenses by budgetId for batch updates
    const budgetUpdates = new Map();

    for (const expense of relatedExpenses) {
      const { budgetId, amount } = expense;

      if (!budgetUpdates.has(budgetId)) {
        budgetUpdates.set(budgetId, { totalSpent: 0, expenseCount: 0 });
      }

      const current = budgetUpdates.get(budgetId);
      current.totalSpent += amount;
      current.expenseCount += 1;
    }

    // Step 3: Apply the budget updates
    for (const [budgetId, { totalSpent, expenseCount }] of budgetUpdates.entries()) {
      await Budget.findByIdAndUpdate(
        budgetId,
        {
          $inc: {
            totalSpent: -totalSpent,
            expenseCount: -expenseCount,
          },
        },
        { new: true }
      );
    }

    // Step 4: Delete related transactions
    await Expense.deleteMany({ accountId });
    await Income.deleteMany({ accountId });

    // Step 5: Delete the account
    const deletedAccount = await Account.findByIdAndDelete(accountId);
    if (!deletedAccount) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json({ message: "Account and related data deleted successfully." });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
