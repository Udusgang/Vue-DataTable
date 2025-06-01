// Export Utilities for DataTable
import { formatCellValue, getNestedValue } from './dataTableUtils'

/**
 * Export data to CSV format
 */
export function exportToCSV(data, columns, filename = 'export.csv') {
  const headers = columns.map(col => col.title || col.key).join(',')
  const rows = data.map(row => {
    return columns.map(col => {
      const value = getNestedValue(row, col.key)
      const formatted = formatCellValue(value, col)
      // Escape commas and quotes in CSV
      return `"${String(formatted).replace(/"/g, '""')}"`
    }).join(',')
  })

  const csvContent = [headers, ...rows].join('\n')
  downloadFile(csvContent, filename, 'text/csv')
}

/**
 * Export data to JSON format
 */
export function exportToJSON(data, columns, filename = 'export.json') {
  const exportData = data.map(row => {
    const exportRow = {}
    columns.forEach(col => {
      const value = getNestedValue(row, col.key)
      exportRow[col.title || col.key] = formatCellValue(value, col)
    })
    return exportRow
  })

  const jsonContent = JSON.stringify(exportData, null, 2)
  downloadFile(jsonContent, filename, 'application/json')
}

/**
 * Export data to Excel format (using HTML table method)
 */
export function exportToExcel(data, columns, filename = 'export.xlsx') {
  const headers = columns.map(col => `<th>${col.title || col.key}</th>`).join('')
  const rows = data.map(row => {
    const cells = columns.map(col => {
      const value = getNestedValue(row, col.key)
      const formatted = formatCellValue(value, col)
      return `<td>${formatted}</td>`
    }).join('')
    return `<tr>${cells}</tr>`
  }).join('')

  const htmlContent = `
    <table>
      <thead><tr>${headers}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `

  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Print table data with clean formatting (no browser headers/footers)
 */
export function printTable(data, columns, title = 'Data Table') {
  const headers = columns.map(col => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5; font-weight: bold;">${col.title || col.key}</th>`).join('')
  const rows = data.map(row => {
    const cells = columns.map(col => {
      const value = getNestedValue(row, col.key)
      const formatted = formatCellValue(value, col)
      return `<td style="border: 1px solid #ddd; padding: 8px;">${formatted}</td>`
    }).join('')
    return `<tr>${cells}</tr>`
  }).join('')

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
        }

        .print-container {
          padding: 20px;
          max-width: 100%;
        }

        h1 {
          color: #333;
          margin-bottom: 20px;
          font-size: 18px;
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }

        table {
          border-collapse: collapse;
          width: 100%;
          margin-top: 10px;
        }

        th, td {
          text-align: left;
          vertical-align: top;
          word-wrap: break-word;
        }

        th {
          background-color: #f8f9fa !important;
          font-weight: bold;
        }

        tr:nth-child(even) {
          background-color: #f8f9fa;
        }

        .print-info {
          margin-top: 20px;
          font-size: 10px;
          color: #666;
          text-align: center;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }

        @media print {
          body {
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }

          .print-container {
            padding: 10px !important;
          }

          /* Hide browser headers and footers */
          @page {
            margin: 0.5in;
            size: auto;
          }

          /* Ensure table fits on page */
          table {
            page-break-inside: auto;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          th {
            page-break-after: avoid;
          }

          /* Hide any browser-generated content */
          .no-print {
            display: none !important;
          }
        }

        @media screen {
          body {
            background-color: #f5f5f5;
          }

          .print-container {
            background-color: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            margin: 20px auto;
            max-width: 1200px;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-container">
        <h1>${title}</h1>
        <table>
          <thead><tr>${headers}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="print-info">
          Generated on ${new Date().toLocaleDateString()} | Total Records: ${data.length}
        </div>
      </div>
      <script>
        // Wait for content to load then print
        window.onload = function() {
          // Small delay to ensure styles are applied
          setTimeout(function() {
            window.print();
          }, 100);

          // Close window after printing (or if user cancels)
          window.onafterprint = function() {
            window.close();
          };

          // Also close if user presses escape
          document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
              window.close();
            }
          });
        };
      </script>
    </body>
    </html>
  `

  const printWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')
  printWindow.document.write(printContent)
  printWindow.document.close()
}

/**
 * Download file helper
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(baseName, extension) {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  return `${baseName}_${timestamp}.${extension}`
}

/**
 * Validate export data
 */
export function validateExportData(data, columns) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No data to export')
  }

  if (!Array.isArray(columns) || columns.length === 0) {
    throw new Error('No columns defined for export')
  }

  return true
}
