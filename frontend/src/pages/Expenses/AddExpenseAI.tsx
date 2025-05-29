import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { format } from "date-fns";

import { Upload } from "lucide-react"; // Optional: Icon for upload button


interface AddExpenseProps {
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

const AddExpenseAI: React.FC<AddExpenseProps> = ({ userId, refreshData }) => {
  const [name, setName] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [budgetId, setBudgetId] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>();
  const [accountId, setAccountId] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringPeriod, setRecurringPeriod] = useState<string>("");

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

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

  // Inside your component, add this function to handle receipt upload
  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file && file.size > 5 * 1024 * 1024) {
      alert("File size should not exceed 5MB");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("budgets", JSON.stringify(budgets)); // send budgets here as string

    try {
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/expense/scan-receipt`, {
        method: "POST",
        headers: {
            "user-id": userId, // keep userId in headers
            // DO NOT set 'Content-Type' here for FormData; browser will set multipart boundary automatically
        },
        body: formData,
        });

        const data = await response.json();

        if (response.ok) {
        setName(data.name || "");
        setAmount(data.amount?.toString() || "");
        setDate(data.date ? new Date(data.date) : undefined);

        const matchedBudget = budgets.find(
          (b) => b.budgetname.toLowerCase() === data.category?.toLowerCase()
        );
        if (matchedBudget) {
          setBudgetId(matchedBudget._id);      
          setCategory(matchedBudget.budgetname); // optional
        }

        toast("Receipt scanned and data extracted!");
        } else {
        toast.error(data.message || "Error parsing receipt.");
        }
    } catch (err) {
        console.error(err);
        toast.error("Failed to scan receipt.");
    }
    };


  const addNewExpense = async () => {
    try {
      const computedCategory = category || "";


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
        setCategory("");
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
  <div className="border p-4 sm:p-6 ml-2 sm:ml-10 rounded-lg max-w-full">
    {/* Upload Receipt */}
    <div className="mt-6">
      <Label className="text-lg font-bold text-gray-800 mb-3 block">
        Upload Receipt
      </Label>
      <div className="relative w-full">
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleScanReceipt}
          className="block w-full cursor-pointer text-sm text-white 
            file:mr-4 file:py-3 file:px-6
            file:rounded-full file:border-0 
            file:font-semibold 
            file:bg-gradient-to-r file:from-purple-500 file:to-pink-500
            file:text-white hover:file:from-purple-600 hover:file:to-pink-600
            file:transition-all file:duration-300
            bg-gradient-to-r from-gray-100 to-gray-50
            rounded-xl shadow-md ring-1 ring-gray-200"
        />
      </div>
      <p className="text-xs text-gray-500 mt-2 italic">
        Accepted formats: JPG, PNG • Max size: 5MB
      </p>
    </div>

    {/* Add Expense Header */}
    <h2 className="font-bold text-lg mt-6">Add Expense</h2>

    {/* Expense Name */}
    <div className="mt-2">
      <h2 className="text-black font-medium my-1">Expense Name</h2>
      <Input
        className="w-full"
        value={name}
        placeholder="e.g. Home Decor"
        onChange={(e) => setName(e.target.value)}
      />
    </div>

    {/* Expense Amount */}
    <div className="mt-2">
      <h2 className="text-black font-medium my-1">Expense Amount</h2>
      <Input
        className="w-full"
        value={amount}
        placeholder="e.g. Rs. 5000"
        onChange={(e) => setAmount(e.target.value)}
      />
    </div>

    {/* Category and Account Side-by-Side or Stack */}
    <div className="flex flex-col xs:flex-row xs:gap-4 mt-4">
      {/* Category */}
      <div className="flex-1 mb-3 xs:mb-0">
        <Label className="text-black font-medium mb-1 block">Category</Label>
        <Select
          value={budgetId}
          onValueChange={(selectedId) => {
            setBudgetId(selectedId);
            const selectedBudget = budgets.find((budget) => budget._id === selectedId);
            if (selectedBudget) {
              setCategory(selectedBudget.budgetname);
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Category" />
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

      {/* Account */}
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
    <div className="mt-4 relative z-50">
      <Label className="text-black font-medium mb-1 block">Date</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={8}
          className="w-auto p-0 z-[1600]"
          forceMount
        >
          <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
        </PopoverContent>
      </Popover>
    </div>

    {/* Recurring Toggle */}
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

    {/* Add Button */}
    <Button
      onClick={addNewExpense}
      disabled={!name || !amount || !date || !accountId}
      className="mt-4 w-full"
      variant="customBlue"
    >
      Add New Expense
    </Button>
  </div>
);

};

export default AddExpenseAI;
