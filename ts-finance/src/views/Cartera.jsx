import { useMemo, useState } from 'react'
import {
  Wallet, Clock, AlertTriangle, TrendingUp, TrendingDown,
  CheckCircle2, Search, Receipt, CalendarDays, Landmark, ArrowUpRight,
} from 'lucide-react'
import {
  BarChart, Bar, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  T, CHART, MONTHS_SHORT, fmtS, calcFin, filterM,
  AGING_BUCKETS, agingBucket, freqMult,
} from '../constants.js'
import { card, btnSmall, KPI, Pill, Tip, EmptyState } from '../ui.jsx'

/* ── Helpers ────────────────────────────────────────────────────────────── */

const NOW = new Date()

const daysAgo = dateStr => Math.floor((NOW - new Date(dateStr)) / 86_400_000)

const fmtDate = dateStr => {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
}

/* Color por bucket de aging — escala de severidad */
const bucketColors = () => [T.green, "#87D455", T.amber, "#EA580C", T.red]
const bucketBgs    = () => [T.greenBg, "rgba(135,212,85,.12)", T.amberBg, "rgba(234,88,12,.10)", T.redBg]

const microLabel = {
  fontSize: 10, fontWeight: 600, textTransform: "uppercase",
  letterSpacing: ".07em", color: T.muted,
}

const thCell = {
  ...microLabel, textAlign: "left", padding: "11px 14px",
  borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap",
  position: "sticky", top: 0, background: T.surf, zIndex: 1,
}
const thRight = { ...thCell, textAlign: "right" }
const tdBase  = { padding: "11px 14px", fontSize: 13, color: T.text, verticalAlign: "middle" }
const tdMono  = { ...tdBase, fontFamily: "'DM Mono',monospace", textAlign: "right", whiteSpace: "nowrap" }

/* ── Sub-components ─────────────────────────────────────────────────────── */

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{title}</div>
      {subtitle && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{subtitle}</div>}
    </div>
  )
}

function BucketChip({ idx }) {
  const colors = bucketColors()
  const bgs = bucketBgs()
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: "2px 9px", borderRadius: 999,
      background: bgs[idx], color: colors[idx], whiteSpace: "nowrap",
      display: "inline-flex", alignItems: "center", gap: 4,
    }}>
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: colors[idx], display: "inline-block" }} />
      {AGING_BUCKETS[idx]}
    </span>
  )
}

/* ── Tab: Cuentas por cobrar ────────────────────────────────────────────── */

