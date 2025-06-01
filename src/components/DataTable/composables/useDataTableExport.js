// DataTable Export Composable
import { ref, reactive } from 'vue'
import { 
  exportToCSV, 
  exportToExcel, 
  exportToJSON, 
  printTable,
  generateFilename,
  validateExportData
} from '../utils/exportUtils'
import { EXPORT_FORMATS } from '../types'

export function useDataTableExport(config = {}) {
  // State
  const isExporting = ref(false)
  const exportProgress = ref(0)
  const exportError = ref(null)
  
  // Configuration
  const exportConfig = reactive({
    formats: [EXPORT_FORMATS.CSV, EXPORT_FORMATS.EXCEL, EXPORT_FORMATS.JSON],
    filename: 'data-export',
    includeHeaders: true,
    selectedOnly: false,
    visibleColumnsOnly: true,
    dateFormat: 'YYYY-MM-DD',
    numberFormat: 'en-US',
    booleanFormat: { true: 'Yes', false: 'No' },
    ...config
  })

  // Export methods
  async function exportData(data, columns, format, options = {}) {
    isExporting.value = true
    exportProgress.value = 0
    exportError.value = null

    try {
      // Validate data
      validateExportData(data, columns)

      // Merge options with config
      const exportOptions = { ...exportConfig, ...options }
      
      // Filter columns if needed
      const exportColumns = exportOptions.visibleColumnsOnly 
        ? columns.filter(col => col.visible !== false)
        : columns

      // Filter data if needed
      const exportData = exportOptions.selectedOnly && options.selectedData
        ? options.selectedData
        : data

      // Update progress
      exportProgress.value = 25

      // Generate filename
      const filename = generateFilename(
        exportOptions.filename || exportConfig.filename,
        getFileExtension(format)
      )

      // Update progress
      exportProgress.value = 50

      // Export based on format
      switch (format) {
        case EXPORT_FORMATS.CSV:
          await exportToCSV(exportData, exportColumns, filename)
          break
        case EXPORT_FORMATS.EXCEL:
          await exportToExcel(exportData, exportColumns, filename)
          break
        case EXPORT_FORMATS.JSON:
          await exportToJSON(exportData, exportColumns, filename)
          break
        case EXPORT_FORMATS.PDF:
          await exportToPDF(exportData, exportColumns, filename, exportOptions)
          break
        default:
          throw new Error(`Unsupported export format: ${format}`)
      }

      // Update progress
      exportProgress.value = 100

      return { success: true, filename }

    } catch (error) {
      exportError.value = error.message
      console.error('Export error:', error)
      return { success: false, error: error.message }
    } finally {
      isExporting.value = false
      setTimeout(() => {
        exportProgress.value = 0
      }, 1000)
    }
  }

  async function exportToPDF(data, columns, filename, options) {
    // This would require a PDF library like jsPDF
    // For now, we'll use the print functionality
    printTable(data, columns, options.title || 'Data Export')
  }

  async function printData(data, columns, options = {}) {
    try {
      const printOptions = { ...exportConfig, ...options }
      
      const exportColumns = printOptions.visibleColumnsOnly 
        ? columns.filter(col => col.visible !== false)
        : columns

      const printData = printOptions.selectedOnly && options.selectedData
        ? options.selectedData
        : data

      printTable(printData, exportColumns, printOptions.title || 'Data Table')
      
      return { success: true }
    } catch (error) {
      exportError.value = error.message
      return { success: false, error: error.message }
    }
  }

  // Bulk export methods
  async function exportMultipleFormats(data, columns, formats, options = {}) {
    const results = []
    
    for (const format of formats) {
      const result = await exportData(data, columns, format, options)
      results.push({ format, ...result })
    }
    
    return results
  }

  async function exportWithTemplate(data, columns, template, options = {}) {
    // Apply template transformations
    const transformedData = applyTemplate(data, template)
    const transformedColumns = template.columns || columns
    
    return exportData(transformedData, transformedColumns, template.format, {
      ...options,
      filename: template.filename || options.filename
    })
  }

  // Template system
  function applyTemplate(data, template) {
    if (!template.transformations) return data
    
    return data.map(row => {
      const transformedRow = { ...row }
      
      template.transformations.forEach(transform => {
        switch (transform.type) {
          case 'rename':
            if (transformedRow[transform.from]) {
              transformedRow[transform.to] = transformedRow[transform.from]
              delete transformedRow[transform.from]
            }
            break
          case 'format':
            if (transformedRow[transform.field]) {
              transformedRow[transform.field] = applyFormat(
                transformedRow[transform.field], 
                transform.format
              )
            }
            break
          case 'calculate':
            transformedRow[transform.field] = calculateField(row, transform.formula)
            break
        }
      })
      
      return transformedRow
    })
  }

  function applyFormat(value, format) {
    switch (format.type) {
      case 'date':
        return new Date(value).toLocaleDateString(format.locale || 'en-US', format.options)
      case 'number':
        return new Intl.NumberFormat(format.locale || 'en-US', format.options).format(value)
      case 'currency':
        return new Intl.NumberFormat(format.locale || 'en-US', {
          style: 'currency',
          currency: format.currency || 'USD'
        }).format(value)
      case 'percentage':
        return `${(value * 100).toFixed(format.decimals || 2)}%`
      default:
        return value
    }
  }

  function calculateField(row, formula) {
    // Simple formula evaluation (you might want to use a proper expression parser)
    try {
      // Replace field references with actual values
      let expression = formula
      Object.keys(row).forEach(key => {
        expression = expression.replace(new RegExp(`\\{${key}\\}`, 'g'), row[key])
      })
      
      // Evaluate the expression (be careful with eval in production)
      return Function(`"use strict"; return (${expression})`)()
    } catch (error) {
      console.error('Formula calculation error:', error)
      return null
    }
  }

  // Utility functions
  function getFileExtension(format) {
    switch (format) {
      case EXPORT_FORMATS.CSV: return 'csv'
      case EXPORT_FORMATS.EXCEL: return 'xlsx'
      case EXPORT_FORMATS.JSON: return 'json'
      case EXPORT_FORMATS.PDF: return 'pdf'
      default: return 'txt'
    }
  }

  function getSupportedFormats() {
    return exportConfig.formats
  }

  function isFormatSupported(format) {
    return exportConfig.formats.includes(format)
  }

  // Export presets
  const exportPresets = reactive({
    quick: {
      formats: [EXPORT_FORMATS.CSV],
      visibleColumnsOnly: true,
      selectedOnly: false
    },
    complete: {
      formats: [EXPORT_FORMATS.CSV, EXPORT_FORMATS.EXCEL, EXPORT_FORMATS.JSON],
      visibleColumnsOnly: false,
      selectedOnly: false
    },
    selected: {
      formats: [EXPORT_FORMATS.CSV],
      visibleColumnsOnly: true,
      selectedOnly: true
    }
  })

  async function exportWithPreset(data, columns, presetName, options = {}) {
    const preset = exportPresets[presetName]
    if (!preset) {
      throw new Error(`Unknown export preset: ${presetName}`)
    }

    const results = []
    for (const format of preset.formats) {
      const result = await exportData(data, columns, format, { ...preset, ...options })
      results.push({ format, ...result })
    }

    return results
  }

  // Custom export handlers
  const customExporters = reactive({})

  function registerCustomExporter(format, handler) {
    customExporters[format] = handler
  }

  function unregisterCustomExporter(format) {
    delete customExporters[format]
  }

  async function exportWithCustomHandler(data, columns, format, options = {}) {
    const handler = customExporters[format]
    if (!handler) {
      throw new Error(`No custom exporter registered for format: ${format}`)
    }

    return handler(data, columns, options)
  }

  return {
    // State
    isExporting,
    exportProgress,
    exportError,
    exportConfig,
    exportPresets,

    // Methods
    exportData,
    printData,
    exportMultipleFormats,
    exportWithTemplate,
    exportWithPreset,
    getSupportedFormats,
    isFormatSupported,
    registerCustomExporter,
    unregisterCustomExporter,
    exportWithCustomHandler
  }
}
