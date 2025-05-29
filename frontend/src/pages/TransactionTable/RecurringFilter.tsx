import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

export function RecurringFilter({ table }: { table: any }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center">
          Recurring
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Select Recurrence</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => table.getColumn("recurring")?.setFilterValue(undefined)}
        >
          All
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => table.getColumn("recurring")?.setFilterValue(true)}
        >
          Yes
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => table.getColumn("recurring")?.setFilterValue(false)}
        >
          No
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
