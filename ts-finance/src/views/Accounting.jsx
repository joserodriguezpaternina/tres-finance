import { useMemo, useState } from 'react'
import {
  BookOpen, BookMarked, Scale, BarChart2, FileDown, Search,
  ChevronDown, ChevronRight, CheckCircle2, AlertTriangle,
  TrendingUp, TrendingDown,
} from 'lucide-react'
import {
  ComposedChart, Bar, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { T, CHART, MONTHS, MONTHS_SHORT, fmtS } from '../constants.js'
import { Tip, EmptyState } from '../ui.jsx'
import {
  buildJournal, buildLedger, buildBalance, buildPnL,
  journalToCSV, ledgerToCSV, balanceToCSV, pnlToCSV,
} from '../accounting.js'

/* ── Helpers ───────────────────────────────────────────────────────────── */

const MONO = "'DM Mono',monospace"

function fmtDate(dateStr) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })
}

function downloadCSV(csv, filename) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/* ── Shared micro-components ───────────────────────────────────────────── */

const microLbl = {
  fontSize: 10, fontWeight: 600, color: T.muted,
  textTransform: "uppercase", letterSpacing: ".07em",
}

const cardS = {
  background: T.surf, border: `1px solid ${T.border}`,
  borderRadius: 14,
}

function CodeChip({ code }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, fontFamily: MONO,
      padding: "2px 7px", borderRadius: 6,
      background: T.surf2, border: `1px solid ${T.border}`,
      color: T.text2, whiteSpace: "nowrap",
    }}>
      {code}
    </span>
  )
}

function Th({ children, right, width }) {
  return (
    <th style={{
      ...microLbl, textAlign: right ? "right" : "left",
      padding: "10px 14px", borderBottom: `1px solid ${T.border}`,
      whiteSpace: "nowrap", width,
    }}>
      {children}
    </th>
  )
}

function Money({ value, color, bold }) {
  return (
    <span style={{
      fontFamily: MONO, fontSize: 12, fontWeight: bold ? 700 : 500,
      color: color || T.text, whiteSpace: "nowrap",
    }}>
      {value === 0 || value === null || value === undefined ? "—" : fmtS(value)}
    </span>
  )
}

/* ── Tab 1: Libro diario ───────────────────────────────────────────────── */

function LibroDiario({ journal }) {
  const [q, setQ] = useState("")

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return journal
    return journal.filter(a =>
      (a.tercero || "").toLowerCase().includes(needle) ||
      (a.concepto || "").toLowerCase().includes(needle) ||
      (a.doc || "").toLowerCase().includes(needle)
    )
  }, [journal, q])

  const totals = useMemo(() => filtered.reduce((acc, a) => {
    a.rows.forEach(r => { acc.debit += r.debit; acc.credit += r.credit })
    return acc
  }, { debit: 0, credit: 0 }), [filtered])

  return (
    <div style={{ ...cardS, overflow: "hidden" }}>
      {/* header + search */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, padding: "16px 20px", borderBottom: `1px solid ${T.border}`, flexWrap: "wrap",
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Libro diario</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
            {filtered.length} asiento{filtered.length !== 1 ? "s" : ""} · partida doble
          </div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: T.surf2, border: `1px solid ${T.border}`,
          borderRadius: 9, padding: "7px 11px", minWidth: 220,
        }}>
          <Search size={13} color={T.muted} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar tercero, concepto o documento…"
            style={{
              flex: 1, border: "none", outline: "none", background: "transparent",
              fontSize: 12, color: T.text, fontFamily: "inherit",
            }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Sin asientos en el período"
          sub={q ? "Ningún asiento coincide con la búsqueda." : "Registra ingresos o egresos para generar el libro diario."}
        />
      ) : (
        <div className="tbl-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead>
              <tr>
                <Th width={80}>Fecha</Th>
                <Th width={110}>Documento</Th>
                <Th>Tercero / Concepto</Th>
                <Th>Cuenta</Th>
                <Th right width={130}>Debe</Th>
                <Th right width={130}>Haber</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <AsientoBlock key={a.id} asiento={a} />
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: T.surf2 }}>
                <td colSpan={4} style={{ padding: "12px 14px", borderTop: `2px solid ${T.border2}` }}>
                  <span style={microLbl}>Sumas iguales</span>
                </td>
                <td style={{ padding: "12px 14px", textAlign: "right", borderTop: `2px solid ${T.border2}` }}>
                  <Money value={totals.debit} bold />
                </td>
                <td style={{ padding: "12px 14px", textAlign: "right", borderTop: `2px solid ${T.border2}` }}>
                  <Money value={totals.credit} bold />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

