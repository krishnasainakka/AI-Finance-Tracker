import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const router = express.Router();

// Initialize Gemini with correct class
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/monthly-summary", async (req, res) => {
  const { transactions } = req.body;

  if (!transactions || !Array.isArray(transactions)) {
    return res.status(400).json({ error: "Invalid or missing transactions array" });
  }

  const prompt = `
  You are a smart financial assistant. Based on the transaction data below, generate a detailed monthly financial summary in JSON format.

  Transaction data:
  ${transactions.map(tx => `${tx.date}: ${tx.type} - ₹${tx.amount} for ${tx.category}`).join("\n")}

  ### Output Requirements:
  Return **only the JSON** object with the following keys and structures. Do not include any extra text, explanation, or formatting.

  1. "incomes": Array of income transactions.
    - Each item must include: 
      - "category" (string)
      - "amount" (number)
      - "date" (string, format YYYY-MM-DD)

  2. "latestExpenses ": Array of the top 5 largest expense, sorted by amount (highest first).
    - Each item must include:
      - "type" (string): "expense"
      - "category" (string)
      - "amount" (number)
      - "date" (string, format YYYY-MM-DD)

  3. "summary":
    - "totalIncome" (number): Sum of all income amounts
    - "totalExpenses" (number): Sum of all expense amounts
    - "netSavings" (number): totalIncome minus totalExpenses
    - "savingsRatePercent" (number): (netSavings / totalIncome) * 100
    - "budgetExceededCategories" (array of strings): Categories where spending is unusually high or exceeds typical budget limits

  4. "spendingPatterns":
    - "topCategories": Array of top 3 expense categories, each with:
      - "category" (string)
      - "totalSpent" (number)
      - "percentage" (number): Percent of total expenses
    - "averageDailyExpense" (number): Average daily expense amount for the month
    - "peakSpendingDay" (string, format YYYY-MM-DD): Date with highest total expenses
    - "recurringExpenses": Array of recurring expenses, each with:
      - "category" (string)
      - "amount" (number)
      - "frequency" (string): e.g., "monthly", "weekly", or approximate

  5. "suggestions": Array of 3 to 5 concise, personalized suggestions or observations based on the analysis. These should help improve financial habits, warn about overspending, or appreciate positive behavior.

  ⚠️ Important: Return **only the JSON**, no extra text, explanation, or formatting.
  `;



  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // console.log(text)

    if (!text) {
      return res.status(500).json({ error: "No summary generated" });
    }

    res.json({ summary: text });
  } catch (error) {
    console.error("Gemini SDK Error:", error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

export default router;
