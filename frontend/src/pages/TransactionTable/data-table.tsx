import React from "react";
import { CategoryFilter } from "./CategoryFilter"
import { AccountNameFilter } from "./AccountNameFilter";
import { RecurringFilter } from "./RecurringFilter";

import type { ColumnDef } from "@tanstack/react-table";
import type { SortingState, ColumnFiltersState, VisibilityState, } from "@tanstack/react-table";
import {  
  flexRender,  
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,  
  
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
const {
  Root: DropdownMenuRoot,
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  // CheckboxItem: DropdownMenuCheckboxItem,
} = DropdownMenuPrimitive;

type Account = {
  _id: string;
  accountName: string;
  balance: number;
  createdBy: string;
  createdAt?: string;
};

interface Category {
  id: string;
  name: string;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  accountList: Account[];         
  categoryList: Category[];
  filters?: string[]; // optional prop to control which filters to show
}

export function DataTable<TData, TValue>({
  columns,
  data,
  categoryList,
  accountList,
  filters
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
  <div className="space-y-6">
    {/* Filter & Search Bar */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Search Input */}
      <Input
        placeholder="Search transactions..."
        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
        onChange={(e) =>
          table.getColumn("name")?.setFilterValue(e.target.value)
        }
        className="md:max-w-sm"
      />
      


      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(filters?.includes("account")) && (
          <AccountNameFilter table={table} accounts={accountList} />
        )}
        {(filters?.includes("category")) && (
          <CategoryFilter table={table} categories={categoryList} />
        )}
        {(filters?.includes("recurring")) && (
          <RecurringFilter table={table} />
        )}
      </div>

      {/* Column Toggle */}
      <DropdownMenuRoot>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="ml-auto px-3 py-1 border rounded-md outline-none focus:ring"
          >
            Columns
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={5}
          style={{
            backgroundColor: "white",
            border: "1px solid rgba(0,0,0,0.15)",
            borderRadius: 6,
            padding: 10,
            minWidth: 200,
            boxShadow: "rgba(0,0,0,0.2) 0px 10px 15px -3px",
            zIndex: 1000,
          }}
        >
          {table
            .getAllColumns()
            .filter((col) => col.getCanHide())
            .map((col) => {
              const isVisible = col.getIsVisible();
              return (
                <div
                  key={col.id}
                  className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100 rounded"
                  onClick={() => col.toggleVisibility(!isVisible)}
                >
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => {}}
                    className="accent-blue-600 cursor-pointer"
                    readOnly
                  />
                  <span className="capitalize text-sm">{col.id}</span>
                </div>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenuRoot>
    </div>

    {/* Selection Info */}
    {/* <div className="text-sm text-muted-foreground">
      {table.getFilteredSelectedRowModel().rows.length} of{" "}
      {table.getFilteredRowModel().rows.length} row(s) selected.
    </div> */}

    {/* Table */}
    <div className="rounded-md border overflow-auto">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>

    {/* Pagination */}
    <div className="flex items-center justify-end space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        Next
      </Button>
    </div>
  </div>
)

}