function AsientoBlock({ asiento }) {
  const [hover, setHover] = useState(false)
  const isInc = asiento.doc.startsWith("ING")
  return (
    <>
      <tr
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ background: hover ? T.surf2 : "transparent", transition: "background .12s" }}
      >
        <td style={{ padding: "11px 14px 4px", verticalAlign: "top" }}>
          <span style={{ fontSize: 11, color: T.text2, fontFamily: MONO, whiteSpace: "nowrap" }}>
            {fmtDate(asiento.date)}
          </span>
        </td>
        <td style={{ padding: "11px 14px 4px", verticalAlign: "top" }}>
          <span style={{
            fontSize: 10, fontWeight: 600, fontFamily: MONO, padding: "2px 7px",
            borderRadius: 6, whiteSpace: "nowrap",
            background: isInc ? T.greenBg : T.redBg,
            color: isInc ? T.green : T.red,
          }}>
            {asiento.doc}
          </span>
        </td>
        <td colSpan={4} style={{ padding: "11px 14px 4px" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{asiento.tercero}</span>
          <span style={{ fontSize: 11, color: T.muted }}> · {asiento.concepto}</span>
        </td>
      </tr>
      {asiento.rows.map((row, i) => (
        <tr
          key={i}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{ background: hover ? T.surf2 : "transparent", transition: "background .12s" }}
        >
          <td colSpan={3} style={{
            padding: i === asiento.rows.length - 1 ? "3px 14px 11px" : "3px 14px",
            borderBottom: i === asiento.rows.length - 1 ? `1px solid ${T.border}` : "none",
          }} />
          <td style={{
            padding: i === asiento.rows.length - 1 ? "3px 14px 11px" : "3px 14px",
            borderBottom: i === asiento.rows.length - 1 ? `1px solid ${T.border}` : "none",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              paddingLeft: row.credit > 0 ? 18 : 0,   /* sangría contable del haber */
            }}>
              <CodeChip code={row.account} />
              <span style={{ fontSize: 12, color: T.text2, whiteSpace: "nowrap" }}>{row.accountName}</span>
            </div>
          </td>
          <td style={{
            padding: i === asiento.rows.length - 1 ? "3px 14px 11px" : "3px 14px",
            textAlign: "right",
            borderBottom: i === asiento.rows.length - 1 ? `1px solid ${T.border}` : "none",
          }}>
            <Money value={row.debit || null} />
          </td>
          <td style={{
            padding: i === asiento.rows.length - 1 ? "3px 14px 11px" : "3px 14px",
            textAlign: "right",
            borderBottom: i === asiento.rows.length - 1 ? `1px solid ${T.border}` : "none",
          }}>
            <Money value={row.credit || null} />
          </td>
        </tr>
      ))}
    </>
  )
}

/* ── Tab 2: Libro mayor ────────────────────────────────────────────────── */

