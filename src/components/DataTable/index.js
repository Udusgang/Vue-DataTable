// DataTable Component Export
// This file makes it easy to import the DataTable in other projects

import DataTable from './DataTable.vue'
import DataTableColumn from './DataTableColumn.vue'
import DataTableFilter from './DataTableFilter.vue'
import DataTablePagination from './DataTablePagination.vue'
import DataTableToolbar from './DataTableToolbar.vue'
import DataTableCell from './DataTableCell.vue'

// Export individual components
export {
  DataTable,
  DataTableColumn,
  DataTableFilter,
  DataTablePagination,
  DataTableToolbar,
  DataTableCell
}

// Export as default for easy import
export default DataTable

// Export composables and utilities
export { useDataTable } from './composables/useDataTable'
export { useDataTableFilter } from './composables/useDataTableFilter'
export { useDataTableSort } from './composables/useDataTableSort'
export { useDataTablePagination } from './composables/useDataTablePagination'
export { useDataTableExport } from './composables/useDataTableExport'
export { useDataTableCrud } from './composables/useDataTableCrud'

// Export utilities
export * from './utils/dataTableUtils'
export * from './utils/exportUtils'
export * from './utils/filterUtils'
