import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export function generarExcel(
  titulo: string,
  headers: string[],
  rows: string[][],
  nombreArchivo: string,
  resumen?: string[],
) {
  const wsData = [headers, ...rows]
  if (resumen) {
    wsData.push([])
    wsData.push(resumen)
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData)

  const colWidths = headers.map((header, i) => {
    const maxLen = Math.max(
      header.length,
      ...rows.map(row => (row[i] || '').length),
    )
    return { wch: maxLen + 4 }
  })
  ws['!cols'] = colWidths

  if (resumen) {
    const resumenRow = rows.length + 2
    for (let c = 0; c < resumen.length; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r: resumenRow, c })]
      if (cell) cell.s = { font: { bold: true } }
    }
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, titulo)
  XLSX.writeFile(wb, `${nombreArchivo}.xlsx`)
}

export function generarPDF(
  titulo: string,
  headers: string[],
  rows: string[][],
  nombreArchivo: string,
  subtitulo?: string,
  resumen?: string[],
) {
  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.text(titulo, 14, 20)

  let startY = 28
  if (subtitulo) {
    doc.setFontSize(10)
    doc.text(subtitulo, 14, startY)
    startY += 6
  }

  doc.setFontSize(8)
  doc.text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, 14, startY)
  startY += 8

  const body = [...rows]
  if (resumen) {
    body.push(resumen)
  }

  autoTable(doc, {
    head: [headers],
    body,
    startY,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 66, 66] },
    didParseCell(data) {
      if (resumen && data.section === 'body' && data.row.index === rows.length) {
        data.cell.styles.fillColor = [230, 230, 230]
        data.cell.styles.fontStyle = 'bold'
      }
    },
  })

  doc.save(`${nombreArchivo}.pdf`)
}
