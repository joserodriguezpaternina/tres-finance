import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { MONTHS, fmt, fmtS, getBase, getIVA, calcFin, filterM } from './constants.js'

/* ────────────────────────────────────────────────────────
   EXCEL EXPORT
──────────────────────────────────────────────────────── */
export function exportExcel({ incomes, expenses, month, year }) {
  const wb = XLSX.utils.book_new()
  const mName = MONTHS[month]

  // ── Sheet 1: Ingresos
  const incRows = [
    ["TRES STUDIO · INGRESOS", `${mName} ${year}`],
    [],
    ["Cliente", "Proyecto", "Fecha", "Monto Total", "Base", "IVA", "Estado", "Método"],
    ...incomes.map(i => [
      i.client, i.project, i.date,
      Number(i.amount), getBase(i), getIVA(i),
      i.status, i.method
    ]),
    [],
    ["", "", "TOTALES",
      incomes.reduce((s, i) => s + Number(i.amount), 0),
      incomes.reduce((s, i) => s + getBase(i), 0),
      incomes.reduce((s, i) => s + getIVA(i), 0),
    ]
  ]
  const wsInc = XLSX.utils.aoa_to_sheet(incRows)
  wsInc['!cols'] = [{ wch: 22 }, { wch: 28 }, { wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, wsInc, 'Ingresos')

  // ── Sheet 2: Egresos
  const expRows = [
    ["TRES STUDIO · EGRESOS", `${mName} ${year}`],
    [],
    ["Fecha", "Categoría", "Descripción", "Proveedor", "Monto Total", "Base", "IVA", "Método"],
    ...expenses.map(e => [
      e.date, e.cat, e.desc || e.description, e.provider,
      Number(e.amount), getBase(e), getIVA(e), e.method
    ]),
    [],
    ["", "", "", "TOTALES",
      expenses.reduce((s, e) => s + Number(e.amount), 0),
      expenses.reduce((s, e) => s + getBase(e), 0),
      expenses.reduce((s, e) => s + getIVA(e), 0),
    ]
  ]
  const wsExp = XLSX.utils.aoa_to_sheet(expRows)
  wsExp['!cols'] = [{ wch: 12 }, { wch: 24 }, { wch: 28 }, { wch: 22 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, wsExp, 'Egresos')

  // ── Sheet 3: Resumen
  const fin = calcFin(incomes, expenses)
  const summaryRows = [
    ["TRES STUDIO · RESUMEN FINANCIERO"],
    [`Período: ${mName} ${year}`],
    [],
    ["INDICADOR", "VALOR"],
    ["Ingresos brutos", fin.tI],
    ["Base ingresos (sin IVA)", fin.tIb],
    ["IVA cobrado", fin.tIVAc],
    ["Egresos brutos", fin.tE],
    ["Base egresos (sin IVA)", fin.tEb],
    ["IVA pagado", fin.tIVAp],
    [],
    ["Utilidad neta", fin.util],
    ["Caja disponible", fin.caja],
    ["IVA neto (a declarar)", fin.ivaN],
    [],
    ["Facturas cobradas", incomes.filter(i => i.status === 'Pagado').reduce((s, i) => s + Number(i.amount), 0)],
    ["Facturas pendientes", incomes.filter(i => i.status === 'Pendiente').reduce((s, i) => s + Number(i.amount), 0)],
  ]
  const wsSum = XLSX.utils.aoa_to_sheet(summaryRows)
  wsSum['!cols'] = [{ wch: 30 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, wsSum, 'Resumen')

  XLSX.writeFile(wb, `TresStudio_${mName}_${year}.xlsx`)
}

/* ────────────────────────────────────────────────────────
   PDF EXPORT
──────────────────────────────────────────────────────── */
export function exportPDF({ incomes, expenses, month, year }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const mName = MONTHS[month]
  const fin = calcFin(incomes, expenses)

  const BG    = [10, 10, 11]
  const SURF  = [17, 17, 19]
  const SURF2 = [24, 24, 27]
  const GREEN = [34, 197, 94]
  const RED   = [244, 63, 94]
  const AMBER = [245, 158, 11]
  const WHITE = [250, 250, 250]
  const GRAY  = [161, 161, 170]
  const MUTED = [82, 82, 91]
  const BORDER= [39, 39, 42]
  const W = 210
  const H = 297

  // Background
  doc.setFillColor(...BG)
  doc.rect(0, 0, W, H, 'F')

  // Header bar
  doc.setFillColor(...SURF)
  doc.rect(0, 0, W, 28, 'F')
  doc.setFillColor(...BORDER)
  doc.rect(0, 28, W, 0.3, 'F')

  // Logo badge
  doc.setFillColor(...SURF2)
  doc.roundedRect(14, 7, 14, 14, 2, 2, 'F')
  doc.setTextColor(...GREEN)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('T3', 21, 16, { align: 'center' })

  // Title
  doc.setTextColor(...WHITE)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Tres Studio', 32, 13)
  doc.setTextColor(...GRAY)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Reporte Financiero Mensual', 32, 20)

  // Period pill
  doc.setFillColor(...SURF2)
  doc.roundedRect(W - 55, 9, 41, 10, 3, 3, 'F')
  doc.setTextColor(...GREEN)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text(`${mName} ${year}`, W - 34.5, 15.5, { align: 'center' })

  let y = 38

  // ── KPI CARDS ROW ──────────────────────────────────────
  const kpis = [
    { label: 'Ingresos', value: fmtS(fin.tI), color: GREEN, sub: `${incomes.length} facturas` },
    { label: 'Egresos', value: fmtS(fin.tE), color: RED, sub: `${expenses.length} registros` },
    { label: 'Utilidad neta', value: fmtS(fin.util), color: fin.util >= 0 ? GREEN : RED, sub: 'Sin IVA' },
    { label: 'IVA neto', value: fmtS(fin.ivaN), color: AMBER, sub: fin.ivaN >= 0 ? 'A declarar' : 'A favor' },
  ]
  const cardW = (W - 28 - 9) / 4
  kpis.forEach((kpi, i) => {
    const x = 14 + i * (cardW + 3)
    doc.setFillColor(...SURF)
    doc.roundedRect(x, y, cardW, 22, 2, 2, 'F')
    // accent bar
    doc.setFillColor(...kpi.color)
    doc.roundedRect(x, y, 3, 22, 1, 1, 'F')
    // label
    doc.setTextColor(...MUTED)
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'bold')
    doc.text(kpi.label.toUpperCase(), x + 7, y + 7)
    // value
    doc.setTextColor(...WHITE)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(kpi.value, x + 7, y + 14)
    // sub
    doc.setTextColor(...MUTED)
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.text(kpi.sub, x + 7, y + 19)
  })
  y += 30

  // ── SECOND KPI ROW ──────────────────────────────────────
  const kpis2 = [
    { label: 'Base ingresos', value: fmtS(fin.tIb) },
    { label: 'IVA cobrado', value: fmtS(fin.tIVAc) },
    { label: 'Base egresos', value: fmtS(fin.tEb) },
    { label: 'Caja disponible', value: fmtS(fin.caja) },
  ]
  kpis2.forEach((kpi, i) => {
    const x = 14 + i * (cardW + 3)
    doc.setFillColor(...SURF)
    doc.roundedRect(x, y, cardW, 14, 2, 2, 'F')
    doc.setTextColor(...MUTED)
    doc.setFontSize(6)
    doc.setFont('helvetica', 'bold')
    doc.text(kpi.label.toUpperCase(), x + 5, y + 5.5)
    doc.setTextColor(...GRAY)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(kpi.value, x + 5, y + 11)
  })
  y += 22

  // ── INCOMES TABLE ──────────────────────────────────────
  doc.setTextColor(...GREEN)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('● INGRESOS DEL MES', 14, y)
  y += 5

  autoTable(doc, {
    startY: y,
    head: [['Cliente', 'Proyecto', 'Fecha', 'Monto', 'Base', 'IVA', 'Estado']],
    body: incomes.map(i => [
      i.client, i.project, i.date,
      fmtS(Number(i.amount)), fmtS(getBase(i)), i.hasIVA ? fmtS(getIVA(i)) : '—', i.status
    ]),
    foot: [['', '', 'TOTAL',
      fmtS(incomes.reduce((s, i) => s + Number(i.amount), 0)),
      fmtS(incomes.reduce((s, i) => s + getBase(i), 0)),
      fmtS(incomes.reduce((s, i) => s + getIVA(i), 0)),
      ''
    ]],
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 7.5, textColor: [161, 161, 170], cellPadding: 3 },
    headStyles: { textColor: [82, 82, 91], fontStyle: 'bold', fontSize: 6.5, fillColor: [17, 17, 19], halign: 'left' },
    footStyles: { textColor: [34, 197, 94], fontStyle: 'bold', fillColor: [17, 17, 19] },
    alternateRowStyles: { fillColor: [24, 24, 27] },
    bodyStyles: { fillColor: [17, 17, 19] },
    columnStyles: { 3: { textColor: WHITE, fontStyle: 'bold' }, 0: { textColor: WHITE } },
    margin: { left: 14, right: 14 },
    tableLineColor: BORDER,
    tableLineWidth: 0.1,
  })
  y = doc.lastAutoTable.finalY + 10

  // Check if we need a new page
  if (y > 220) { doc.addPage(); doc.setFillColor(...BG); doc.rect(0, 0, W, H, 'F'); y = 14 }

  // ── EXPENSES TABLE ──────────────────────────────────────
  doc.setTextColor(...RED)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('● EGRESOS DEL MES', 14, y)
  y += 5

  autoTable(doc, {
    startY: y,
    head: [['Fecha', 'Categoría', 'Descripción', 'Proveedor', 'Monto', 'IVA']],
    body: expenses.map(e => [
      e.date, e.cat, e.desc || e.description, e.provider,
      fmtS(Number(e.amount)), e.hasIVA ? fmtS(getIVA(e)) : '—'
    ]),
    foot: [['', '', '', 'TOTAL',
      fmtS(expenses.reduce((s, e) => s + Number(e.amount), 0)),
      fmtS(expenses.reduce((s, e) => s + getIVA(e), 0)),
    ]],
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 7.5, textColor: [161, 161, 170], cellPadding: 3 },
    headStyles: { textColor: [82, 82, 91], fontStyle: 'bold', fontSize: 6.5, fillColor: [17, 17, 19], halign: 'left' },
    footStyles: { textColor: [244, 63, 94], fontStyle: 'bold', fillColor: [17, 17, 19] },
    alternateRowStyles: { fillColor: [24, 24, 27] },
    bodyStyles: { fillColor: [17, 17, 19] },
    columnStyles: { 4: { textColor: WHITE, fontStyle: 'bold' }, 0: { textColor: GRAY } },
    margin: { left: 14, right: 14 },
    tableLineColor: BORDER,
    tableLineWidth: 0.1,
  })

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFillColor(...SURF)
    doc.rect(0, H - 12, W, 12, 'F')
    doc.setTextColor(...MUTED)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(`Tres Studio · Reporte ${mName} ${year} · Generado el ${new Date().toLocaleDateString('es-CO')}`, 14, H - 5)
    doc.text(`${i} / ${pageCount}`, W - 14, H - 5, { align: 'right' })
  }

  doc.save(`TresStudio_${mName}_${year}.pdf`)
}
