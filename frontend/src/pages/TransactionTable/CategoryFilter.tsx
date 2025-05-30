import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  table: any;
  categories: Category[];
}

export function CategoryFilter({ table, categories }: CategoryFilterProps) {
  const [open, setOpen] = useState(false);
  const categoryOptions = [{ id: "all", name: "All" }, ...categories];

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button className="inline-flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md shadow-sm bg-white text-sm font-medium hover:bg-gray-100 focus:outline-none">
          Category
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={5}
          className="bg-white rounded-md shadow-lg border p-2 w-56 z-50"
        >
          <DropdownMenu.Label className="px-2 py-1 text-xs text-gray-500">
            Select a Category
          </DropdownMenu.Label>

          <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />

          {categoryOptions.map((cat) => (
            <DropdownMenu.Item
              key={cat.id}
              onSelect={() =>
                table.getColumn("category")?.setFilterValue(
                  cat.id === "all" ? undefined : cat.name
                )
              }
              className="px-2 py-1.5 text-sm cursor-pointer rounded hover:bg-gray-100"
            >
              {cat.name}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
