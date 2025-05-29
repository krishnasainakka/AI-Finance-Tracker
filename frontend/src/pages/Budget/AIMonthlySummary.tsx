import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import BudgetContext from "@/context/BudgetContext";
import html2pdf from "html2pdf.js";
import html2canvas from "html2canvas";

type Transaction = {
  category?: string;
  amount: number;
  date: string;
  type?: string;
};

type Summary = {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRatePercent: number;
  budgetExceededCategories: string[];
};

type SpendingCategory = {
  category: string;
  totalSpent: number;
  percentage: number;
};

type RecurringExpense = {
  category: string;
  amount: number;
  frequency: string;
};

type SpendingPatterns = {
  topCategories: SpendingCategory[];
  averageDailyExpense: number;
  peakSpendingDay: string;
  recurringExpenses: RecurringExpense[];
};

type FinancialSummary = {
  incomes: Transaction[];
  topTransactions: Transaction[];
  summary: Summary;
  spendingPatterns: SpendingPatterns;
  suggestions: string[];
};

const MonthlySummary = () => {
  const [loading, setLoading] = useState(false);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);  

  const ctx = useContext(BudgetContext);
  if (!ctx) return <div>Loading...</div>;

  const { getCurrentMonthTransactions } = ctx;

  const handleDownloadPDF = () => {
    const element = document.getElementById("summary-content");
    if (!element) return;
    html2pdf().from(element).save("Monthly_Summary.pdf");
  };

  const handleTakeSnapshot = async () => {
    console.log("snap shot")
    const element = document.getElementById("summary-content");
    if (!element) return;

    const canvas = await html2canvas(element);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "Monthly_Summary_Snapshot.png";
    link.click();
  };


  const generateSummary = async () => {
    setLoading(true);
    try {
      const monthTransactions = await getCurrentMonthTransactions();

      const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/ai/monthly-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: monthTransactions }),
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const jsonResponse = await res.json();
      console.log("API raw response:", jsonResponse);

      // The summary key contains a stringified JSON wrapped in triple backticks,
      // clean and parse it properly:
      let parsedData: FinancialSummary;

      if (typeof jsonResponse.summary === "string") {
        // Clean triple backticks and possible "json" tag from string
        const cleanedString = jsonResponse.summary
          .replace(/```json/, "")
          .replace(/```/, "")
          .trim();

        parsedData = JSON.parse(cleanedString);
      } else {
        // fallback if API returns direct object
        parsedData = jsonResponse.financialSummary || jsonResponse;
      }

      setFinancialSummary(parsedData);
    } catch (error) {
      console.error("Error:", error);
      setFinancialSummary(null);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 mt-6 rounded-2xl border shadow bg-white space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">AI Monthly Financial Summary - {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant={"customBlue"} onClick={generateSummary} disabled={loading}>
            {loading ? "Generating..." : "Generate Summary"}
          </Button>
          {/* {financialSummary && (
            <>
              <Button variant="customBlue" onClick={handleDownloadPDF}>Download PDF</Button>
              <Button variant="customBlue" onClick={handleTakeSnapshot}>Take Snapshot</Button>
            </>
          )} */}
        </div>
      </div>

      {financialSummary ? (
        <div id="summary-content" className="space-y-8">
          {/* Summary Overview */}
          <section>
            <h3 className="text-xl font-semibold text-blue-700 mb-4">Summary Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-gray-800">
              <div className="bg-blue-50 p-4 rounded-lg shadow">
                <p className="text-sm font-medium">Total Income</p>
                <p className="text-lg font-bold">₹{financialSummary.summary.totalIncome.toLocaleString()}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg shadow">
                <p className="text-sm font-medium">Total Expenses</p>
                <p className="text-lg font-bold">₹{financialSummary.summary.totalExpenses.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg shadow">
                <p className="text-sm font-medium">Net Savings</p>
                <p className="text-lg font-bold">₹{financialSummary.summary.netSavings.toLocaleString()}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg shadow">
                <p className="text-sm font-medium">Savings Rate</p>
                <p className="text-lg font-bold">{financialSummary.summary.savingsRatePercent.toFixed(1)}%</p>
              </div>
            </div>
            {financialSummary.summary.budgetExceededCategories.length > 0 && (
              <p className="mt-3 text-sm text-red-600">
                ⚠️ Overspending in categories:{" "}
                <strong>{financialSummary.summary.budgetExceededCategories.join(", ")}</strong>
              </p>
            )}
          </section>

          {/* Incomes */}
          <section>
            <h3 className="text-xl font-semibold text-blue-700 mb-4">Incomes</h3>
            <table className="w-full text-left border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-blue-100">
                <tr>
                  <th className="p-3 border-b border-gray-300">Source</th>
                  <th className="p-3 border-b border-gray-300">Amount (₹)</th>
                  <th className="p-3 border-b border-gray-300">Date</th>
                </tr>
              </thead>
              <tbody>
                {financialSummary.incomes.map((inc, idx) => (
                  <tr key={idx} className="odd:bg-white even:bg-blue-50">
                    <td className="p-3 border-b border-gray-200">{inc.category || "-"}</td>
                    <td className="p-3 border-b border-gray-200">{inc.amount.toLocaleString()}</td>
                    <td className="p-3 border-b border-gray-200">{inc.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Top Transactions */}
          <section>
            <h3 className="text-xl font-semibold text-blue-700 mb-4">Top Transactions</h3>
            <table className="w-full text-left border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-yellow-100">
                <tr>
                  <th className="p-3 border-b border-gray-300">Type</th>
                  <th className="p-3 border-b border-gray-300">Category</th>
                  <th className="p-3 border-b border-gray-300">Amount (₹)</th>
                  <th className="p-3 border-b border-gray-300">Date</th>
                </tr>
              </thead>
              <tbody>
                {financialSummary.topTransactions.map((tx, idx) => (
                  <tr key={idx} className="odd:bg-white even:bg-yellow-50">
                    <td className="p-3 border-b border-gray-200 capitalize">{tx.type}</td>
                    <td className="p-3 border-b border-gray-200">{tx.category || "-"}</td>
                    <td className="p-3 border-b border-gray-200">{tx.amount.toLocaleString()}</td>
                    <td className="p-3 border-b border-gray-200">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Spending Patterns */}
          <section>
            <h3 className="text-xl font-semibold text-blue-700 mb-4">Spending Patterns</h3>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Top Expense Categories</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {financialSummary.spendingPatterns.topCategories.map((cat, i) => (
                  <li key={i}>
                    <strong>{cat.category}</strong>: ₹{cat.totalSpent.toLocaleString()} ({cat.percentage.toFixed(1)}%)
                  </li>
                ))}
              </ul>
            </div>

            <p>
              <strong>Average Daily Expense:</strong> ₹{financialSummary.spendingPatterns.averageDailyExpense.toFixed(2)}
            </p>
            <p>
              <strong>Peak Spending Day:</strong> {financialSummary.spendingPatterns.peakSpendingDay}
            </p>

            {financialSummary.spendingPatterns.recurringExpenses.length > 0 && (
              <div className="mt-3">
                <h4 className="font-semibold mb-2">Recurring Expenses</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {financialSummary.spendingPatterns.recurringExpenses.map((rec, i) => (
                    <li key={i}>
                      <strong>{rec.category}</strong>: ₹{rec.amount.toLocaleString()} ({rec.frequency})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Suggestions */}
          <section>
            <h3 className="text-xl font-semibold text-blue-700 mb-4">Suggestions</h3>
            <ul className="list-disc list-inside text-green-700 space-y-2">
              {financialSummary.suggestions.map((sugg, i) => (
                <li key={i} className="italic">
                  {sugg}
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : (
        !loading && <p className="text-center text-gray-500">Click "Generate Summary" to see your financial overview.</p>
      )}
    </div>
  );
};

export default MonthlySummary;
