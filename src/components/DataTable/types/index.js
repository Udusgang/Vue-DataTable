// DataTable Type Definitions and Interfaces
// This helps with consistency and makes migration easier

export const COLUMN_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  DATE: 'date',
  BOOLEAN: 'boolean',
  CURRENCY: 'currency',
  PERCENTAGE: 'percentage',
  IMAGE: 'image',
  LINK: 'link',
  BADGE: 'badge',
  ACTIONS: 'actions',
  CUSTOM: 'custom'
}

export const FILTER_TYPES = {
  TEXT: 'text',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  DATE_RANGE: 'dateRange',
  NUMBER_RANGE: 'numberRange',
  BOOLEAN: 'boolean'
}

export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc',
  NONE: null
}

export const EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'excel',
  PDF: 'pdf',
  JSON: 'json'
}

export const CRUD_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  BULK_DELETE: 'bulkDelete',
  BULK_UPDATE: 'bulkUpdate'
}

// Default column configuration
export const DEFAULT_COLUMN_CONFIG = {
  sortable: true,
  filterable: true,
  resizable: true,
  visible: true,
  width: 'auto',
  minWidth: 100,
  maxWidth: null,
  align: 'left',
  type: COLUMN_TYPES.TEXT,
  format: null,
  editable: false,
  required: false
}

// Default table configuration
export const DEFAULT_TABLE_CONFIG = {
  pagination: {
    enabled: true,
    pageSize: 10,
    pageSizes: [5, 10, 25, 50, 100],
    showInfo: true,
    showSizeChanger: true
  },
  sorting: {
    enabled: true,
    multiple: false,
    defaultSort: null
  },
  filtering: {
    enabled: true,
    global: true,
    column: true,
    debounce: 300
  },
  selection: {
    enabled: false,
    multiple: true,
    showSelectAll: true
  },
  export: {
    enabled: true,
    formats: [EXPORT_FORMATS.CSV, EXPORT_FORMATS.EXCEL, EXPORT_FORMATS.PDF],
    filename: 'data-export'
  },
  crud: {
    enabled: false,
    inline: true,
    actions: [CRUD_ACTIONS.UPDATE, CRUD_ACTIONS.DELETE]
  },
  ui: {
    striped: true,
    bordered: true,
    hover: true,
    compact: false,
    stickyHeader: true,
    virtualScroll: false,
    loading: false,
    noDataText: 'No data available',
    loadingText: 'Loading...'
  }
}
