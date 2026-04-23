import * as XLSX from 'xlsx'

/**
 * Downloads a pre-formatted Excel template for bulk customer import.
 */
export function downloadTemplate() {
  const wb = XLSX.utils.book_new()

  const headers = ['name', 'date_of_birth', 'nic_number']

  const sampleData = [
    ['John Doe',    '1990-05-15', '199012345678'],
    ['Jane Smith',  '1985-11-22', '199056789012'],
    ['Alice Kumar', '2000-01-08', '200012345673'],
  ]

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData])

  // Column widths
  ws['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 18 }]

  XLSX.utils.book_append_sheet(wb, ws, 'Customers')

  XLSX.writeFile(wb, 'customer_bulk_upload_template.xlsx')
}
