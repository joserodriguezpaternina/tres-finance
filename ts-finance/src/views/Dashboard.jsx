import { useMemo, useState } from 'react'
import {
  TrendingUp, TrendingDown, Clock, AlertCircle,
  ArrowUpRight, CheckCircle2, Tag, ChevronRight,
  FileText, BarChart2, Wallet, Users, Circle,
  ArrowRight, Building2, Receipt, AlertTriangle,
} from 'lucide-react'
import {
  ComposedChart, Bar, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { T, MONTHS, MONTHS_SHORT, fmtS, calcFin, filterM } from '../constants.js'
import { KPI, Pill, Tip, card } from '../ui.jsx'

/* ── Constants ─────────────────────────────────────────────────────────── */

const PIE_COLORS = [T.red, "#F97316", T.amber, T.violet, T.blue, T.green]

const NOW = new Date()

/* ── Helpers ────────────────────────────────────────────────────────────── */

function pct(a, b) {
  if (b === null || b === undefined || b === 0) return null
  return Math.round(((a - b) / Math.abs(b)) * 100)
}

function trendBadge(p, invertColors = false) {
  if (p === null) return null
  const up = p >= 0
  const positive = invertColors ? !up : up
  return {
    label: `${up ? "▲" : "▼"} ${Math.abs(p)}% vs mes ant.`,
    bg: positive ? "rgba(68,178,107,.1)" : "rgba(215,43,32,.1)",
    color: positive ? T.green : T.red,
  }
}

function daysAgo(dateStr) {
  const d = new Date(dateStr)
  return Math.floor((NOW - d) / 86_400_000)
}

function fmtDate(dateStr) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function Label({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: T.muted,
      textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10,
    }}>
      {children}
    </div>
  )
}

function SectionHeader({ title, subtitle, action, onAction }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {action && (
        <button
          onClick={onAction}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            fontSize: 12, fontWeight: 600, color: T.subtle,
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "inherit", padding: "3px 0",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = ".75"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          {action} <ArrowRight size={12} />
        </button>
      )}
    </div>
  )
}

