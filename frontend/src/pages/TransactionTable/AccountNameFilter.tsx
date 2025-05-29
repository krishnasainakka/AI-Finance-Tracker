import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface Account {
  _id: string;
  accountName: string;
  balance: number;
  createdBy: string;
  createdAt?: string;
}

interface AccountNameFilterProps {
  table: any;
  accounts: Account[];
}

export function AccountNameFilter({ table, accounts }: AccountNameFilterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center">
          Account
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Select an Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            table.getColumn("accountName")?.setFilterValue(undefined)
          }
        >
          All
        </DropdownMenuItem>
        {(accounts ?? []).map((account) => (
          <DropdownMenuItem
            key={account._id}
            onClick={() =>
              table.getColumn("accountName")?.setFilterValue(account.accountName)
            }
          >
            {account.accountName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
