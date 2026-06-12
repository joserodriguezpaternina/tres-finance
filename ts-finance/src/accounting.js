/* ─── MOTOR CONTABLE — tres Finance® ──────────────────────────────────────
   Partida doble sobre ingresos/egresos del dataService.
   Genera: Libro diario, Libro mayor, Balance general y Estado de resultados,
   más exportadores CSV (separador ";" — Excel es-CO).
   ─────────────────────────────────────────────────────────────────────── */
import { PUC, PUC_GASTOS, getIVA, getBase, calcFin, MONTHS } from './constants.js'

const r = n => Math.round(n)            /* COP sin decimales */
const r2 = n => Math.round(n * 100) / 100

/* Naturaleza de la cuenta según primer dígito PUC:
   1 (activo), 5/6 (gasto/costo) → débito · 2/3/4 (pasivo/patrimonio/ingreso) → crédito */
export const accountNature = code =>
  ["1", "5", "6"].includes(String(code).charAt(0)) ? "debit" : "credit"

/* ── Libro diario ──────────────────────────────────────────────────────── */
export function buildJournal(incomes = [], expenses = []) {
  const asientos = []

  incomes.forEach(i => {
    const iva = r2(getIVA(i))
    const base = r2(Number(i.amount) - iva)   /* base + iva = total exacto */
    const cobrado = i.status === "Pagado"
    const debitAcc = cobrado ? PUC.caja : PUC.clientes
    const rows = [
      { account: debitAcc.code, accountName: debitAcc.name, debit: r2(Number(i.amount)), credit: 0 },
      { account: PUC.ingresos.code, accountName: PUC.ingresos.name, debit: 0, credit: base },
    ]
    if (iva > 0) rows.push({ account: PUC.ivaGen.code, accountName: PUC.ivaGen.name, debit: 0, credit: iva })
    asientos.push({
      id: `j-ing-${i.id}`,
      date: i.date,
      doc: `ING-${String(i.id).slice(-6).toUpperCase()}`,
      tercero: i.client || "Sin cliente",
      concepto: `Ingreso por servicios${i.project ? ` — ${i.project}` : ""}${cobrado ? "" : " (causado)"}`,
      rows,
    })
  })

  expenses.forEach(e => {
    const iva = r2(getIVA(e))
    const base = r2(Number(e.amount) - iva)
    const gasto = PUC_GASTOS[e.cat] || PUC_GASTOS["Otros"]
    const rows = [
      { account: gasto.code, accountName: gasto.name, debit: base, credit: 0 },
    ]
    if (iva > 0) rows.push({ account: PUC.ivaDesc.code, accountName: PUC.ivaDesc.name, debit: iva, credit: 0 })
    rows.push({ account: PUC.caja.code, accountName: PUC.caja.name, debit: 0, credit: r2(Number(e.amount)) })
    asientos.push({
      id: `j-egr-${e.id}`,
      date: e.date,
      doc: `EGR-${String(e.id).slice(-6).toUpperCase()}`,
      tercero: e.provider || "Sin proveedor",
      concepto: e.desc || e.cat || "Egreso",
      rows,
    })
  })

  return asientos.sort((a, b) => new Date(a.date) - new Date(b.date) || a.doc.localeCompare(b.doc))
}

/* Verificación: todo asiento debe cuadrar (debe === haber, tolerancia 1 peso) */
export const isBalanced = asiento => {
  const d = asiento.rows.reduce((s, x) => s + x.debit, 0)
  const c = asiento.rows.reduce((s, x) => s + x.credit, 0)
  return Math.abs(d - c) < 1
}

/* ── Libro mayor ───────────────────────────────────────────────────────── */
export function buildLedger(journal = []) {
  const map = {}
  journal.forEach(a => {
    a.rows.forEach(row => {
      if (!map[row.account]) {
        map[row.account] = {
          account: row.account, accountName: row.accountName,
          nature: accountNature(row.account),
          debit: 0, credit: 0, saldo: 0, rows: [],
        }
      }
      const acc = map[row.account]
      acc.debit += row.debit
      acc.credit += row.credit
      acc.rows.push({
        date: a.date, doc: a.doc, tercero: a.tercero, concepto: a.concepto,
        debit: row.debit, credit: row.credit,
      })
    })
  })
  return Object.values(map)
    .map(acc => ({
      ...acc,
      debit: r2(acc.debit),
      credit: r2(acc.credit),
      saldo: r2(acc.nature === "debit" ? acc.debit - acc.credit : acc.credit - acc.debit),
      rows: acc.rows.sort((a, b) => new Date(a.date) - new Date(b.date)),
    }))
    .sort((a, b) => a.account.localeCompare(b.account))
}