function AlertChip({ icon: Icon, color, bg, label, value, onClick }) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 16px", borderRadius: 12,
        background: bg,
        border: `1px solid ${color}30`,
        cursor: "pointer", transition: "box-shadow .15s",
        flex: "1 1 200px", minWidth: 0,
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 0 2px ${color}25` }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none" }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
        background: `${color}18`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={15} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color, lineHeight: 1.3 }}>{label}</div>
        {value && <div style={{ fontSize: 11, color, opacity: 0.75, marginTop: 1 }}>{value}</div>}
      </div>
      <ChevronRight size={14} color={color} style={{ flexShrink: 0, opacity: 0.6 }} />
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: T.border, margin: "0" }} />
}

function StatusDot({ status }) {
  const colors = { Pagado: T.green, Pendiente: T.amber, Parcial: T.blue }
  const c = colors[status] || T.muted
  return (
    <span style={{
      display: "inline-block", width: 7, height: 7,
      borderRadius: "50%", background: c, flexShrink: 0,
    }} />
  )
}

function PendingInvoiceRow({ item, last }) {
  const days = daysAgo(item.date)
  const overdue = days > 30 && item.status !== "Pagado"
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 0",
      borderBottom: last ? "none" : `1px solid ${T.border}`,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 11, flexShrink: 0,
        background: overdue ? T.redBg : item.status === "Parcial" ? T.blueBg : T.amberBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: overdue ? `1px solid ${T.red}25` : "none",
      }}>
        {overdue
          ? <AlertTriangle size={15} color={T.red} />
          : <Clock size={15} color={item.status === "Parcial" ? T.blue : T.amber} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: T.text,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {item.client || "Sin cliente"}
        </div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
          {item.project || "—"} · {fmtDate(item.date)}
          {overdue && <span style={{ color: T.red, fontWeight: 600 }}> · {days}d vencida</span>}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'DM Mono',monospace" }}>
          {fmtS(item.amount)}
        </span>
        <Pill s={item.status} />
      </div>
    </div>
  )
}

function MovementRow({ item, last }) {
  const isInc = item._tipo === "I"
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "11px 0",
      borderBottom: last ? "none" : `1px solid ${T.border}`,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: isInc ? T.greenBg : T.redBg,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isInc
          ? <TrendingUp size={14} color={T.green} />
          : <TrendingDown size={14} color={T.red} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: T.text,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {isInc ? (item.client || "Sin cliente") : (item.desc || item.description || "Egreso")}
        </div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>
          {isInc ? (item.project || "—") : (item.cat || "Sin categoría")} · {fmtDate(item.date)}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        {item.status && isInc && <Pill s={item.status} />}
        <span style={{
          fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono',monospace",
          color: isInc ? T.green : T.red,
        }}>
          {isInc ? "+" : "−"}{fmtS(item.amount)}
        </span>
      </div>
    </div>
  )
}

function QuickLink({ label, view, icon: Icon, color, bg, onNavigate }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={() => onNavigate?.(view)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 12px", borderRadius: 10,
        background: hovered ? T.surf2 : "transparent",
        cursor: "pointer", transition: "background .12s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          background: bg, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={13} color={color} />
        </div>
        <span style={{ fontSize: 13, color: T.text2, fontWeight: 500 }}>{label}</span>
      </div>
      <ArrowUpRight size={13} color={T.muted} />
    </div>
  )
}

/* ── Metric banner strip ────────────────────────────────────────────────── */

function MetricStrip({ label, value, note, color }) {
  return (
    <div style={{
      flex: "1 1 0", minWidth: 0,
      display: "flex", flexDirection: "column", gap: 4,
      padding: "16px 20px",
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: ".07em" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: color || T.text, letterSpacing: "-.3px" }}>{value}</div>
      {note && <div style={{ fontSize: 11, color: T.muted }}>{note}</div>}
    </div>
  )
}

/* ── Custom tooltip for pie ─────────────────────────────────────────────── */

function PieTip({ active, payload }) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div style={{ background: "#101010", borderRadius: 10, padding: "8px 14px", boxShadow: "0 8px 24px rgba(0,0,0,.15)" }}>
      <div style={{ color: "rgba(255,255,255,.5)", fontSize: 11, marginBottom: 4 }}>{p.name}</div>
      <div style={{ color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono',monospace" }}>{fmtS(p.value)}</div>
    </div>
  )
}

/* ── Main Dashboard ─────────────────────────────────────────────────────── */

export default function Dashboard({ fin, incomes, expenses, allInc, allExp, month, year, onNavigate }) {
  const [period, setPeriod] = useState("Anual")

  /* ── Annual trend data (12 months) ── */
  const annualData = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const f = calcFin(filterM(allInc, i, year), filterM(allExp, i, year))
    return { name: MONTHS_SHORT[i], ingresos: f.tI, egresos: f.tE, utilidad: f.util }
  }), [allInc, allExp, year])

  /* ── Monthly data grouped by week (4 buckets) ── */
  const monthlyData = useMemo(() => {
    const weeks = [
      { name: "Sem 1", ingresos: 0, egresos: 0, utilidad: 0 },
      { name: "Sem 2", ingresos: 0, egresos: 0, utilidad: 0 },
      { name: "Sem 3", ingresos: 0, egresos: 0, utilidad: 0 },
      { name: "Sem 4+", ingresos: 0, egresos: 0, utilidad: 0 },
    ]
    incomes.forEach(i => {
      const w = Math.min(Math.floor((new Date(i.date).getDate() - 1) / 7), 3)
      weeks[w].ingresos += Number(i.amount)
    })
    expenses.forEach(e => {
      const w = Math.min(Math.floor((new Date(e.date).getDate() - 1) / 7), 3)
      weeks[w].egresos += Number(e.amount)
    })
    weeks.forEach(w => { w.utilidad = w.ingresos - w.egresos })
    return weeks
  }, [incomes, expenses])

  const chartData = period === "Anual" ? annualData : monthlyData

  /* ── Last-month figures for real trend calculation ── */
  const lastMonth = month === 0 ? 11 : month - 1
  const lastYear = month === 0 ? year - 1 : year
  const lastFin = useMemo(() =>
    calcFin(filterM(allInc, lastMonth, lastYear), filterM(allExp, lastMonth, lastYear)),
    [allInc, allExp, lastMonth, lastYear]
  )

  /* ── Spark data (last 6 months) ── */
  const spark6 = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const offset = i - 5
    const rawM = month + offset
    const m = ((rawM % 12) + 12) % 12
    const y = rawM < 0 ? year - 1 : year
    const f = calcFin(filterM(allInc, m, y), filterM(allExp, m, y))
    return { v: f.tI, ve: f.tE, vu: f.util }
  }), [allInc, allExp, month, year])

  const incSpark = spark6.map(d => ({ v: d.v }))
  const expSpark = spark6.map(d => ({ v: d.ve }))
  const utlSpark = spark6.map(d => ({ v: d.vu }))

  /* ── Pending incomes ── */
  const allPendingInc = useMemo(() =>
    allInc.filter(i => i.status === "Pendiente" || i.status === "Parcial"),
    [allInc]
  )
  const totalPendingAll = allPendingInc.reduce((s, i) => s + Number(i.amount), 0)

  const overdueInc = useMemo(() =>
    allPendingInc.filter(i => daysAgo(i.date) > 30),
    [allPendingInc]
  )
  const totalOverdue = overdueInc.reduce((s, i) => s + Number(i.amount), 0)

  const pendingThisMonth = useMemo(() =>
    incomes.filter(i => i.status === "Pendiente" || i.status === "Parcial"),
    [incomes]
  )
  const totalPendingThisMonth = pendingThisMonth.reduce((s, i) => s + Number(i.amount), 0)

  const expNoCat = useMemo(() =>
    expenses.filter(e => !e.cat || e.cat === "Otros"),
    [expenses]
  )

  /* ── Recent pending invoices (top 5, all time) ── */
  const recentPending = useMemo(() =>
    [...allPendingInc]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5),
    [allPendingInc]
  )

  /* ── Expense pie by category ── */
  const catData = useMemo(() => {
    const map = {}
    expenses.forEach(e => {
      const k = e.cat || "Sin categoría"
      map[k] = (map[k] || 0) + Number(e.amount)
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }))
  }, [expenses])

  /* ── Recent movements (allInc + allExp, last 8) ── */
  const recentMoves = useMemo(() => [
    ...allInc.map(i => ({ ...i, _tipo: "I" })),
    ...allExp.map(e => ({ ...e, _tipo: "E" })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8),
    [allInc, allExp]
  )

  /* ── Trend badges ── */
  const incTrend = trendBadge(pct(fin.tI, lastFin.tI))
  const expTrend = trendBadge(pct(fin.tE, lastFin.tE), true) // invert: lower expenses = good
  const utlTrend = trendBadge(pct(fin.util, lastFin.util))

  /* ── Build alerts ── */
  const alerts = []
  if (overdueInc.length > 0) {
    alerts.push({
      icon: AlertCircle,
      color: T.red,
      bg: T.redBg,
      label: `${overdueInc.length} cobro${overdueInc.length > 1 ? "s" : ""} vencido${overdueInc.length > 1 ? "s" : ""}`,
      value: fmtS(totalOverdue),
      nav: "ingresos",
    })
  }
  if (pendingThisMonth.length > 0) {
    alerts.push({
      icon: Clock,
      color: T.amber,
      bg: T.amberBg,
      label: `${pendingThisMonth.length} pendiente${pendingThisMonth.length > 1 ? "s" : ""} este mes`,
      value: fmtS(totalPendingThisMonth),
      nav: "ingresos",
    })
  }
  if (expNoCat.length > 3) {
    alerts.push({
      icon: Tag,
      color: T.violet,
      bg: T.violetBg,
      label: `${expNoCat.length} egreso${expNoCat.length > 1 ? "s" : ""} sin categorizar`,
      value: "Revisar egresos",
      nav: "egresos",
    })
  }

  /* ── Annual totals for summary strip ── */
  const annualFin = useMemo(() =>
    calcFin(
      allInc.filter(i => new Date(i.date).getFullYear() === year),
      allExp.filter(e => new Date(e.date).getFullYear() === year),
    ),
    [allInc, allExp, year]
  )

  const greetHour = new Date().getHours()
  const greet = greetHour < 12 ? "Buenos días" : greetHour < 19 ? "Buenas tardes" : "Buenas noches"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* ── 0. Greeting header ────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", paddingBottom: 4 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.text, letterSpacing: "-.5px", lineHeight: 1.2 }}>
            {greet}, tres Studio
          </div>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>
            {MONTHS[month]} {year} · Aquí está tu resumen financiero
          </div>
        </div>
        {allPendingInc.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 12px", borderRadius: 20, background: "#FFFBEB", border: "1px solid #FDE68A", cursor: "pointer" }}
            onClick={() => onNavigate?.("ingresos")}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.amber }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#92400E" }}>
              {allPendingInc.length} cobro{allPendingInc.length !== 1 ? "s" : ""} pendiente{allPendingInc.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* ── 1. Acciones pendientes ─────────────────────────────────────── */}
      {alerts.length > 0 && (
        <div style={{
          background: "#FFFBEB", border: "1px solid #FDE68A",
          borderRadius: 12, padding: "14px 18px",
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
            <AlertTriangle size={13} color={T.amber} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#92400E", textTransform: "uppercase", letterSpacing: ".08em" }}>
              Atención
            </span>
          </div>
          <div style={{ width: 1, height: 16, background: "#FDE68A", flexShrink: 0 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
            {alerts.map((a, i) => (
              <button key={i} onClick={() => onNavigate?.(a.nav)} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 20, border: `1px solid ${a.color}30`,
                background: a.bg, cursor: "pointer", fontFamily: "inherit",
              }}>
                <a.icon size={11} color={a.color} />
                <span style={{ fontSize: 12, fontWeight: 600, color: a.color }}>{a.label}</span>
                {a.value && <span style={{ fontSize: 11, color: a.color, opacity: .7, fontFamily: "'DM Mono',monospace" }}>{a.value}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 2. KPI Cards ──────────────────────────────────────────────── */}
      <div className="kpi-hero-grid">
        <KPI
          hero
          title="Ingresos del mes"
          value={fmtS(fin.tI)}
          sub={`${MONTHS[month]} ${year}`}
          icon={TrendingUp}
          spark={incSpark}
        />
        <KPI
          title="Egresos del mes"
          value={fmtS(fin.tE)}
          sub={expTrend ? expTrend.label : "Sin dato anterior"}
          icon={TrendingDown}
          color={T.red}
          badge={expTrend}
          spark={expSpark}
        />
        <KPI
          title="Utilidad neta"
          value={fmtS(fin.util)}
          sub={utlTrend ? utlTrend.label : "Sin dato anterior"}
          icon={BarChart2}
          color={fin.util >= 0 ? T.violet : T.red}
          badge={utlTrend}
          spark={utlSpark}
        />
        <KPI
          title="Pendiente por cobrar"
          value={fmtS(totalPendingAll)}
          sub={`${allPendingInc.length} factura${allPendingInc.length !== 1 ? "s" : ""} en curso`}
          icon={Wallet}
          color={T.amber}
        />
      </div>

      {/* ── 3. Annual summary strip ───────────────────────────────────── */}
      <div style={{
        ...card, padding: 0, overflow: "hidden",
        display: "flex", flexDirection: "row",
      }}>
        <div style={{
          background: T.text, color: "#fff",
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "16px 22px", gap: 2, flexShrink: 0, minWidth: 160,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: ".08em" }}>
            Acumulado {year}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginTop: 4 }}>
            Resumen anual
          </div>
        </div>
        <Divider />
        <div style={{ display: "flex", flex: 1, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          {[
            { label: "Ingresos totales", value: fmtS(annualFin.tI), note: `Cobrados: ${fmtS(annualFin.cobr)}`, color: T.green },
            { label: "Egresos totales", value: fmtS(annualFin.tE), color: T.red },
            { label: "Utilidad acumulada", value: fmtS(annualFin.util), color: annualFin.util >= 0 ? T.violet : T.red },
            { label: "IVA neto a declarar", value: fmtS(Math.abs(annualFin.ivaN)), note: annualFin.ivaN >= 0 ? "A pagar a DIAN" : "Saldo a favor", color: annualFin.ivaN >= 0 ? T.red : T.green },
          ].map(({ label, value, note, color }, i, arr) => (
            <div key={label} style={{
              display: "flex", flexShrink: 0, minWidth: 140,
              borderRight: i < arr.length - 1 ? `1px solid ${T.border}` : "none",
            }}>
              <MetricStrip label={label} value={value} note={note} color={color} />
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Main chart ─────────────────────────────────────────────── */}
      <div style={{ ...card, padding: "22px 28px" }}>
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          marginBottom: 20, flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Resumen financiero</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>
              {period === "Anual" ? `Todos los meses de ${year}` : "Semanas del mes actual"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", gap: 14 }}>
              {[["Ingresos", T.green], ["Egresos", T.red], ["Utilidad", T.violet]].map(([l, c]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block" }} />
                  <span style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>{l}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${T.border}` }}>
              {["Anual", "Mensual"].map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  style={{
                    padding: "6px 14px", border: "none", cursor: "pointer", background: "transparent",
                    fontSize: 12, fontWeight: period === p ? 600 : 400, fontFamily: "inherit",
                    color: period === p ? T.text : T.muted,
                    borderBottom: period === p ? `2px solid ${T.text}` : "2px solid transparent",
                    marginBottom: -1,
                    transition: "color .12s, border-color .12s",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={chartData} barGap={3} barSize={period === "Anual" ? 10 : 18}>
            <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: T.muted }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: T.muted, fontFamily: "'DM Mono',monospace" }}
              axisLine={false} tickLine={false}
              tickFormatter={v => fmtS(v)} width={64}
            />
            <Tooltip content={<Tip />} />
            <Bar dataKey="ingresos" name="Ingresos" fill={T.green} radius={[3, 3, 0, 0]} opacity={0.85} />
            <Bar dataKey="egresos" name="Egresos" fill={T.red} radius={[3, 3, 0, 0]} opacity={0.85} />
            <Area
              type="monotone" dataKey="utilidad" name="Utilidad"
              fill="rgba(90,62,231,.07)" stroke={T.violet} strokeWidth={2} dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── 5. Pending invoices + Pie + IVA ───────────────────────────── */}
      <div className="g3" style={{ gap: 14 }}>

        {/* Pending invoices */}
        <div style={{ ...card, padding: "20px 22px" }}>
          <SectionHeader
            title="Facturas pendientes"
            subtitle={`${allPendingInc.length} en curso · ${fmtS(totalPendingAll)}`}
            action="Ver cobros"
            onAction={() => onNavigate?.("ingresos")}
          />
          {recentPending.length > 0 ? (
            recentPending.map((item, i) => (
              <PendingInvoiceRow key={item.id || i} item={item} last={i === recentPending.length - 1} />
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: T.muted, fontSize: 13 }}>
              <CheckCircle2 size={28} color={T.green} style={{ display: "block", margin: "0 auto 8px" }} />
              Todo al día
            </div>
          )}
        </div>

        {/* Expense pie */}
        <div style={{ ...card, padding: "20px 22px" }}>
          <SectionHeader
            title="Distribución de egresos"
            subtitle="Por categoría este mes"
          />
          {catData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={118}>
                <PieChart>
                  <Pie
                    data={catData} cx="50%" cy="50%"
                    innerRadius={36} outerRadius={54}
                    dataKey="value" paddingAngle={3}
                  >
                    {catData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
                {catData.map((item, i) => {
                  const share = fin.tE > 0 ? Math.round((item.value / fin.tE) * 100) : 0
                  return (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], display: "inline-block", flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: T.text2 }}>{item.name}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 11, color: T.muted }}>{share}%</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: T.text, fontFamily: "'DM Mono',monospace" }}>{fmtS(item.value)}</span>
                        </div>
                      </div>
                      <div style={{ height: 3, borderRadius: 4, background: T.surf3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${share}%`, background: PIE_COLORS[i % PIE_COLORS.length], borderRadius: 4 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0", color: T.muted, fontSize: 13 }}>
              Sin egresos registrados este mes
            </div>
          )}
        </div>

        {/* IVA fiscal */}
        <div style={{ ...card, padding: "20px 22px" }}>
          <SectionHeader title="Resumen fiscal" subtitle="IVA del período" />

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { label: "IVA cobrado", value: fin.tIVAc, color: T.green, icon: TrendingUp },
              { label: "IVA pagado", value: fin.tIVAp, color: T.red, icon: TrendingDown },
              { label: "IVA neto", value: fin.ivaN, color: fin.ivaN >= 0 ? T.violet : T.green, bold: true, icon: BarChart2 },
            ].map(({ label, value, color, bold, icon: Icon }, idx, arr) => (
              <div
                key={label}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 0",
                  borderBottom: idx < arr.length - 1 ? `1px solid ${T.border}` : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 7,
                    background: `${color}12`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={12} color={color} />
                  </div>
                  <span style={{ fontSize: 13, color: T.text2, fontWeight: bold ? 700 : 400 }}>{label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "'DM Mono',monospace" }}>
                  {fmtS(value)}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 18, padding: "16px 16px", borderRadius: 12,
            background: fin.ivaN >= 0 ? "rgba(215,43,32,.06)" : "rgba(68,178,107,.06)",
            border: `1px solid ${fin.ivaN >= 0 ? "rgba(215,43,32,.18)" : "rgba(68,178,107,.18)"}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Building2 size={12} color={fin.ivaN >= 0 ? T.red : T.green} />
              <span style={{ fontSize: 11, fontWeight: 600, color: fin.ivaN >= 0 ? T.red : T.green, textTransform: "uppercase", letterSpacing: ".07em" }}>
                {fin.ivaN >= 0 ? "A declarar ante la DIAN" : "Saldo a favor DIAN"}
              </span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: fin.ivaN >= 0 ? T.red : T.green, letterSpacing: "-.5px" }}>
              {fmtS(Math.abs(fin.ivaN))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 6. Quick access + Recent movements ───────────────────────── */}
      <div className="g2" style={{ gap: 14 }}>

        {/* Quick access */}
        <div style={{ ...card, padding: "20px 16px" }}>
          <div style={{ paddingLeft: 4, paddingRight: 4 }}>
            <SectionHeader title="Accesos rápidos" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Label>Contabilidad</Label>
            <QuickLink label="Ingresos del mes" view="ingresos" icon={TrendingUp} color={T.green} bg={T.greenBg} onNavigate={onNavigate} />
            <QuickLink label="Egresos del mes" view="egresos" icon={TrendingDown} color={T.red} bg={T.redBg} onNavigate={onNavigate} />
            <QuickLink label="Reportes anuales" view="reportes" icon={BarChart2} color={T.violet} bg={T.violetBg} onNavigate={onNavigate} />

            <div style={{ marginTop: 10 }}>
              <Label>Clientes y cobros</Label>
            </div>
            <QuickLink label="Gestión de clientes" view="clientes" icon={Users} color={T.blue} bg={T.blueBg} onNavigate={onNavigate} />
            <QuickLink label="Facturas pendientes" view="ingresos" icon={Receipt} color={T.amber} bg={T.amberBg} onNavigate={onNavigate} />
            <QuickLink label="Recurrentes" view="recurrentes" icon={Circle} color={T.muted} bg={T.surf2} onNavigate={onNavigate} />

            <div style={{ marginTop: 10 }}>
              <Label>Finanzas</Label>
            </div>
            <QuickLink label="Flujo de caja" view="flujo" icon={Wallet} color={T.green} bg={T.greenBg} onNavigate={onNavigate} />
            <QuickLink label="Importar extracto" view="importar" icon={FileText} color={T.blue} bg={T.blueBg} onNavigate={onNavigate} />
          </div>
        </div>

        {/* Recent movements */}
        <div style={{ ...card, padding: "20px 24px" }}>
          <SectionHeader
            title="Movimientos recientes"
            subtitle="Últimos 8 registros de ingresos y egresos"
            action="Ver ingresos"
            onAction={() => onNavigate?.("ingresos")}
          />
          {recentMoves.length > 0 ? (
            recentMoves.map((item, i) => (
              <MovementRow key={item.id || i} item={item} last={i === recentMoves.length - 1} />
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0", color: T.muted, fontSize: 13 }}>
              Sin movimientos registrados
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
