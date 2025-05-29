import express from 'express';
import mongoose from 'mongoose';
import Income from '../models/IncomeModel.js';
import Account from '../models/AccountModel.js';

const router = express.Router();

router.post('/addincome', async (req, res) => {
  try {
    const {
      name,
      amount,
      category,
      date,
      accountId,
      accountName,
      recurring, 
      recurringPeriod,
      createdBy,      
    } = req.body;

    if (!name || !amount || !category || !accountId || !accountName || !createdBy) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    if (recurring && !recurringPeriod) {
      return res.status(400).json({ message: 'Recurring period must be provided for recurring incomes.' });
    }

    const income = new Income({
      name,
      amount,
      category,
      date,
      accountId,
      accountName,
      recurring,
      recurringPeriod,
      createdBy,
      type:"income",
    });

    await income.save();

    // Update account balance
    const account = await Account.findById(accountId);

    if (!account) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    account.balance += amount;
    await account.save();

    res.status(201).json({ message: "Income added and account updated successfully", income });
  } catch (error) {
    console.error("Error adding income:", error);
    res.status(500).json({ error: "Server error while adding income" });
  }
});

router.get('/getincome/:createdBy', async (req, res) => {
  try {
    const { createdBy } = req.params;

    const incomes = await Income.find({ createdBy }).sort({ date: -1 }); // Most recent first

    res.status(200).json(incomes);
  } catch (error) {
    console.error("Error fetching incomes:", error);
    res.status(500).json({ error: "Server error while fetching incomes" });
  }
});

router.get('/getincome/account/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;

    const incomes = await Income.find({ accountId }).sort({ date: -1 });

    res.status(200).json(incomes);
  } catch (error) {
    console.error("Error fetching incomes for account:", error);
    res.status(500).json({ error: "Server error while fetching incomes for account" });
  }
});

router.put('/updateincome/:incomeId', async (req, res) => {
  try {
    const { incomeId } = req.params;
    const updatedData = req.body;

    const existingIncome = await Income.findById(incomeId);
    if (!existingIncome) {
      return res.status(404).json({ message: 'Income not found.' });
    }

    const oldAmount = existingIncome.amount;
    const oldAccountId = existingIncome.accountId;
    const newAmount = Number(updatedData.amount);
    const newAccountId = updatedData.accountId;

    if (!newAmount || !newAccountId) {
      return res.status(400).json({ message: 'New amount and accountId must be provided.' });
    }

    // If account is changed
    if (oldAccountId !== newAccountId) {
      const oldAccount = await Account.findById(oldAccountId);
      const newAccount = await Account.findById(newAccountId);

      if (!oldAccount || !newAccount) {
        return res.status(404).json({ message: 'One or both accounts not found.' });
      }

      // Reverse income from old account
      oldAccount.balance -= oldAmount;
      await oldAccount.save();

      // Add income to new account
      newAccount.balance += newAmount;
      await newAccount.save();
    } else {
      // Same account — just update the balance difference
      const account = await Account.findById(oldAccountId);
      if (!account) return res.status(404).json({ message: 'Account not found.' });

      const diff = newAmount - oldAmount;
      account.balance += diff;
      await account.save();
    }

    // Update income entry
    Object.assign(existingIncome, updatedData);
    await existingIncome.save();

    res.status(200).json({ message: 'Income updated successfully', income: existingIncome });
  } catch (error) {
    console.error("Error updating income:", error);
    res.status(500).json({ error: "Server error while updating income" });
  }
});

router.delete('/deleteincome/:incomeId', async (req, res) => {
  try {
    const { incomeId } = req.params;

    const income = await Income.findById(incomeId);
    if (!income) {
      return res.status(404).json({ message: 'Income not found.' });
    }

    const account = await Account.findById(income.accountId);
    if (!account) {
      return res.status(404).json({ message: 'Associated account not found.' });
    }

    // Subtract income from account balance
    account.balance -= income.amount;
    await account.save();

    await income.deleteOne();

    res.status(200).json({ message: 'Income deleted and account updated.' });
  } catch (error) {
    console.error("Error deleting income:", error);
    res.status(500).json({ error: "Server error while deleting income" });
  }
});


export default router;
