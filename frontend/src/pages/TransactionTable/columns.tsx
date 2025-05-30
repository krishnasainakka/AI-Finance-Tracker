import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react"; // for sorting icon
import { Button } from "@/components/ui/button"; // from shadcn/ui
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
// import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react"; 

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';


export type Transaction = {
  _id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  accountName: string;
  recurring: boolean;
  recurringPeriod?: "Daily" | "Weekly" | "Monthly" | "Yearly"; 
  createdBy: string;  
  type: "income" | "expense";
};

type IncomeItem = {
  _id: string;
  name: string;
  amount: number;
  category: string;
  accountName: string; 
  recurring: boolean;
  recurringPeriod?: "Daily" | "Weekly" | "Monthly" | "Yearly"; 
  createdBy: string;
  createdAt?: string;
};

interface Expense {
  _id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  accountName: string;
  recurring: boolean;
  recurringPeriod?: "Daily" | "Weekly" | "Monthly" | "Yearly"; 
  createdBy: string;
}

export const getColumns = (refreshData: () => void): ColumnDef<Transaction>[] => [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const rawDate = row.getValue("date") as string;
      const formattedDate = new Date(rawDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return <div>{formattedDate}</div>;
    },
  },
  {
    accessorKey: "accountName",
    header: "Account"
  },
  {
    accessorKey: "name",
    header: "Description"
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const value = row.getValue("category") as string;
      return (
        <div className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800 capitalize">
          {value}
        </div>
      );
    },
  },

  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const type = row.original.type;

      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
      }).format(amount);

      const isIncome = type === "income";

      return (
        <div className={`font-medium flex items-center gap-1 ${isIncome ? "text-green-600" : "text-red-600"}`}>
          {isIncome ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
          {formatted}
        </div>
      );
    },
  },  
  
  {
    accessorKey: "recurring",
    header: "Recurring",
    cell: ({ row }) => {
      const isRecurring = row.getValue("recurring");
      const period = row.original.recurringPeriod;

      return (
        <div>
          {isRecurring ? `✅ ${period}` : "❌ No"}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const transaction = row.original

      const handleEdit = () => {
        // 🔄 Call your edit modal or navigation
        console.log("Edit", transaction._id)
      }

      const handleDelete = async (item: Expense | IncomeItem, type: "expense" | "income") => {
        const endpoint =
          type === "income"
            ? `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/income/deleteincome/${item._id}`
            : `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/expense/deleteexpense/${item._id}`;

        try {
          const res = await fetch(endpoint, {
            method: "DELETE",
          });

          if (res.ok) {
            toast.success(`${type === "income" ? "Income" : "Expense"} deleted`);
            refreshData();
          } else {
            const errorData = await res.json();
            toast.error(`Failed to delete ${type}: ${errorData.message}`);
          }
        } catch (err) {
          console.error("Delete error:", err);
          toast.error("Something went wrong while deleting.");
        }
      };


      return (
        <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label="Open menu"
          className="h-8 w-8 p-0 bg-transparent border-none rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        align="end"
        sideOffset={5}
        className="min-w-[160px] rounded-md bg-white p-2 shadow-lg border border-gray-200"
      >
        <DropdownMenu.Label className="px-2 py-1 text-sm font-semibold text-gray-700">
          Actions
        </DropdownMenu.Label>

        <DropdownMenu.Item
          onClick={handleEdit}
          className="flex items-center px-2 py-2 rounded cursor-pointer text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenu.Item>

        <DropdownMenu.Item
          onClick={() => handleDelete(transaction, transaction.type === 'income' ? 'income' : 'expense')}
          className="flex items-center px-2 py-2 rounded cursor-pointer text-red-600 hover:bg-red-100 focus:outline-none focus:bg-red-100"
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
      )
    },
  },
];
