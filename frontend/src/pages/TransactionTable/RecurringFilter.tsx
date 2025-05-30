import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function RecurringFilter({ table }: { table: any }) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button className="inline-flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md shadow-sm bg-white text-sm font-medium hover:bg-gray-100 focus:outline-none">
          Recurring
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={5}
          className="bg-white rounded-md shadow-lg border p-2 w-48 z-50"
        >
          <DropdownMenu.Label className="px-2 py-1 text-xs text-gray-500">
            Select Recurrence
          </DropdownMenu.Label>

          <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />

          <DropdownMenu.Item
            onSelect={() => table.getColumn("recurring")?.setFilterValue(undefined)}
            className="px-2 py-1.5 text-sm cursor-pointer rounded hover:bg-gray-100"
          >
            All
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onSelect={() => table.getColumn("recurring")?.setFilterValue(true)}
            className="px-2 py-1.5 text-sm cursor-pointer rounded hover:bg-gray-100"
          >
            Yes
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onSelect={() => table.getColumn("recurring")?.setFilterValue(false)}
            className="px-2 py-1.5 text-sm cursor-pointer rounded hover:bg-gray-100"
          >
            No
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