function LibroMayor({ ledger }) {
  const [expanded, setExpanded] = useState(() => new Set())
  const toggle = code => setExpanded(prev => {
    const next = new Set(prev)
    next.has(code) ? next.delete(code) : next.add(code)
    return next
  })

  if (ledger.length === 0) {
    return (
      <div style={cardS}>
        <EmptyState icon={BookMarked} title="Sin movimientos en el período" sub="El libro mayor se construye a partir de los asientos del diario." />
      </div>
    )
  }

  return (
    <div style={{ ...cardS, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Libro mayor</div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
          {ledger.length} cuenta{ledger.length !== 1 ? "s" : ""} con movimiento · clic para ver el auxiliar
        </div>
      </div>
      <div className="tbl-wrap">
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr>
              <Th>Cuenta</Th>
              <Th width={90}>Naturaleza</Th>
              <Th right width={130}>Debe</Th>
              <Th right width={130}>Haber</Th>
              <Th right width={130}>Saldo</Th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((acc, idx) => {
              const open = expanded.has(acc.account)
              const debitNature = acc.nature === "debit"
              return (
                <AccountRows
                  key={acc.account}
                  acc={acc}
                  open={open}
                  debitNature={debitNature}
                  onToggle={() => toggle(acc.account)}
                  last={idx === ledger.length - 1}
                />
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AccountRows({ acc, open, debitNature, onToggle, last }) {
  const [hover, setHover] = useState(false)
  return (
    <>
      <tr
        onClick={onToggle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          cursor: "pointer",
          background: open ? T.surf2 : hover ? T.surf2 : "transparent",
          transition: "background .12s",
        }}
      >
        <td style={{ padding: "13px 14px", borderBottom: !open && !last ? `1px solid ${T.border}` : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            {open
              ? <ChevronDown size={13} color={T.muted} style={{ flexShrink: 0 }} />
              : <ChevronRight size={13} color={T.muted} style={{ flexShrink: 0 }} />}
            <CodeChip code={acc.account} />
            <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{acc.accountName}</span>
            <span style={{ fontSize: 10, color: T.muted }}>
              {acc.rows.length} mov.
            </span>
          </div>
        </td>
        <td style={{ padding: "13px 14px", borderBottom: !open && !last ? `1px solid ${T.border}` : "none" }}>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
            background: debitNature ? T.blueBg : T.violetBg,
            color: debitNature ? T.blue : T.violet,
            whiteSpace: "nowrap",
          }}>
            {debitNature ? "Débito" : "Crédito"}
          </span>
        </td>
        <td style={{ padding: "13px 14px", textAlign: "right", borderBottom: !open && !last ? `1px solid ${T.border}` : "none" }}>
          <Money value={acc.debit || null} />
        </td>
        <td style={{ padding: "13px 14px", textAlign: "right", borderBottom: !open && !last ? `1px solid ${T.border}` : "none" }}>
          <Money value={acc.credit || null} />
        </td>
        <td style={{ padding: "13px 14px", textAlign: "right", borderBottom: !open && !last ? `1px solid ${T.border}` : "none" }}>
          <Money value={acc.saldo} bold color={acc.saldo >= 0 ? T.text : T.red} />
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={5} style={{ padding: 0, borderBottom: !last ? `1px solid ${T.border}` : "none", background: T.surf2 }}>
            <div style={{ padding: "4px 14px 14px 36px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <Th width={70}>Fecha</Th>
                    <Th width={100}>Documento</Th>
                    <Th>Detalle</Th>
                    <Th right width={120}>Debe</Th>
                    <Th right width={120}>Haber</Th>
                  </tr>
                </thead>
                <tbody>
                  {acc.rows.map((m, i) => (
                    <tr key={i}>
                      <td style={{ padding: "8px 14px", borderBottom: i < acc.rows.length - 1 ? `1px solid ${T.border}` : "none" }}>
                        <span style={{ fontSize: 11, color: T.text2, fontFamily: MONO }}>{fmtDate(m.date)}</span>
                      </td>
                      <td style={{ padding: "8px 14px", borderBottom: i < acc.rows.length - 1 ? `1px solid ${T.border}` : "none" }}>
                        <span style={{ fontSize: 10, fontFamily: MONO, color: T.muted }}>{m.doc}</span>
                      </td>
                      <td style={{ padding: "8px 14px", borderBottom: i < acc.rows.length - 1 ? `1px solid ${T.border}` : "none" }}>
                        <span style={{ fontSize: 11, color: T.text2 }}>{m.tercero}</span>
                        <span style={{ fontSize: 11, color: T.muted }}> · {m.concepto}</span>
                      </td>
                      <td style={{ padding: "8px 14px", textAlign: "right", borderBottom: i < acc.rows.length - 1 ? `1px solid ${T.border}` : "none" }}>
                        <Money value={m.debit || null} />
                      </td>
                      <td style={{ padding: "8px 14px", textAlign: "right", borderBottom: i < acc.rows.length - 1 ? `1px solid ${T.border}` : "none" }}>
                        <Money value={m.credit || null} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

/* ── Tab 3: Balance general ────────────────────────────────────────────── */

function BalanceCol({ title, items, total, accent }) {
  return (
    <div style={{ ...cardS, padding: "20px 22px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={microLbl}>{title}</span>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: accent, display: "inline-block" }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {items.length === 0 && (
          <div style={{ fontSize: 12, color: T.muted, padding: "10px 0" }}>Sin partidas en el período</div>
        )}
        {items.map((x, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            gap: 10, padding: "10px 0",
            borderBottom: `1px solid ${T.border}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <CodeChip code={x.code} />
              <span style={{ fontSize: 12, color: T.text2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.name}</span>
            </div>
            <Money value={x.value} color={x.value < 0 ? T.red : T.text} />
          </div>
        ))}
      </div>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginTop: 12, paddingTop: 12, borderTop: `2px solid ${T.border2}`,
      }}>
        <span style={{ ...microLbl, color: T.text2 }}>Total {title.toLowerCase()}</span>
        <span style={{ fontSize: 16, fontWeight: 700, fontFamily: MONO, color: total < 0 ? T.red : T.text, letterSpacing: "-.3px" }}>
          {fmtS(total)}
        </span>
      </div>
    </div>
  )
}

function BalanceGeneral({ balance, year }) {
  const ok = balance.cuadra
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="g3" style={{ gap: 16 }}>
        <BalanceCol title="Activos" items={balance.activos} total={balance.totalActivos} accent={T.green} />
        <BalanceCol title="Pasivos" items={balance.pasivos} total={balance.totalPasivos} accent={T.red} />
        <BalanceCol title="Patrimonio" items={balance.patrimonio} total={balance.totalPatrimonio} accent={T.blue} />
      </div>

      {/* Ecuación contable */}
      <div style={{
        ...cardS, padding: "16px 22px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 14, flexWrap: "wrap",
        borderLeft: `3px solid ${ok ? T.green : T.red}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Scale size={15} color={T.muted} />
          <span style={microLbl}>Ecuación contable · acumulado {year}</span>
          <span style={{ fontSize: 13, fontFamily: MONO, color: T.text, fontWeight: 600 }}>
            {fmtS(balance.totalActivos)}
            <span style={{ color: T.muted, fontWeight: 400 }}> = </span>
            {fmtS(balance.totalPasivos)}
            <span style={{ color: T.muted, fontWeight: 400 }}> + </span>
            {fmtS(balance.totalPatrimonio)}
          </span>
        </div>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 999,
          background: ok ? T.greenBg : T.redBg,
          color: ok ? T.green : T.red,
        }}>
          {ok ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
          {ok ? "✓ El balance cuadra" : "✗ Descuadre detectado"}
        </span>
      </div>
    </div>
  )
}

/* ── Tab 4: Estado de resultados ───────────────────────────────────────── */

function EstadoResultados({ pnl, allInc, allExp, year, month }) {
  const monthlyUtil = useMemo(() =>
    Array.from({ length: 12 }, (_, m) => {
      const p = buildPnL(allInc, allExp, year, m)
      return { name: MONTHS_SHORT[m], ingresos: p.ingresos, utilidad: p.utilidadBruta }
    }),
    [allInc, allExp, year]
  )

  const positive = pnl.utilidadBruta >= 0
  const periodLabel = month === null ? `Año completo ${year}` : `${MONTHS[month]} ${year}`

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ ...cardS, padding: "22px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Estado de resultados</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{periodLabel} · valores base sin IVA</div>
          </div>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 999,
            background: positive ? T.greenBg : T.redBg,
            color: positive ? T.green : T.red,
          }}>
            {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            Margen {pnl.margen}%
          </span>
        </div>

        {/* Ingresos */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "12px 0", borderBottom: `1px solid ${T.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <CodeChip code="4135" />
            <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Ingresos operacionales</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, fontFamily: MONO, color: T.green }}>{fmtS(pnl.ingresos)}</span>
        </div>

        {/* Gastos por categoría */}
        <div style={{ padding: "12px 0 4px" }}>
          <div style={{ ...microLbl, marginBottom: 8 }}>(−) Gastos operacionales</div>
          {pnl.gastosPorCat.length === 0 && (
            <div style={{ fontSize: 12, color: T.muted, padding: "6px 0 10px" }}>Sin gastos registrados en el período</div>
          )}
          {pnl.gastosPorCat.map(g => (
            <div key={g.cat} style={{ padding: "7px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <CodeChip code={g.code} />
                  <span style={{ fontSize: 12, color: T.text2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.cat}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, color: T.muted, fontFamily: MONO }}>{g.pct}%</span>
                  <span style={{ fontSize: 12, fontWeight: 600, fontFamily: MONO, color: T.red }}>−{fmtS(g.value)}</span>
                </div>
              </div>
              <div style={{ height: 3, borderRadius: 4, background: T.surf3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(g.pct, 100)}%`, background: T.red, opacity: .55, borderRadius: 4 }} />
              </div>
            </div>
          ))}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "11px 0", marginTop: 6, borderTop: `1px solid ${T.border}`,
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.text2 }}>Total gastos operacionales</span>
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: T.red }}>−{fmtS(pnl.totalGastos)}</span>
          </div>
        </div>

        {/* Utilidad */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "14px 16px", marginTop: 8, borderRadius: 12,
          background: positive ? T.greenBg : T.redBg,
          border: `1px solid ${positive ? "rgba(30,158,90,.2)" : "rgba(229,72,77,.2)"}`,
        }}>
          <span style={{ ...microLbl, color: positive ? T.green : T.red }}>= Utilidad operacional</span>
          <span style={{ fontSize: 20, fontWeight: 700, fontFamily: MONO, letterSpacing: "-.4px", color: positive ? T.green : T.red }}>
            {fmtS(pnl.utilidadBruta)}
          </span>
        </div>
      </div>

      {/* Comparativo mensual */}
      <div style={{ ...cardS, padding: "22px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Utilidad mensual {year}</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Ingresos base vs utilidad operacional</div>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            {[["Ingresos", CHART.inc], ["Utilidad", CHART.profit]].map(([l, c]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block" }} />
                <span style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={monthlyUtil} barSize={12}>
            <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 10, fill: T.muted, fontFamily: MONO }}
              axisLine={false} tickLine={false}
              tickFormatter={v => fmtS(v)} width={64}
            />
            <Tooltip content={<Tip />} />
            <Bar dataKey="ingresos" name="Ingresos" fill={CHART.inc} radius={[4, 4, 0, 0]} />
            <Area
              type="monotone" dataKey="utilidad" name="Utilidad"
              fill="rgba(30,158,90,.08)" stroke={CHART.profit} strokeWidth={2} dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ── Main view ─────────────────────────────────────────────────────────── */

const TABS = [
  { id: "diario", label: "Libro diario", icon: BookOpen },
  { id: "mayor", label: "Libro mayor", icon: BookMarked },
  { id: "balance", label: "Balance general", icon: Scale },
  { id: "pyg", label: "Estado de resultados", icon: BarChart2 },
]

export default function AccountingView({ allInc, allExp, year, month }) {
  const [tab, setTab] = useState("diario")
  const [selMonth, setSelMonth] = useState(null)   /* null = todo el año */

  /* Datos del período (año + mes opcional) */
  const inc = useMemo(() => allInc.filter(i => {
    const d = new Date(i.date)
    return d.getFullYear() === year && (selMonth === null || d.getMonth() === selMonth)
  }), [allInc, year, selMonth])

  const exp = useMemo(() => allExp.filter(e => {
    const d = new Date(e.date)
    return d.getFullYear() === year && (selMonth === null || d.getMonth() === selMonth)
  }), [allExp, year, selMonth])

  const journal = useMemo(() => buildJournal(inc, exp), [inc, exp])
  const ledger = useMemo(() => buildLedger(journal), [journal])
  const balance = useMemo(() => buildBalance(allInc, allExp, year), [allInc, allExp, year])
  const pnl = useMemo(() => buildPnL(allInc, allExp, year, selMonth), [allInc, allExp, year, selMonth])

  const handleExport = () => {
    const suffix = selMonth === null ? `${year}` : `${year}-${String(selMonth + 1).padStart(2, "0")}`
    if (tab === "diario") downloadCSV(journalToCSV(journal), `libro-diario-${suffix}.csv`)
    else if (tab === "mayor") downloadCSV(ledgerToCSV(ledger), `libro-mayor-${suffix}.csv`)
    else if (tab === "balance") downloadCSV(balanceToCSV(balance, year), `balance-general-${year}.csv`)
    else downloadCSV(pnlToCSV(pnl, year, selMonth), `estado-resultados-${suffix}.csv`)
  }

  const periodLabel = selMonth === null ? `Año ${year}` : `${MONTHS[selMonth]} ${year}`

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Header: title + tabs ───────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, letterSpacing: "-.2px" }}>Contabilidad</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
            Partida doble · PUC simplificado · {periodLabel}
          </div>
        </div>
        <div style={{
          display: "inline-flex", gap: 2, padding: 3, borderRadius: 11,
          background: T.surf2, border: `1px solid ${T.border}`,
        }}>
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 13px", borderRadius: 9, cursor: "pointer",
                  fontSize: 12, fontWeight: active ? 600 : 500, fontFamily: "inherit",
                  background: active ? T.surf : "transparent",
                  color: active ? T.text : T.muted,
                  border: active ? `1px solid ${T.border}` : "1px solid transparent",
                  transition: "background .12s, color .12s",
                  whiteSpace: "nowrap",
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Period filter + export ─────────────────────────────────────── */}
      <div style={{
        ...cardS, padding: "12px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ ...microLbl, marginRight: 4 }}>Período</span>
          <button
            onClick={() => setSelMonth(null)}
            style={{
              padding: "5px 12px", borderRadius: 999, cursor: "pointer",
              fontSize: 11, fontWeight: 600, fontFamily: "inherit",
              background: selMonth === null ? T.accent : T.surf2,
              color: selMonth === null ? T.accentText : T.text2,
              border: `1px solid ${selMonth === null ? T.accent : T.border}`,
              transition: "background .12s",
            }}
          >
            Todo el año
          </button>
          {MONTHS_SHORT.map((m, i) => {
            const active = selMonth === i
            return (
              <button
                key={m}
                onClick={() => setSelMonth(i)}
                style={{
                  padding: "5px 10px", borderRadius: 999, cursor: "pointer",
                  fontSize: 11, fontWeight: active ? 600 : 500, fontFamily: "inherit",
                  background: active ? T.accent : T.surf2,
                  color: active ? T.accentText : T.text2,
                  border: `1px solid ${active ? T.accent : T.border}`,
                  transition: "background .12s",
                }}
              >
                {m}
              </button>
            )
          })}
        </div>
        <button
          onClick={handleExport}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 9, cursor: "pointer",
            fontSize: 12, fontWeight: 600, fontFamily: "inherit",
            background: T.surf, color: T.text2,
            border: `1px solid ${T.border}`,
          }}
        >
          <FileDown size={13} />
          Exportar CSV
        </button>
      </div>

      {/* ── Active tab ─────────────────────────────────────────────────── */}
      {tab === "diario" && <LibroDiario journal={journal} />}
      {tab === "mayor" && <LibroMayor ledger={ledger} />}
      {tab === "balance" && <BalanceGeneral balance={balance} year={year} />}
      {tab === "pyg" && (
        <EstadoResultados pnl={pnl} allInc={allInc} allExp={allExp} year={year} month={selMonth} />
      )}

      {tab === "balance" && selMonth !== null && (
        <div style={{ fontSize: 11, color: T.muted, textAlign: "center" }}>
          El balance general siempre se presenta acumulado al año (YTD) — el filtro de mes no aplica en esta pestaña.
        </div>
      )}
    </div>
  )
}