/* ── Balance general (YTD del año) ─────────────────────────────────────── */
export function buildBalance(incomes = [], expenses = [], year) {
  const inc = incomes.filter(i => new Date(i.date).getFullYear() === year)
  const exp = expenses.filter(e => new Date(e.date).getFullYear() === year)
  const f = calcFin(inc, exp)

  const caja = f.cobr - f.tE                                /* cobrado acumulado − egresos */
  const cxc = inc.filter(i => i.status === "Pendiente" || i.status === "Parcial")
    .reduce((s, i) => s + Number(i.amount), 0)

  const activos = [
    { code: PUC.caja.code, name: PUC.caja.name, value: r(caja) },
    { code: PUC.clientes.code, name: PUC.clientes.name, value: r(cxc) },
  ]
  /* IVA neto: > 0 → pasivo por pagar · < 0 → saldo a favor (activo) */
  if (f.ivaN < 0) activos.push({ code: PUC.ivaDesc.code, name: "IVA a favor (descontable)", value: r(-f.ivaN) })

  const pasivos = f.ivaN > 0
    ? [{ code: PUC.ivaGen.code, name: "IVA neto por pagar", value: r(f.ivaN) }]
    : []

  const patrimonio = [
    { code: PUC.utilidad.code, name: PUC.utilidad.name, value: r(f.util) },
  ]

  const totalActivos = activos.reduce((s, x) => s + x.value, 0)
  const totalPasivos = pasivos.reduce((s, x) => s + x.value, 0)
  const totalPatrimonio = patrimonio.reduce((s, x) => s + x.value, 0)

  return {
    activos, pasivos, patrimonio,
    totalActivos, totalPasivos, totalPatrimonio,
    cuadra: Math.abs(totalActivos - (totalPasivos + totalPatrimonio)) < 2,
  }
}

/* ── Estado de resultados (P&L) ────────────────────────────────────────── */
export function buildPnL(incomes = [], expenses = [], year, month = null) {
  const inYear = d => new Date(d).getFullYear() === year
  const inPeriod = d => inYear(d) && (month === null || new Date(d).getMonth() === month)

  const inc = incomes.filter(i => inPeriod(i.date))
  const exp = expenses.filter(e => inPeriod(e.date))

  const ingresos = r(inc.reduce((s, i) => s + getBase(i), 0))

  const byCat = {}
  exp.forEach(e => {
    const cat = e.cat || "Otros"
    byCat[cat] = (byCat[cat] || 0) + getBase(e)
  })
  const totalGastos = r(Object.values(byCat).reduce((s, v) => s + v, 0))
  const gastosPorCat = Object.entries(byCat)
    .map(([cat, value]) => ({
      cat,
      code: (PUC_GASTOS[cat] || PUC_GASTOS["Otros"]).code,
      value: r(value),
      pct: totalGastos > 0 ? r2((value / totalGastos) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value)

  const utilidadBruta = ingresos - totalGastos
  const margen = ingresos > 0 ? r2((utilidadBruta / ingresos) * 100) : 0

  return { ingresos, gastosPorCat, totalGastos, utilidadBruta, margen }
}

/* ── Exportadores CSV (";" — compatible Excel es-CO) ───────────────────── */
const esc = v => {
  const s = String(v ?? "")
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
const line = cells => cells.map(esc).join(";")

export function journalToCSV(journal = []) {
  const out = [line(["Fecha", "Documento", "Tercero", "Concepto", "Cuenta", "Nombre cuenta", "Debe", "Haber"])]
  journal.forEach(a => {
    a.rows.forEach(row => {
      out.push(line([a.date, a.doc, a.tercero, a.concepto, row.account, row.accountName, r(row.debit), r(row.credit)]))
    })
  })
  return out.join("\n")
}

export function ledgerToCSV(ledger = []) {
  const out = [line(["Cuenta", "Nombre cuenta", "Naturaleza", "Debe", "Haber", "Saldo"])]
  ledger.forEach(acc => {
    out.push(line([acc.account, acc.accountName, acc.nature === "debit" ? "Débito" : "Crédito", r(acc.debit), r(acc.credit), r(acc.saldo)]))
  })
  return out.join("\n")
}

export function balanceToCSV(balance, year) {
  const out = [line([`Balance general — ${year}`]), line(["Sección", "Código", "Cuenta", "Valor"])]
  balance.activos.forEach(x => out.push(line(["Activos", x.code, x.name, x.value])))
  out.push(line(["Activos", "", "TOTAL ACTIVOS", balance.totalActivos]))
  balance.pasivos.forEach(x => out.push(line(["Pasivos", x.code, x.name, x.value])))
  out.push(line(["Pasivos", "", "TOTAL PASIVOS", balance.totalPasivos]))
  balance.patrimonio.forEach(x => out.push(line(["Patrimonio", x.code, x.name, x.value])))
  out.push(line(["Patrimonio", "", "TOTAL PATRIMONIO", balance.totalPatrimonio]))
  return out.join("\n")
}

export function pnlToCSV(pnl, year, month = null) {
  const periodo = month === null ? `Año ${year}` : `${MONTHS[month]} ${year}`
  const out = [
    line([`Estado de resultados — ${periodo}`]),
    line(["Concepto", "Código", "Valor", "% gastos"]),
    line(["Ingresos operacionales", PUC.ingresos.code, pnl.ingresos, ""]),
  ]
  pnl.gastosPorCat.forEach(g => out.push(line([`(−) ${g.cat}`, g.code, -g.value, `${g.pct}%`])))
  out.push(line(["Total gastos operacionales", "", -pnl.totalGastos, ""]))
  out.push(line(["Utilidad operacional", "", pnl.utilidadBruta, ""]))
  out.push(line(["Margen operacional", "", `${pnl.margen}%`, ""]))
  return out.join("\n")
}
