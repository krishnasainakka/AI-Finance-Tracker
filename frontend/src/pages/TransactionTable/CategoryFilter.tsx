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

interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  table: any;
  categories: Category[];
}

export function CategoryFilter({ table, categories }: CategoryFilterProps) {
  const categoryOptions = [{ id: "all", name: "All" }, ...categories];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center">
          Category
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Select a Category</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {categoryOptions.map((cat) => (
          <DropdownMenuItem
            key={cat.id}
            onClick={() =>
              table.getColumn("category")?.setFilterValue(cat.id === "all" ? undefined : cat.name)
            }
          >
            {cat.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

