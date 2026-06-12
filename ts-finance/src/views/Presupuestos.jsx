import { useMemo, useState, useEffect } from 'react'
import { PiggyBank, Target, TrendingUp, AlertTriangle, Plus } from 'lucide-react'
import {
  ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { T, CHART, MONTHS, MONTHS_SHORT, fmtS, filterM, EXP_CATS } from '../constants.js'
import { card, inp, lbl, KPI, Tip } from '../ui.jsx'
import { getBudget, setCatBudget, setMetaIngresos } from '../budgetService.js'
import { logAudit } from '../audit.js'

/* ── Helpers ────────────────────────────────────────────────────────────── */

const parseNum = v => Math.max(0, Number(String(v).replace(/[^\d.-]/g, "")) || 0)

/* Semáforo de ejecución: verde <85 · ámbar 85–100 · rojo >100 */
const execColor = p => p > 100 ? T.red : p >= 85 ? T.amber : T.green
const execBg    = p => p > 100 ? T.redBg : p >= 85 ? T.amberBg : T.greenBg

function MicroLabel({ children, style }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".07em", color: T.muted, ...style }}>
      {children}
    </span>
  )
}

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{title}</div>
      {subtitle && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{subtitle}</div>}
    </div>
  )
}

/* ── Barra de progreso con indicador de sobreejecución ─────────────────── */
function ProgressBar({ pct, height = 5 }) {
  const over = pct > 100
  const color = execColor(pct)
  return (
    <div style={{ position: "relative", height, borderRadius: 6, background: T.surf3, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${Math.min(pct, 100)}%`,
        background: color, borderRadius: 6,
        transition: "width .25s ease",
      }} />
      {over && (
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: 6,
          background: T.redD, borderRadius: "0 6px 6px 0",
        }} />
      )}
    </div>
  )
}

/* ── Input de presupuesto editable en línea ─────────────────────────────── */
function BudgetInput({ value, onCommit }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      defaultValue={value > 0 ? value : ""}
      placeholder="0"
      onBlur={e => onCommit(parseNum(e.target.value))}
      onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur() }}
      style={{
        ...inp, width: 130, padding: "7px 10px",
        fontFamily: "'DM Mono',monospace", fontSize: 12, fontWeight: 600,
        textAlign: "right", background: T.surf, color: T.text,
      }}
    />
  )
}

/* ── Vista principal ────────────────────────────────────────────────────── */

export default function PresupuestosView({ allInc, allExp, year, month }) {
  const [budget, setBudget] = useState(() => getBudget(year))
  const [extraCats, setExtraCats] = useState([])
  useEffect(() => { setBudget(getBudget(year)); setExtraCats([]) }, [year])

  /* Egresos reales del mes por categoría */
  const expMonth = useMemo(() => filterM(allExp, month, year), [allExp, month, year])
  const realByCat = useMemo(() => {
    const map = {}
    expMonth.forEach(e => { const k = e.cat || "Otros"; map[k] = (map[k] || 0) + Number(e.amount) })
    return map
  }, [expMonth])

  /* Egresos reales por mes (12) + run-rate de proyección */
  const realByMonth = useMemo(() =>
    Array.from({ length: 12 }, (_, i) =>
      filterM(allExp, i, year).reduce((s, e) => s + Number(e.amount), 0)
    ), [allExp, year])

  const runRate = useMemo(() => {
    const withData = realByMonth
      .map((v, i) => ({ v, i }))
      .filter(d => d.i <= month && d.v > 0)
      .slice(-3)
    if (!withData.length) return 0
    return Math.round(withData.reduce((s, d) => s + d.v, 0) / withData.length)
  }, [realByMonth, month])

  /* Totales y KPIs */
  const totalBudget = useMemo(() =>
    EXP_CATS.reduce((s, c) => s + (Number(budget.cats[c]) || 0), 0), [budget])
  const totalReal = expMonth.reduce((s, e) => s + Number(e.amount), 0)
  const execPct = totalBudget > 0 ? Math.round((totalReal / totalBudget) * 100) : 0

  const incYTD = useMemo(() =>
    allInc
      .filter(i => { const d = new Date(i.date); return d.getFullYear() === year && d.getMonth() <= month })
      .reduce((s, i) => s + Number(i.amount), 0),
    [allInc, year, month])
  const meta = Number(budget.metaIngresos) || 0
  const metaPct = meta > 0 ? Math.round((incYTD / meta) * 100) : 0
  const remaining = Math.max(0, meta - incYTD)
  const monthsLeft = Math.max(1, 12 - (month + 1))
  const neededPerMonth = remaining / monthsLeft

  /* Filas visibles: categorías con presupuesto, gasto del mes o agregadas */
  const rows = useMemo(() =>
    EXP_CATS.filter(c => (Number(budget.cats[c]) || 0) > 0 || (realByCat[c] || 0) > 0 || extraCats.includes(c)),
    [budget, realByCat, extraCats])
  const availableCats = EXP_CATS.filter(c => !rows.includes(c))

  /* Datos del gráfico anual */
  const chartData = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      name: MONTHS_SHORT[i],
      real: i <= month ? realByMonth[i] : null,
      presupuesto: totalBudget,
      proyeccion: i === month ? realByMonth[i] : i > month ? runRate : null,
    })), [realByMonth, totalBudget, month, runRate])

  /* Acciones */
  const commitCat = (cat, v) => {
    setBudget(setCatBudget(year, cat, v))
    logAudit("config", "presupuesto", `${cat} → ${fmtS(v)}`)
  }
  const commitMeta = v => {
    setBudget(setMetaIngresos(year, v))
    logAudit("config", "presupuesto", `Meta de ingresos ${year} → ${fmtS(v)}`)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── KPIs ─────────────────────────────────────────────────────── */}
      <div className="g4" style={{ gap: 16 }}>
        <KPI
          title="Presupuesto mensual total"
          value={fmtS(totalBudget)}
          sub={`${rows.filter(c => (budget.cats[c] || 0) > 0).length} categorías presupuestadas`}
          icon={PiggyBank}
          color={T.blue}
        />
        <KPI
          title={`Ejecutado · ${MONTHS[month]}`}
          value={fmtS(totalReal)}
          sub={totalBudget > 0 ? `de ${fmtS(totalBudget)} presupuestados` : "Sin presupuesto definido"}
          icon={TrendingUp}
          color={T.red}
        />
        <KPI
          title="% Ejecución del mes"
          value={totalBudget > 0 ? `${execPct}%` : "—"}
          sub={execPct > 100 ? "Presupuesto excedido" : execPct >= 85 ? "Cerca del límite" : "Dentro del presupuesto"}
          icon={execPct > 100 ? AlertTriangle : Target}
          color={execColor(execPct)}
          badge={totalBudget > 0 ? {
            label: execPct > 100 ? "Excedido" : execPct >= 85 ? "Alerta" : "En rango",
            bg: execBg(execPct), color: execColor(execPct),
          } : undefined}
        />
        <KPI
          title={`Meta de ingresos ${year}`}
          value={fmtS(meta)}
          sub={meta > 0 ? `${metaPct}% de avance YTD · ${fmtS(incYTD)}` : "Define una meta anual"}
          icon={Target}
          color={T.green}
        />
      </div>

      <div className="g2" style={{ gap: 16, alignItems: "start" }}>

        {/* ── Presupuesto por categoría ─────────────────────────────── */}
        <div style={{ ...card }}>
          <SectionHeader
            title="Presupuesto por categoría"
            subtitle={`Asignación mensual vs gasto real de ${MONTHS[month]} ${year}`}
          />

          {rows.length === 0 ? (
            <div style={{ textAlign: "center", padding: "36px 0", color: T.muted, fontSize: 13 }}>
              Sin categorías presupuestadas — agrega una para empezar
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* encabezado */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 8, borderBottom: `1px solid ${T.border}` }}>
                <MicroLabel style={{ flex: 1 }}>Categoría</MicroLabel>
                <MicroLabel style={{ width: 130, textAlign: "right" }}>Presupuesto</MicroLabel>
                <MicroLabel style={{ width: 110, textAlign: "right" }}>Real del mes</MicroLabel>
                <MicroLabel style={{ width: 100, textAlign: "right" }}>Variación</MicroLabel>
              </div>

              {rows.map(cat => {
                const b = Number(budget.cats[cat]) || 0
                const r = realByCat[cat] || 0
                const p = b > 0 ? Math.round((r / b) * 100) : (r > 0 ? 101 : 0)
                const variance = b - r
                return (
                  <div key={`${cat}-${year}`} style={{ padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {cat}
                        </div>
                        {b > 0 && (
                          <div style={{ fontSize: 10, fontWeight: 600, color: execColor(p), marginTop: 2, fontFamily: "'DM Mono',monospace" }}>
                            {p}% ejecutado
                          </div>
                        )}
                      </div>
                      <BudgetInput value={b} onCommit={v => { if (v !== b) commitCat(cat, v) }} />
                      <div style={{ width: 110, textAlign: "right", fontSize: 13, fontWeight: 700, color: T.text2, fontFamily: "'DM Mono',monospace" }}>
                        {fmtS(r)}
                      </div>
                      <div style={{
                        width: 100, textAlign: "right", fontSize: 12, fontWeight: 700,
                        color: variance >= 0 ? T.green : T.red, fontFamily: "'DM Mono',monospace",
                      }}>
                        {variance >= 0 ? "+" : "−"}{fmtS(Math.abs(variance))}
                      </div>
                    </div>
                    {b > 0 && <div style={{ marginTop: 8 }}><ProgressBar pct={p} /></div>}
                  </div>
                )
              })}

              {/* total */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 12 }}>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: T.text }}>Total</div>
                <div style={{ width: 130, textAlign: "right", fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'DM Mono',monospace" }}>
                  {fmtS(totalBudget)}
                </div>
                <div style={{ width: 110, textAlign: "right", fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'DM Mono',monospace" }}>
                  {fmtS(totalReal)}
                </div>
                <div style={{
                  width: 100, textAlign: "right", fontSize: 12, fontWeight: 700,
                  color: totalBudget - totalReal >= 0 ? T.green : T.red, fontFamily: "'DM Mono',monospace",
                }}>
                  {totalBudget - totalReal >= 0 ? "+" : "−"}{fmtS(Math.abs(totalBudget - totalReal))}
                </div>
              </div>
            </div>
          )}

          {/* agregar categoría */}
          {availableCats.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: T.surf2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Plus size={13} color={T.muted} />
              </div>
              <select
                value=""
                onChange={e => { if (e.target.value) setExtraCats(prev => [...prev, e.target.value]) }}
                style={{ ...inp, width: "auto", flex: 1, maxWidth: 280, padding: "8px 10px", fontSize: 12, color: T.text2 }}
              >
                <option value="">Agregar categoría al presupuesto…</option>
                {availableCats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* ── Meta de ingresos ──────────────────────────────────────── */}
        <div style={{ ...card }}>
          <SectionHeader
            title="Meta de ingresos"
            subtitle={`Objetivo anual de facturación · ${year}`}
          />

          <label style={lbl}>Meta anual (COP)</label>
          <input
            key={`meta-${year}-${meta}`}
            type="text"
            inputMode="numeric"
            defaultValue={meta > 0 ? meta : ""}
            placeholder="Ej. 500.000.000"
            onBlur={e => { const v = parseNum(e.target.value); if (v !== meta) commitMeta(v) }}
            onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur() }}
            style={{ ...inp, fontFamily: "'DM Mono',monospace", fontWeight: 600, fontSize: 14, background: T.surf, color: T.text }}
          />

          {meta > 0 ? (
            <>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 22 }}>
                <MicroLabel>Avance YTD · {MONTHS_SHORT[0]}–{MONTHS_SHORT[month]}</MicroLabel>
                <span style={{
                  fontSize: 34, fontWeight: 700, fontFamily: "'DM Mono',monospace", letterSpacing: "-.5px",
                  color: metaPct >= 100 ? T.green : T.text,
                }}>
                  {metaPct}%
                </span>
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ height: 9, borderRadius: 8, background: T.surf3, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${Math.min(metaPct, 100)}%`, borderRadius: 8,
                    background: metaPct >= 100 ? T.green : T.accent,
                    transition: "width .25s ease",
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
                  <span style={{ fontSize: 11, color: T.muted }}>
                    Facturado: <span style={{ fontWeight: 700, color: T.text, fontFamily: "'DM Mono',monospace" }}>{fmtS(incYTD)}</span>
                  </span>
                  <span style={{ fontSize: 11, color: T.muted }}>
                    Meta: <span style={{ fontWeight: 700, color: T.text, fontFamily: "'DM Mono',monospace" }}>{fmtS(meta)}</span>
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <div style={{ flex: 1, padding: "14px 16px", borderRadius: 12, background: T.surf2, border: `1px solid ${T.border}` }}>
                  <MicroLabel>Restante para la meta</MicroLabel>
                  <div style={{ fontSize: 17, fontWeight: 700, color: remaining > 0 ? T.text : T.green, fontFamily: "'DM Mono',monospace", marginTop: 6 }}>
                    {remaining > 0 ? fmtS(remaining) : "Meta cumplida"}
                  </div>
                </div>
                <div style={{ flex: 1, padding: "14px 16px", borderRadius: 12, background: remaining > 0 ? T.greenBg : T.surf2, border: `1px solid ${remaining > 0 ? "rgba(30,158,90,.2)" : T.border}` }}>
                  <MicroLabel style={remaining > 0 ? { color: T.green } : undefined}>Necesario / mes restante</MicroLabel>
                  <div style={{ fontSize: 17, fontWeight: 700, color: remaining > 0 ? T.green : T.muted, fontFamily: "'DM Mono',monospace", marginTop: 6 }}>
                    {remaining > 0 ? fmtS(Math.round(neededPerMonth)) : "—"}
                  </div>
                  {remaining > 0 && (
                    <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>
                      {monthsLeft} mes{monthsLeft !== 1 ? "es" : ""} hasta diciembre
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{ marginTop: 20, padding: "20px 18px", borderRadius: 12, background: T.surf2, textAlign: "center" }}>
              <Target size={20} color={T.muted} style={{ display: "block", margin: "0 auto 8px" }} />
              <div style={{ fontSize: 12, color: T.muted, maxWidth: 260, margin: "0 auto" }}>
                Define tu meta anual de ingresos para seguir el avance mes a mes.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Proyección anual ───────────────────────────────────────── */}
      <div style={{ ...card }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Proyección anual de egresos</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
              Gasto real vs presupuesto · proyección por run-rate ({fmtS(runRate)}/mes)
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {[
              ["Real", CHART.exp, false],
              ["Presupuesto", CHART.inc, false],
              ["Proyección", CHART.profit, true],
            ].map(([l, c, dash]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                {dash
                  ? <span style={{ width: 14, height: 0, borderTop: `2px dashed ${c}`, display: "inline-block" }} />
                  : <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block" }} />}
                <span style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={chartData} barSize={14}>
            <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 10, fill: T.muted, fontFamily: "'DM Mono',monospace" }}
              axisLine={false} tickLine={false}
              tickFormatter={v => fmtS(v)} width={70}
            />
            <Tooltip content={<Tip />} />
            <Bar dataKey="real" name="Real" fill={CHART.exp} radius={[4, 4, 0, 0]} />
            <Line
              type="monotone" dataKey="presupuesto" name="Presupuesto"
              stroke={CHART.inc} strokeWidth={2} dot={false}
            />
            <Line
              type="monotone" dataKey="proyeccion" name="Proyección"
              stroke={CHART.profit} strokeWidth={2} strokeDasharray="6 5"
              dot={{ r: 2.5, fill: CHART.profit, strokeWidth: 0 }} connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}
