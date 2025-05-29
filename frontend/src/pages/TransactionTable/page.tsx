import type { Transaction} from "./columns"

import { getColumns } from "./columns"
import { DataTable } from "./data-table"

export default function DemoPage({ expenseList, accountList, categoryList, refreshData, filters }) {
  const data = expenseList;    
  // console.log("📦 expenseList demo page:", expenseList);
  // console.log("🏦 accountList:", accountList);
  // console.log("💰 budgetList:", budgetList);

  if (!expenseList) {
    console.warn("❗ expenseList is null or undefined");
  }

  if (!accountList) {
    console.warn("❗ accountList is null or undefined");
  }

  if (!categoryList) {
    console.warn("❗ budgetList is null or undefined");
  }

  return (
    <div className="container mx-auto py-10">
      
      <DataTable columns={getColumns(refreshData)} data={data} accountList={accountList} categoryList={categoryList} filters={filters}/>
    </div>
  )
}
