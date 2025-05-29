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

interface AddIncomeProps {
  userId: string;
  incomeTypes: { id: string; name: string }[];
  refreshTransactions: () => void;
}

type Account = {
  _id: string;
  accountName: string;
  balance: number;
  createdBy: string;
  createdAt?: string;
};


const AddIncome: React.FC<AddIncomeProps> = ({ userId, incomeTypes, refreshTransactions }) => {
  const [name, setName] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>();
  const [accountId, setAccountId] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringPeriod, setRecurringPeriod] = useState<string>("");
  const [incomeTypeId, setIncomeTypeId] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);  

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
             } 
      catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [userId]);       

  const addNewIncome = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/income/addincome`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          amount: Number(amount),
          category,
          accountId,
          accountName,
          date: date?.toISOString(),
          isRecurring,
          recurringPeriod: isRecurring ? recurringPeriod : null,
          createdBy: userId,
        }),
      });

      if (response.ok) {
        refreshTransactions();
        toast("New Income Added!");
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
  <div className="border p-5 rounded-lg mx-2 sm:mx-5 md:mx-10 w-full max-w-3xl">
    <h2 className="font-bold text-lg">Add Income</h2>

    <div className="mt-2">
      <h2 className="text-black font-medium my-1">Description</h2>
      <Input
        value={name}
        placeholder="e.g. Salary"
        onChange={(e) => setName(e.target.value)}
      />
    </div>

    <div className="mt-2">
      <h2 className="text-black font-medium my-1">Amount</h2>
      <Input
        value={amount}
        placeholder="e.g. Rs. 50000"
        onChange={(e) => setAmount(e.target.value)}
      />
    </div>

    {/* Category and Account Dropdowns Side by Side on md+, stacked on smaller */}
    <div className="flex flex-col md:flex-row gap-4 mt-4">
      <div className="flex-1">
        <Label className="text-black font-medium mb-1 block">Income Type</Label>
        <Select
          value={incomeTypeId}
          onValueChange={(value) => {
            setIncomeTypeId(value);
            const selectedName = incomeTypes.find((type) => type.id === value)?.name || "";
            setCategory(selectedName);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Income Type">
              {incomeTypes.find((type) => type.id === incomeTypeId)?.name || "Select Income Type"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {incomeTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
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
          <SelectTrigger>
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
    <div className="mt-4">
      <Label className="text-black font-medium mb-1 block">Date</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
        </PopoverContent>
      </Popover>
    </div>

    {/* Recurring Switch */}
    <div className="flex items-center justify-between mt-4">
      <Label className="text-black font-medium">Recurring Income</Label>
      <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
    </div>

    {/* Recurring Period Dropdown */}
    {isRecurring && (
      <div className="mt-4">
        <Label className="text-black font-medium mb-1 block">Recurring Period</Label>
        <Select value={recurringPeriod} onValueChange={setRecurringPeriod}>
          <SelectTrigger>
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

    <Button
      onClick={addNewIncome}
      disabled={!name || !amount || !category || !date || !accountId}
      className="mt-5 w-full"
      variant="customBlue"
    >
      Add New Income
    </Button>
  </div>
);

};

export default AddIncome;