function CxC({ allInc, onMarkPaid }) {
  const [q, setQ] = useState("")
  const colors = bucketColors()

  /* Facturas pendientes / parciales */
  const pending = useMemo(() =>
    allInc.filter(i => i.status === "Pendiente" || i.status === "Parcial"),
    [allInc]
  )
  const carteraTotal = pending.reduce((s, i) => s + Number(i.amount), 0)

  const overdue = useMemo(() => pending.filter(i => daysAgo(i.date) > 30), [pending])
  const carteraVencida = overdue.reduce((s, i) => s + Number(i.amount), 0)

  /* DSO ponderado por monto */
  const dso = useMemo(() => {
    if (carteraTotal === 0) return 0
    const weighted = pending.reduce((s, i) => s + Math.max(daysAgo(i.date), 0) * Number(i.amount), 0)
    return Math.round(weighted / carteraTotal)
  }, [pending, carteraTotal])

  /* Índice de recaudo YTD */
  const recaudo = useMemo(() => {
    const ytd = allInc.filter(i => new Date(i.date).getFullYear() === NOW.getFullYear())
    const fact = ytd.reduce((s, i) => s + Number(i.amount), 0)
    const cobr = ytd.filter(i => i.status === "Pagado").reduce((s, i) => s + Number(i.amount), 0)
    return fact > 0 ? Math.round((cobr / fact) * 100) : null
  }, [allInc])

  /* Aging por bucket */
  const aging = useMemo(() => {
    const b = AGING_BUCKETS.map(name => ({ name, count: 0, amount: 0 }))
    pending.forEach(i => {
      const idx = agingBucket(i.date)
      b[idx].count += 1
      b[idx].amount += Number(i.amount)
    })
    return b
  }, [pending])

  /* Tabla: ordenada de más antigua a más reciente + búsqueda */
  const rows = useMemo(() =>
    [...pending]
      .filter(i => !q || (i.client || "").toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => new Date(a.date) - new Date(b.date)),
    [pending, q]
  )

  /* Top deudores */
  const topDebtors = useMemo(() => {
    const map = {}
    pending.forEach(i => {
      const k = i.client || "Sin cliente"
      map[k] = (map[k] || 0) + Number(i.amount)
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }))
  }, [pending])
  const maxDebtor = topDebtors[0]?.amount || 1

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* KPI strip */}
      <div className="g4">
        <KPI
          title="Cartera total"
          value={fmtS(carteraTotal)}
          sub={`${pending.length} factura${pending.length !== 1 ? "s" : ""} en cartera`}
          icon={Wallet}
          color={T.amber}
        />
        <KPI
          title="Cartera vencida"
          value={fmtS(carteraVencida)}
          sub={`${overdue.length} factura${overdue.length !== 1 ? "s" : ""} con +30 días`}
          icon={AlertTriangle}
          color={carteraVencida > 0 ? T.red : T.green}
        />
        <KPI
          title="DSO promedio"
          value={`${dso} días`}
          sub="Días en cartera, ponderado por valor"
          icon={Clock}
          color={dso > 45 ? T.red : dso > 30 ? T.amber : T.green}
        />
        <KPI
          title="Índice de recaudo"
          value={recaudo === null ? "—" : `${recaudo}%`}
          sub={`Cobrado / facturado ${NOW.getFullYear()}`}
          icon={TrendingUp}
          color={recaudo !== null && recaudo >= 80 ? T.green : T.amber}
        />
      </div>

      {/* Aging analysis */}
      <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 14, padding: "22px 24px" }}>
        <SectionHeader
          title="Antigüedad de cartera"
          subtitle="Distribución del saldo pendiente por días desde emisión"
        />

        {carteraTotal > 0 ? (
          <>
            {/* Barra apilada horizontal */}
            <div style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden", background: T.surf3, marginBottom: 16 }}>
              {aging.map((b, i) => b.amount > 0 && (
                <div
                  key={b.name}
                  title={`${b.name}: ${fmtS(b.amount)}`}
                  style={{ width: `${(b.amount / carteraTotal) * 100}%`, background: colors[i], minWidth: 3 }}
                />
              ))}
            </div>

            {/* Leyenda con conteo + monto */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 22px", marginBottom: 20 }}>
              {aging.map((b, i) => (
                <div key={b.name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: colors[i], display: "inline-block", flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: T.text2, fontWeight: 500 }}>{b.name}</span>
                  <span style={{ fontSize: 10, color: T.muted }}>· {b.count} fact.</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.text, fontFamily: "'DM Mono',monospace" }}>{fmtS(b.amount)}</span>
                </div>
              ))}
            </div>

            {/* Bar chart por bucket */}
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={aging} barSize={36}>
                <CartesianGrid strokeDasharray="2 4" stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: CHART.tick }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: CHART.tick, fontFamily: "'DM Mono',monospace" }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => fmtS(v)} width={70}
                />
                <Tooltip content={<Tip />} cursor={{ fill: T.surf2 }} />
                <Bar dataKey="amount" name="Cartera" radius={[5, 5, 0, 0]}>
                  {aging.map((_, i) => (
                    <Cell key={i} fill={CHART.scale[i % CHART.scale.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        ) : (
          <EmptyState
            icon={CheckCircle2}
            title="Cartera al día"
            sub="No hay facturas pendientes ni parciales. Todo el recaudo está completo."
          />
        )}
      </div>

      {/* Tabla + Top deudores */}
      <div className="g2-1">

        {/* Facturas en cartera */}
        <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "18px 20px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Facturas en cartera</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Ordenadas de la más antigua a la más reciente</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.surf2, borderRadius: 8, padding: "7px 11px", border: `1px solid ${T.border}`, minWidth: 180 }}>
              <Search size={13} color={T.muted} />
              <input
                placeholder="Buscar cliente…"
                value={q} onChange={e => setQ(e.target.value)}
                style={{ border: "none", background: "transparent", fontSize: 12, color: T.text, outline: "none", width: "100%", fontFamily: "inherit" }}
              />
            </div>
          </div>

          {rows.length > 0 ? (
            <div className="tbl-wrap" style={{ maxHeight: 480, overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
                <thead>
                  <tr>
                    <th style={thCell}>Cliente</th>
                    <th style={thCell}>Proyecto</th>
                    <th style={thCell}>Emitida</th>
                    <th style={thCell}>Antigüedad</th>
                    <th style={thCell}>Estado</th>
                    <th style={thRight}>Valor</th>
                    <th style={thCell}></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(i => {
                    const days = daysAgo(i.date)
                    const bIdx = agingBucket(i.date)
                    return (
                      <tr key={i.id} style={{
                        borderBottom: `1px solid ${T.border}`,
                        borderLeft: bIdx === 4 ? `3px solid ${T.red}` : "3px solid transparent",
                      }}>
                        <td style={{ ...tdBase, fontWeight: 600 }}>{i.client || "Sin cliente"}</td>
                        <td style={{ ...tdBase, color: T.text2, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.project || "—"}</td>
                        <td style={{ ...tdBase, whiteSpace: "nowrap" }}>
                          <div style={{ fontSize: 12, color: T.text2 }}>{fmtDate(i.date)}</div>
                          <div style={{ fontSize: 10, color: T.muted, marginTop: 1 }}>hace {Math.max(days, 0)}d</div>
                        </td>
                        <td style={tdBase}><BucketChip idx={bIdx} /></td>
                        <td style={tdBase}><Pill s={i.status} /></td>
                        <td style={{ ...tdMono, fontWeight: 700 }}>{fmtS(i.amount)}</td>
                        <td style={{ ...tdBase, textAlign: "right" }}>
                          <button
                            onClick={() => onMarkPaid?.(i.id)}
                            style={{ ...btnSmall, background: T.greenBg2, color: T.greenD, whiteSpace: "nowrap", marginLeft: "auto" }}
                          >
                            <CheckCircle2 size={11} />Registrar pago
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Receipt}
              title={q ? "Sin resultados" : "Sin facturas en cartera"}
              sub={q ? `Ningún cliente coincide con "${q}".` : "Cuando registres ingresos pendientes de cobro aparecerán aquí."}
            />
          )}
        </div>

        {/* Top deudores */}
        <div style={{ ...card, background: T.surf, border: `1px solid ${T.border}` }}>
          <SectionHeader title="Top deudores" subtitle="Mayor saldo pendiente por cliente" />
          {topDebtors.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {topDebtors.map((d, i) => {
                const share = carteraTotal > 0 ? Math.round((d.amount / carteraTotal) * 100) : 0
                return (
                  <div key={d.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5, gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <span style={{
                          width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                          background: i === 0 ? T.redBg : T.surf2,
                          color: i === 0 ? T.red : T.muted,
                          fontSize: 10, fontWeight: 700,
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "'DM Mono',monospace",
                        }}>{i + 1}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.text, fontFamily: "'DM Mono',monospace", flexShrink: 0 }}>{fmtS(d.amount)}</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 4, background: T.surf3, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 4,
                        width: `${(d.amount / maxDebtor) * 100}%`,
                        background: i === 0 ? T.red : i === 1 ? T.amber : T.lime,
                      }} />
                    </div>
                    <div style={{ fontSize: 10, color: T.muted, marginTop: 3 }}>{share}% de la cartera</div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState icon={CheckCircle2} title="Sin deudores" sub="Ningún cliente tiene saldos pendientes." />
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Tab: Cuentas por pagar ─────────────────────────────────────────────── */

function CxP({ allExp, recurring }) {
  const today = NOW.getDate()

  const active = useMemo(() => recurring.filter(r => r.active), [recurring])

  /* Compromisos mensualizados */
  const monthlyCommit = useMemo(() =>
    active.reduce((s, r) => s + Number(r.amount) * freqMult(r.freq), 0),
    [active]
  )

  /* Próximos 30 días: cargos con día de cobro >= hoy este mes (estimación mensualizada) */
  const next30 = useMemo(() =>
    active.filter(r => Number(r.day) >= today),
    [active, today]
  )
  const next30Total = next30.reduce((s, r) => s + Number(r.amount) * freqMult(r.freq), 0)

  /* Categoría dominante */
  const topCat = useMemo(() => {
    const map = {}
    active.forEach(r => {
      const k = r.cat || "Otros"
      map[k] = (map[k] || 0) + Number(r.amount) * freqMult(r.freq)
    })
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1])
    return sorted[0] || null
  }, [active])

  /* Tabla: activos primero, luego pausados; ordenados por día de cobro */
  const tableRows = useMemo(() =>
    [...recurring].sort((a, b) =>
      (b.active - a.active) || (Number(a.day) - Number(b.day))
    ),
    [recurring]
  )

  /* Promedio egresos reales últimos 3 meses */
  const avgRealExp = useMemo(() => {
    let total = 0
    for (let k = 1; k <= 3; k++) {
      const raw = NOW.getMonth() - k
      const m = ((raw % 12) + 12) % 12
      const y = raw < 0 ? NOW.getFullYear() - 1 : NOW.getFullYear()
      total += calcFin([], filterM(allExp, m, y)).tE
    }
    return total / 3
  }, [allExp])

  /* Proyección 6 meses */
  const projection = useMemo(() => Array.from({ length: 6 }, (_, k) => {
    const raw = NOW.getMonth() + k
    const m = raw % 12
    return {
      name: MONTHS_SHORT[m],
      comprometido: Math.round(monthlyCommit),
      promedio: Math.round(avgRealExp),
    }
  }), [monthlyCommit, avgRealExp])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* KPI strip */}
      <div className="g4">
        <KPI
          title="Compromisos mensuales"
          value={fmtS(monthlyCommit)}
          sub="Recurrentes activos, mensualizados"
          icon={Landmark}
          color={T.red}
        />
        <KPI
          title="Próximos 30 días"
          value={fmtS(next30Total)}
          sub={`${next30.length} cargo${next30.length !== 1 ? "s" : ""} por vencer · estimación`}
          icon={CalendarDays}
          color={T.amber}
        />
        <KPI
          title="Compromisos activos"
          value={String(active.length)}
          sub={`${recurring.length - active.length} pausado${recurring.length - active.length !== 1 ? "s" : ""}`}
          icon={Receipt}
          color={T.blue}
        />
        <KPI
          title="Categoría dominante"
          value={topCat ? topCat[0] : "—"}
          sub={topCat ? `${fmtS(topCat[1])} / mes` : "Sin compromisos activos"}
          icon={TrendingDown}
          color={T.violet}
        />
      </div>

      {/* Tabla de compromisos */}
      <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "18px 20px 14px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Compromisos recurrentes</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Obligaciones fijas y su equivalente mensual</div>
        </div>
        {tableRows.length > 0 ? (
          <div className="tbl-wrap" style={{ maxHeight: 420, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
              <thead>
                <tr>
                  <th style={thCell}>Nombre</th>
                  <th style={thCell}>Categoría</th>
                  <th style={thCell}>Frecuencia</th>
                  <th style={thCell}>Día de cobro</th>
                  <th style={thRight}>Mensualizado</th>
                  <th style={thCell}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map(r => (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${T.border}`, opacity: r.active ? 1 : 0.55 }}>
                    <td style={{ ...tdBase, fontWeight: 600 }}>{r.name}</td>
                    <td style={{ ...tdBase, color: T.text2 }}>{r.cat || "—"}</td>
                    <td style={{ ...tdBase, fontSize: 12, color: T.muted }}>{r.freq}</td>
                    <td style={{ ...tdBase, fontFamily: "'DM Mono',monospace", fontSize: 12, color: T.text2 }}>Día {r.day}</td>
                    <td style={{ ...tdMono, fontWeight: 700, color: T.red }}>{fmtS(Number(r.amount) * freqMult(r.freq))}</td>
                    <td style={tdBase}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: "2px 9px", borderRadius: 999,
                        background: r.active ? T.greenBg : T.surf2,
                        color: r.active ? T.green : T.muted,
                        display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap",
                      }}>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: r.active ? T.green : T.muted, display: "inline-block" }} />
                        {r.active ? "Activo" : "Pausado"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Landmark}
            title="Sin compromisos registrados"
            sub="Registra tus gastos recurrentes para proyectar las cuentas por pagar."
          />
        )}
      </div>

      {/* Proyección 6 meses */}
      <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 14, padding: "22px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Proyección a 6 meses</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Salida comprometida vs. promedio real de egresos (últimos 3 meses)</div>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            {[["Comprometido", CHART.exp], ["Promedio real", CHART.inc]].map(([l, c]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block" }} />
                <span style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={projection}>
            <CartesianGrid strokeDasharray="2 4" stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: CHART.tick }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 10, fill: CHART.tick, fontFamily: "'DM Mono',monospace" }}
              axisLine={false} tickLine={false}
              tickFormatter={v => fmtS(v)} width={70}
            />
            <Tooltip content={<Tip />} />
            <Area type="monotone" dataKey="promedio" name="Promedio real" stroke={CHART.inc} strokeWidth={2} fill={`${CHART.inc}18`} dot={false} />
            <Area type="monotone" dataKey="comprometido" name="Comprometido" stroke={CHART.exp} strokeWidth={2} fill={`${CHART.exp}22`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ── Main ───────────────────────────────────────────────────────────────── */

export default function CarteraView({ allInc, allExp, recurring = [], onMarkPaid, onNavigate }) {
  const [tab, setTab] = useState("cxc")

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: "-.3px" }}>Cartera</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Cuentas por cobrar y compromisos por pagar</div>
        </div>
        <button
          onClick={() => onNavigate?.("ingresos")}
          style={{
            background: T.surf, color: T.subtle, border: `1px solid ${T.border}`,
            borderRadius: 9, padding: "8px 14px", fontSize: 12, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
          }}
        >
          Ver ingresos <ArrowUpRight size={13} />
        </button>
      </div>

      {/* Segmented tabs */}
      <div style={{
        display: "inline-flex", alignSelf: "flex-start",
        background: T.surf2, border: `1px solid ${T.border}`,
        borderRadius: 11, padding: 3, gap: 2,
      }}>
        {[["cxc", "Cuentas por cobrar"], ["cxp", "Cuentas por pagar"]].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 600, fontFamily: "inherit",
              background: tab === id ? T.surf : "transparent",
              color: tab === id ? T.text : T.muted,
              boxShadow: tab === id ? "0 1px 3px rgba(0,0,0,.08)" : "none",
              transition: "background .12s, color .12s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "cxc"
        ? <CxC allInc={allInc} onMarkPaid={onMarkPaid} />
        : <CxP allExp={allExp} recurring={recurring} />}
    </div>
  )
}
