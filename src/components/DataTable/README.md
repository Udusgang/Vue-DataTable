# Advanced Vue DataTable Component

A comprehensive, feature-rich DataTable component for Vue.js applications with advanced functionality and easy migration capabilities.

## Features

### Core Features
- ✅ **Sorting** - Single and multiple column sorting with custom sorters
- ✅ **Filtering** - Global search, column filters, and advanced filtering
- ✅ **Pagination** - Client-side and server-side pagination
- ✅ **Selection** - Single and multiple row selection
- ✅ **Export** - CSV, Excel, JSON, and PDF export capabilities
- ✅ **Print** - Print table data with formatting
- ✅ **CRUD Operations** - Inline editing, create, update, delete
- ✅ **Responsive Design** - Mobile-friendly interface

### Advanced Features
- ✅ **Virtual Scrolling** - Handle large datasets efficiently
- ✅ **Sticky Headers** - Keep headers visible while scrolling
- ✅ **Column Resizing** - Drag to resize columns
- ✅ **Row/Column Spanning** - Merge cells for complex layouts
- ✅ **Custom Cell Renderers** - Render custom content in cells
- ✅ **Server-side Support** - Handle large datasets with server-side processing
- ✅ **Drag & Drop** - Reorder rows and columns
- ✅ **Themes** - Multiple built-in themes and customization

### Unique Features
- 🚀 **Modular Architecture** - Use only what you need
- 🚀 **Easy Migration** - Copy and use in any Vue project
- 🚀 **TypeScript Support** - Full type definitions
- 🚀 **Composable-based** - Leverage Vue 3 composition API
- 🚀 **Zero Dependencies** - No external libraries required
- 🚀 **Performance Optimized** - Virtual scrolling and lazy loading

## Quick Start

### Installation

1. Copy the entire `DataTable` folder to your project's components directory
2. Import and use the component:

```vue
<template>
  <DataTable
    :data="tableData"
    :columns="tableColumns"
    :config="tableConfig"
    @row-click="handleRowClick"
  />
</template>

<script setup>
import DataTable from '@/components/DataTable/DataTable.vue'

const tableData = ref([
  { id: 1, name: 'John Doe', email: 'john@example.com', active: true },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', active: false }
])

const tableColumns = [
  { key: 'id', title: 'ID', type: 'number', sortable: true },
  { key: 'name', title: 'Name', type: 'text', sortable: true, filterable: true },
  { key: 'email', title: 'Email', type: 'email', sortable: true, filterable: true },
  { key: 'active', title: 'Status', type: 'boolean', sortable: true }
]

const tableConfig = {
  pagination: { enabled: true, pageSize: 10 },
  selection: { enabled: true },
  export: { enabled: true },
  crud: { enabled: true }
}
</script>
```

## Configuration

### Column Configuration

```javascript
const columns = [
  {
    key: 'name',              // Data property key
    title: 'Full Name',       // Display title
    type: 'text',             // Data type (text, number, date, boolean, currency, etc.)
    sortable: true,           // Enable sorting
    filterable: true,         // Enable filtering
    editable: true,           // Enable inline editing
    required: true,           // Required for validation
    width: '200px',           // Fixed width
    minWidth: '100px',        // Minimum width
    align: 'center',          // Text alignment (left, center, right)
    
    // Type-specific options
    currency: 'USD',          // For currency type
    dateFormat: { ... },      // For date type
    badgeConfig: { ... },     // For badge type
    
    // Custom rendering
    customSort: (a, b) => ..., // Custom sort function
    validate: (value) => ...,  // Validation function
  }
]
```

### Table Configuration

