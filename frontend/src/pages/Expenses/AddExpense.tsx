import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface AddExpenseProps {
  budgetId: string;
  userId: string;
  refreshData: () => void;
}

type Account = {
  _id: string;
  accountName: string;
  balance: number;
  createdBy: string;
  createdAt?: string;
};

type Budget = {
  _id: string;
  budgetname: string;
  amount: number;
  totalSpent: number;
  expenseCount: number;
  icon: string;
  createdBy: string;
};

const AddExpense: React.FC<AddExpenseProps> = ({ budgetId, userId, refreshData }) => {
  const [name, setName] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  // const [category, setCategory] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(new Date);
  const [accountId, setAccountId] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringPeriod, setRecurringPeriod] = useState<string>("");

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) {
          // console.log("No userId");
          return;
        }
        const accRes = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/account/getaccount/${userId}`);
        const accData: Account[] = await accRes.json();
        setAccounts(accData);
        // console.log("Accounts fetched:", accData);

        const budgetRes = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/budget/getBudgets/${userId}`);
        const budgetData: Budget[] = await budgetRes.json();
        setBudgets(budgetData);
        // console.log("Budgets fetched:", budgetData);        
      } 
      catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [userId]);       

  const addNewExpense = async () => {
    try {
      const selectedBudget = budgets.find((b) => b._id === budgetId);
      const computedCategory = selectedBudget?.budgetname || "";

      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/expense/addexpense`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          amount: Number(amount),
          budgetId,
          category: computedCategory,
          accountId,
          accountName,
          date: date?.toISOString(),
          isRecurring,
          recurringPeriod: isRecurring ? recurringPeriod : null,
          createdBy: userId,
        }),
      });

      if (response.ok) {
        refreshData();
        toast("New Expense Added!");
        setName("");
        setAmount("");
        // setCategory("");
        setAccountId("");
        setAccountName("");
        setDate(undefined);
        setIsRecurring(false);
        setRecurringPeriod("");
      } else {
        const errorData = await response.json();
        alert(`Error creating expense: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      alert("Failed to create expense. Please try again.");
      console.error(error);
    }
  };

  return (
  <div className="border p-5 rounded-lg w-full max-w-xl mx-auto">
    <h2 className="font-bold text-lg">Add Expense</h2>

    <div className="mt-2">
      <h2 className="text-black font-medium my-1">Expense Name</h2>
      <Input
        value={name}
        placeholder="e.g. Home Decor"
        onChange={(e) => setName(e.target.value)}
        className="w-full"
      />
    </div>

    <div className="mt-2">
      <h2 className="text-black font-medium my-1">Expense Amount</h2>
      <Input
        value={amount}
        placeholder="e.g. Rs. 5000"
        onChange={(e) => setAmount(e.target.value)}
        className="w-full"
      />
    </div>

    {/* Category and Account Dropdowns Side by Side on large, stacked on mobile */}
    <div className="flex flex-col md:flex-row gap-4 mt-4">
      <div className="flex-1">
        <Label className="text-black font-medium mb-1 block">Category</Label>
        <Select value={budgetId} onValueChange={() => {}} disabled>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Category">
              {
                budgets.find((budget) => budget._id === budgetId)?.budgetname || "Loading..."
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {budgets.map((budget) => (
              <SelectItem key={budget._id} value={budget._id}>
                {budget.budgetname}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Label className="text-black font-medium mb-1 block">Account</Label>
        <Select
          value={accountId}
          onValueChange={(value) => {
            const selectedAccount = accounts.find((acc) => acc._id === value);
            if (selectedAccount) {
              setAccountId(selectedAccount._id);
              setAccountName(selectedAccount.accountName);
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((acc) => (
              <SelectItem key={acc._id} value={acc._id}>
                {acc.accountName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    {/* Date Picker */}
    <div className="mt-4 relative">
      <label className="text-black font-medium mb-1 block">Date</label>
      <input
        type="text"
        readOnly
        value={date ? format(date, "PPP") : ""}
        onClick={() => setShowPicker((prev) => !prev)}
        placeholder="Pick a date"
        className="w-full border border-gray-300 rounded-md py-2 px-3 text-left font-normal cursor-pointer"
      />
      {showPicker && (
        <div className="absolute z-50 bg-white shadow-lg mt-2 rounded-md">
          <DayPicker
            mode="single"
            selected={date}
            onSelect={(selected) => {
              setDate(selected);
              setShowPicker(false);
            }}
          />
        </div>
      )}
    </div>

    {/* Recurring Switch */}
    <div className="flex items-center justify-between mt-4">
      <Label className="text-black font-medium">Recurring Expense</Label>
      <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
    </div>

    {/* Recurring Period */}
    {isRecurring && (
      <div className="mt-4">
        <Label className="text-black font-medium mb-1 block">Recurring Period</Label>
        <Select value={recurringPeriod} onValueChange={setRecurringPeriod}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )}

    {/* Submit Button */}
    <Button
      onClick={addNewExpense}
      disabled={!name || !amount || !date || !accountId}
      className="mt-3 w-full"
      variant="customBlue"
    >
      Add New Expense
    </Button>
  </div>
);

};

export default AddExpense;
