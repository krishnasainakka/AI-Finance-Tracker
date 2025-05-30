import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Expense from '../models/ExpenseModel.js';
import Budget from '../models/BudgetModel.js';
import Account from '../models/AccountModel.js';

const router = express.Router();
const upload = multer(); // memory storage by default
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// Helper: Update Budget Totals
const updateBudgetSummary = async (budgetId) => {
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
};

// POST: Add Expense
router.post('/addexpense', async (req, res) => {
  try {
    const {
      name,
      amount,
      budgetId,
      category,
      accountId,
      accountName,
      recurring,
      recurringPeriod, 
      date,
      createdBy,
    } = req.body;

    // console.log("backend: ", req.body);

    if (!name || !amount || !budgetId || !category || !accountId || !accountName || !createdBy) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }
    if (recurring && !recurringPeriod) {
      return res.status(400).json({ message: 'Recurring period must be provided for recurring incomes.' });
    }

    const expense = new Expense({
      name,
      amount,
      budgetId,
      category,
      accountId,
      accountName,
      recurring,
      recurringPeriod,
      date,
      createdBy,
      type: 'expense'
    });

    console.log(req.body)
    await expense.save();

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: 'Associated account not found.' });
    }

    account.balance -= Number(amount); // Ensure numeric subtraction
    if (account.balance < 0) {
      return res.status(400).json({ message: 'Insufficient balance in the account.' });
    }

    await account.save();

    await updateBudgetSummary(budgetId);

    res.status(201).json({ message: "Expense added successfully", expense });
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ error: "Server error while adding expense" });
  }
});

// GET: Expenses for a user and budget
router.get('/getexpense/:userId/:budgetId', async (req, res) => {
  const { userId, budgetId } = req.params;

  try {
    if (!userId || !budgetId) {
      return res.status(400).json({ message: 'User ID and Budget ID are required' });
    }

    const expenses = await Expense.find({
      createdBy: userId,
      budgetId,
    }).sort({ date: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/getallexpense/user/:userId', async (req, res) => {
  const { userId} = req.params;

  try {
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const expenses = await Expense.find({
      createdBy: userId,      
    }).sort({ date: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT: Update an expense
router.put('/updateexpense/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name,
    amount,
    category,
    accountId,
    accountName,
    recurring,
    recurringPeriod,
    date,
  } = req.body;

  try {
    const oldExpense = await Expense.findById(id);
    if (!oldExpense) return res.status(404).json({ error: "Expense not found" });

    const oldAmount = oldExpense.amount;
    const oldAccountId = oldExpense.accountId;

    // Case 1: If account changed, refund old and debit new
    if (oldAccountId !== accountId) {
      const oldAccount = await Account.findById(oldAccountId);
      const newAccount = await Account.findById(accountId);

      if (!oldAccount || !newAccount) return res.status(404).json({ error: "Account(s) not found" });

      oldAccount.balance += oldAmount;
      await oldAccount.save();

      newAccount.balance -= amount;
      if (newAccount.balance < 0) return res.status(400).json({ error: "Insufficient balance in new account" });
      await newAccount.save();
    } else {
      // Same account, adjust based on difference
      const account = await Account.findById(accountId);
      if (!account) return res.status(404).json({ error: "Account not found" });

      const diff = amount - oldAmount;
      account.balance -= diff;
      if (account.balance < 0) return res.status(400).json({ error: "Insufficient balance" });
      await account.save();
    }

    const updated = await Expense.findByIdAndUpdate(
      id,
      {
        name,
        amount,
        category,
        accountId,
        accountName,
        recurring,
        recurringPeriod,
        date,
      },
      { new: true }
    );

    await updateBudgetSummary(oldExpense.budgetId);

    res.status(200).json({ message: "Expense updated", updated });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ error: "Server error while updating expense" });
  }
});

// DELETE: Delete an expense
router.delete('/deleteexpense/:expenseId', async (req, res) => {
  const { expenseId } = req.params;

  try {
    if (!expenseId) {
      return res.status(400).json({ message: "Expense ID is required" });
    }

    const expense = await Expense.findByIdAndDelete(expenseId);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Refund to account
    const account = await Account.findById(expense.accountId);
    if (account) {
      account.balance += expense.amount;
      await account.save();
    }

    await updateBudgetSummary(expense.budgetId);

    res.status(200).json({ message: "Expense deleted successfully", deletedExpense: expense });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/scan-receipt", upload.single("file"), async (req, res) => {
  try {
    const userId = req.headers["user-id"];
    if (!userId) {
      return res.status(400).json({ error: "User ID is required in headers" });
    }

    // Parse budgets from req.body
    let budgets = [];
    if (req.body.budgets) {
      try {
        budgets = JSON.parse(req.body.budgets);
      } catch (e) {
        return res.status(400).json({ error: "Invalid budgets format" });
      }
    } else {
      return res.status(400).json({ error: "Budgets are required" });
    }

    const userCategories = budgets.map(b => b.budgetname).join(",");
    // console.log("User categories from frontend budgets:", userCategories);

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const base64String = Buffer.from(file.buffer).toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief and short summary)
      - Merchant/store name
      - Suggested category (choose one of: ${userCategories})

      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If it's not a receipt, return an empty object
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.mimetype,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    console.log("cleaned Text: ", cleanedText)

    try {
      const data = JSON.parse(cleanedText);

      if (Object.keys(data).length === 0) {
        return res.status(200).json({ message: "Not a valid receipt", data: {} });
      }

      return res.status(200).json({
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        name: data.description,
        merchantName: data.merchantName,
        category: data.category,
      });
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return res.status(500).json({ error: "Invalid response format from Gemini" });
    }
  } catch (error) {
    console.error("Error scanning receipt:", error);
    res.status(500).json({ error: "Failed to scan receipt" });
  }
});


export default router;
