// CRUD Operations Composable for DataTable
import { ref, reactive } from 'vue'
import { generateRowId } from '../utils/dataTableUtils'

export function useDataTableCrud(dataTable, config = {}) {
  // State
  const isCreating = ref(false)
  const isEditing = ref(false)
  const editingRow = ref(null)
  const formData = reactive({})
  const errors = reactive({})
  const loading = ref(false)

  // Default CRUD configuration
  const crudConfig = reactive({
    inline: true,
    modal: false,
    validateOnSave: true,
    confirmDelete: true,
    optimisticUpdates: true,
    ...config
  })

  // Methods
  async function createRow(data) {
    loading.value = true
    errors.value = {}

    try {
      // Validate data if validation is enabled
      if (crudConfig.validateOnSave) {
        const validationErrors = validateRowData(data)
        if (Object.keys(validationErrors).length > 0) {
          Object.assign(errors, validationErrors)
          return false
        }
      }

      // Generate unique ID for new row
      const newRow = {
        ...data,
        _id: generateRowId(),
        _isNew: true,
        _createdAt: new Date().toISOString()
      }

      // Add to data table
      dataTable.addRow(newRow)

      // Emit create event for server-side handling
      if (config.serverSide) {
        await config.onCreate?.(newRow)
      }

      isCreating.value = false
      clearFormData()
      return true

    } catch (error) {
      console.error('Error creating row:', error)
      errors.general = error.message || 'Failed to create record'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateRow(rowId, updates) {
    loading.value = true
    errors.value = {}

    try {
      // Validate updates if validation is enabled
      if (crudConfig.validateOnSave) {
        const validationErrors = validateRowData(updates, true)
        if (Object.keys(validationErrors).length > 0) {
          Object.assign(errors, validationErrors)
          return false
        }
      }

      // Optimistic update
      if (crudConfig.optimisticUpdates) {
        dataTable.updateRow(rowId, {
          ...updates,
          _updatedAt: new Date().toISOString()
        })
      }

      // Server-side update
      if (config.serverSide) {
        await config.onUpdate?.(rowId, updates)
      }

      // Update local data if not optimistic
      if (!crudConfig.optimisticUpdates) {
        dataTable.updateRow(rowId, {
          ...updates,
          _updatedAt: new Date().toISOString()
        })
      }

      isEditing.value = false
      editingRow.value = null
      clearFormData()
      return true

    } catch (error) {
      console.error('Error updating row:', error)
      errors.general = error.message || 'Failed to update record'
      
      // Revert optimistic update on error
      if (crudConfig.optimisticUpdates && config.serverSide) {
        // You might want to implement a revert mechanism here
      }
      
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteRow(rowId) {
    if (crudConfig.confirmDelete) {
      const confirmed = await showDeleteConfirmation()
      if (!confirmed) return false
    }

    loading.value = true

    try {
      // Optimistic delete
      if (crudConfig.optimisticUpdates) {
        dataTable.deleteRow(rowId)
      }

      // Server-side delete
      if (config.serverSide) {
        await config.onDelete?.(rowId)
      }

      // Delete local data if not optimistic
      if (!crudConfig.optimisticUpdates) {
        dataTable.deleteRow(rowId)
      }

      return true

    } catch (error) {
      console.error('Error deleting row:', error)
      errors.general = error.message || 'Failed to delete record'
      
      // Revert optimistic delete on error
      if (crudConfig.optimisticUpdates && config.serverSide) {
        // You might want to implement a revert mechanism here
      }
      
      return false
    } finally {
      loading.value = false
    }
  }

  async function bulkDelete(rowIds) {
    if (crudConfig.confirmDelete) {
      const confirmed = await showBulkDeleteConfirmation(rowIds.length)
      if (!confirmed) return false
    }

    loading.value = true

    try {
      // Server-side bulk delete
      if (config.serverSide) {
        await config.onBulkDelete?.(rowIds)
      }

      // Delete from local data
      rowIds.forEach(id => dataTable.deleteRow(id))

      return true

    } catch (error) {
      console.error('Error bulk deleting rows:', error)
      errors.general = error.message || 'Failed to delete records'
      return false
    } finally {
      loading.value = false
    }
  }

  // Form management
  function startCreate() {
    isCreating.value = true
    isEditing.value = false
    editingRow.value = null
    clearFormData()
  }

  function startEdit(row) {
    isEditing.value = true
    isCreating.value = false
    editingRow.value = row
    
    // Populate form data with row data
    Object.keys(formData).forEach(key => delete formData[key])
    Object.assign(formData, { ...row })
  }

  function cancelEdit() {
    isEditing.value = false
    isCreating.value = false
    editingRow.value = null
    clearFormData()
    clearErrors()
  }

  function clearFormData() {
    Object.keys(formData).forEach(key => delete formData[key])
  }

  function clearErrors() {
    Object.keys(errors).forEach(key => delete errors[key])
  }

  // Validation
  function validateRowData(data, isUpdate = false) {
    const validationErrors = {}

    // Get columns that require validation
    const columns = config.columns || []
    
    columns.forEach(column => {
      const value = data[column.key]
      
      // Required field validation
      if (column.required && !isUpdate && (value === null || value === undefined || value === '')) {
        validationErrors[column.key] = `${column.title || column.key} is required`
      }
      
      // Type validation
      if (value !== null && value !== undefined && value !== '') {
        switch (column.type) {
          case 'email':
            if (!isValidEmail(value)) {
              validationErrors[column.key] = 'Please enter a valid email address'
            }
            break
          case 'number':
            if (isNaN(value)) {
              validationErrors[column.key] = 'Please enter a valid number'
            }
            break
          case 'date':
            if (!isValidDate(value)) {
              validationErrors[column.key] = 'Please enter a valid date'
            }
            break
        }
      }
      
      // Custom validation
      if (column.validate && typeof column.validate === 'function') {
        const customError = column.validate(value, data)
        if (customError) {
          validationErrors[column.key] = customError
        }
      }
    })

    return validationErrors
  }

  // Utility functions
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  function isValidDate(date) {
    return !isNaN(Date.parse(date))
  }

  async function showDeleteConfirmation() {
    return new Promise((resolve) => {
      if (window.confirm('Are you sure you want to delete this record?')) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  }

  async function showBulkDeleteConfirmation(count) {
    return new Promise((resolve) => {
      if (window.confirm(`Are you sure you want to delete ${count} records?`)) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  }

  // Quick actions
  function duplicateRow(row) {
    const duplicatedRow = {
      ...row,
      _id: generateRowId(),
      _isDuplicate: true,
      _createdAt: new Date().toISOString()
    }
    
    // Remove system fields that shouldn't be duplicated
    delete duplicatedRow._updatedAt
    delete duplicatedRow._isNew
    
    dataTable.addRow(duplicatedRow)
  }

  function toggleRowStatus(rowId, statusField = 'active') {
    const row = dataTable.originalData.value.find(r => r._id === rowId)
    if (row) {
      const updates = {
        [statusField]: !row[statusField]
      }
      updateRow(rowId, updates)
    }
  }

  return {
    // State
    isCreating,
    isEditing,
    editingRow,
    formData,
    errors,
    loading,
    crudConfig,

    // Methods
    createRow,
    updateRow,
    deleteRow,
    bulkDelete,
    startCreate,
    startEdit,
    cancelEdit,
    clearFormData,
    clearErrors,
    validateRowData,
    duplicateRow,
    toggleRowStatus
  }
}