```javascript
const config = {
  // Pagination
  pagination: {
    enabled: true,
    pageSize: 10,
    pageSizes: [5, 10, 25, 50, 100],
    showInfo: true,
    showSizeChanger: true
  },
  
  // Sorting
  sorting: {
    enabled: true,
    multiple: false,
    defaultSort: { key: 'name', direction: 'asc' }
  },
  
  // Filtering
  filtering: {
    enabled: true,
    global: true,
    column: true,
    debounce: 300
  },
  
  // Selection
  selection: {
    enabled: true,
    multiple: true,
    showSelectAll: true
  },
  
  // Export
  export: {
    enabled: true,
    formats: ['csv', 'excel', 'json'],
    filename: 'data-export'
  },
  
  // CRUD
  crud: {
    enabled: true,
    inline: true,
    actions: ['create', 'update', 'delete', 'bulkDelete']
  },
  
  // UI
  ui: {
    striped: true,
    bordered: true,
    hover: true,
    compact: false,
    stickyHeader: true,
    virtualScroll: false
  }
}
```

## Column Types

### Basic Types
- `text` - Plain text
- `number` - Numeric values
- `date` - Date values
- `boolean` - True/false values
- `email` - Email addresses
- `currency` - Monetary values
- `percentage` - Percentage values

### Advanced Types
- `badge` - Colored badges/tags
- `image` - Image thumbnails
- `link` - Clickable links
- `actions` - Action buttons
- `custom` - Custom content via slots

## Events

```javascript
// Row events
@row-click="handleRowClick"
@row-select="handleRowSelect"
@row-deselect="handleRowDeselect"

// Cell events
@cell-click="handleCellClick"
@cell-update="handleCellUpdate"

// Action events
@action="handleAction"
@create="handleCreate"
@update="handleUpdate"
@delete="handleDelete"
@bulk-delete="handleBulkDelete"

// Data events
@sort="handleSort"
@filter="handleFilter"
@page-change="handlePageChange"
```

## Server-side Support

```vue
<template>
  <DataTable
    :data="tableData"
    :columns="tableColumns"
    :config="tableConfig"
    server-side
    @sort="handleServerSort"
    @filter="handleServerFilter"
    @page-change="handleServerPageChange"
  />
</template>

<script setup>
async function handleServerSort({ column, direction }) {
  const response = await api.getData({
    sort: { column, direction },
    page: currentPage.value,
    pageSize: pageSize.value,
    filters: currentFilters.value
  })
  
  tableData.value = response.data
  totalItems.value = response.total
}
</script>
```

## Migration Guide

### To migrate this DataTable to another project:

1. **Copy the DataTable folder** to your new project's components directory
2. **Install dependencies** (if not already installed):
   ```bash
   npm install @heroicons/vue
   ```
3. **Import and use** the component as shown in the examples above
4. **Customize** the configuration and styling as needed

### File Structure
```
DataTable/
├── index.js                 # Main export file
├── DataTable.vue           # Main component
├── DataTableCell.vue       # Cell component
├── DataTablePagination.vue # Pagination component
├── DataTableToolbar.vue    # Toolbar component
├── composables/            # Vue composables
│   ├── useDataTable.js
│   ├── useDataTableCrud.js
│   ├── useDataTableExport.js
│   ├── useDataTableFilter.js
│   ├── useDataTablePagination.js
│   └── useDataTableSort.js
├── utils/                  # Utility functions
│   ├── dataTableUtils.js
│   ├── exportUtils.js
│   └── filterUtils.js
├── types/                  # Type definitions
│   └── index.js
└── README.md              # This file
```

## Customization

### Custom Cell Renderers

```vue
<template>
  <DataTable :data="data" :columns="columns">
    <template #cell-status="{ row, column, value }">
      <span :class="getStatusClass(value)">
        {{ value }}
      </span>
    </template>
  </DataTable>
</template>
```

### Custom Themes

```css
/* Custom theme example */
.datatable-container.theme-dark {
  --dt-bg-primary: #1f2937;
  --dt-bg-secondary: #374151;
  --dt-text-primary: #f9fafb;
  --dt-text-secondary: #d1d5db;
  --dt-border-color: #4b5563;
}
```

## Performance Tips

1. **Use virtual scrolling** for large datasets (1000+ rows)
2. **Enable server-side processing** for very large datasets
3. **Limit visible columns** to improve rendering performance
4. **Use pagination** instead of showing all data at once
5. **Debounce filters** to reduce API calls

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## License

MIT License - feel free to use in any project!
