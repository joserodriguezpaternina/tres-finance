import { useMemo, useState } from 'react'
import {
  TrendingUp, TrendingDown, DollarSign, Wallet,
  Layers, Receipt, AlertTriangle, ArrowUpRight,
  Users, FileText, RefreshCw, BarChart2
} from 'lucide-react'
import {
  BarChart, Bar, AreaChart, Area, ComposedChart, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { T, MONTHS_SHORT, fmtS, fmt, calcFin, filterM } from '../constants.js'
import { KPI, Pill, Tip, card } from '../ui.jsx'

const PIE_COLORS = [T.red, "#F97316", T.amber, T.violet, T.blue, T.green]

const StatMini = ({ label, value, trend, color, spark }) => (
  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 14, minWidth: 140 }}>
    <div>
      <div style={{ fontSize: 11, color: T.muted, fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: T.text, fontFamily: "'DM Mono',monospace", letterSpacing: "-.5px", lineHeight: 1 }}>{value}</div>
      {trend !== undefined && (
        <div style={{ fontSize: 11, color: trend >= 0 ? T.green : T.red, marginTop: 4, fontWeight: 600 }}>
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </div>
      )}
    </div>
    {spark && (
      <div style={{ width: 54, height: 38, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={spark} barSize={4}>
            <Bar dataKey="v" fill={color || T.muted} radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
)

const QuickLinkCard = ({ title, icon: Icon, bg, color, count, onClick }) => (
  <div
    onClick={onClick}
    style={{ ...card, padding: "20px 22px", cursor: "pointer", transition: "box-shadow .15s", display: "flex", flexDirection: "column", gap: 14 }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.07)"}
    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: T.text, fontFamily: "'DM Mono',monospace", letterSpacing: "-.5px" }}>{count}</div>
      </div>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={20} color={color} />
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>↑ +7%</span>
        <span style={{ fontSize: 11, color: T.muted }}>Este año</span>
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: T.text2, display: "flex", alignItems: "center", gap: 3 }}>
        Ver más <ArrowUpRight size={13} />
      </span>
    </div>
  </div>
)

const ReportLink = ({ label, onClick }) => (
  <div
    onClick={onClick}
    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderBottom: `1px solid ${T.border}`, cursor: "pointer" }}
    onMouseEnter={e => { e.currentTarget.style.background = T.surf2; e.currentTarget.style.paddingLeft = "8px"; e.currentTarget.style.paddingRight = "8px"; e.currentTarget.style.borderRadius = "8px"; e.currentTarget.style.margin = "0 -8px" }}
    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.paddingLeft = "0"; e.currentTarget.style.paddingRight = "0"; e.currentTarget.style.margin = "0" }}
  >
    <span style={{ fontSize: 13, color: T.text2, fontWeight: 500 }}>{label}</span>
    <ArrowUpRight size={14} color={T.muted} />
  </div>
)

export default function Dashboard({ fin, incomes, expenses, allInc, allExp, month, year, onNavigate }) {
  const [period, setPeriod] = useState("Anual")

  const catData = useMemo(() => {
    const map = {}
    expenses.forEach(e => { map[e.cat] = (map[e.cat] || 0) + Number(e.amount) })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }))
  }, [expenses])

  const trend = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const f = calcFin(filterM(allInc, i, year), filterM(allExp, i, year))
    return { name: MONTHS_SHORT[i], ingresos: f.tI, egresos: f.tE, utilidad: f.util }
  }), [allInc, allExp, year])

  const recentTrend6 = trend.slice(Math.max(0, month - 5), month + 1)

  const incSpark = recentTrend6.map(d => ({ v: d.ingresos }))
  const expSpark = recentTrend6.map(d => ({ v: d.egresos }))
  const utlSpark = recentTrend6.map(d => ({ v: d.utilidad }))

  const pending = incomes.filter(i => i.status === "Pendiente")
  const totalPending = pending.reduce((s, i) => s + Number(i.amount), 0)
  const totalClients = [...new Set(allInc.map(i => i.client).filter(Boolean))].length

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Alert banner */}
      {pending.length > 0 && (
        <div style={{ background: "#FFFBEB", border: `1px solid #FDE68A`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle size={15} color={T.amber} />
          <span style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>
            <span style={{ color: T.amber, fontWeight: 700 }}>{pending.length} facturas pendientes</span>{" "}
            por cobrar —{" "}
            <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, color: T.amber }}>{fmt(totalPending)}</span>
          </span>
        </div>
      )}

      {/* ── Analytics Header Card ── */}
      <div style={{ ...card, padding: "22px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 3 }}>Estado del año</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Resumen Financiero</div>
          </div>
          <div style={{ display: "flex", gap: 4, background: T.bg, borderRadius: 10, padding: 4 }}>
            {["Anual", "Mensual", "Semanal"].map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                padding: "5px 14px", borderRadius: 7, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 600, fontFamily: "inherit",
                background: period === p ? T.surf : "transparent",
                color: period === p ? T.text : T.muted,
                boxShadow: period === p ? "0 1px 4px rgba(0,0,0,.06)" : "none",
              }}>{p}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
          <StatMini
            label="Ingresos"
            value={fmtS(fin.tI)}
            trend={7}
            color={T.green}
            spark={incSpark}
          />
          <div style={{ width: 1, background: T.border, margin: "0 24px", flexShrink: 0, alignSelf: "stretch" }} />
          <StatMini
            label="Egresos"
            value={fmtS(fin.tE)}
            trend={-3}
            color={T.red}
            spark={expSpark}
          />
          <div style={{ width: 1, background: T.border, margin: "0 24px", flexShrink: 0, alignSelf: "stretch" }} />
          <StatMini
            label="Utilidad neta"
            value={fmtS(fin.util)}
            trend={fin.util >= 0 ? 4 : -4}
            color={fin.util >= 0 ? T.green : T.red}
            spark={utlSpark}
          />
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
          {[["Ingresos", T.green], ["Egresos", T.red], ["Utilidad", T.violet]].map(([l, c]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: c, display: "inline-block" }} />
              <span style={{ fontSize: 12, color: T.muted }}>{l}</span>
            </div>
          ))}
        </div>

        {/* Full year bar+area chart */}
        <div style={{ marginTop: 18 }}>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={trend} barGap={3} barSize={10}>
              <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: T.muted, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v => fmtS(v)} width={58} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="ingresos" name="Ingresos" fill={T.green} radius={[3,3,0,0]} opacity={0.85} />
              <Bar dataKey="egresos"  name="Egresos"  fill={T.red}   radius={[3,3,0,0]} opacity={0.85} />
              <Area type="monotone" dataKey="utilidad" name="Utilidad" fill="rgba(90,62,231,.08)" stroke={T.violet} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Quick Overview Cards ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Resumen del período</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${T.border}`, background: T.surf, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: T.muted }}>‹</button>
            <button style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${T.border}`, background: T.surf, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: T.text }}>›</button>
          </div>
        </div>
        <div className="g4">
          <QuickLinkCard title="Total ingresos" icon={TrendingUp}  bg="rgba(68,178,107,.1)"  color={T.green}  count={incomes.length}  onClick={() => onNavigate?.("ingresos")} />
          <QuickLinkCard title="Total egresos"  icon={TrendingDown} bg="rgba(215,43,32,.1)"  color={T.red}    count={expenses.length} onClick={() => onNavigate?.("egresos")} />
          <QuickLinkCard title="Clientes"        icon={Users}        bg="rgba(37,99,235,.1)"  color={T.blue}   count={totalClients}    onClick={() => onNavigate?.("clientes")} />
          <QuickLinkCard title="Recurrentes"     icon={RefreshCw}    bg="rgba(90,62,231,.1)"  color={T.violet} count={"—"}             onClick={() => onNavigate?.("recurrentes")} />
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="gc">
        {/* Donut */}
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>Distribución egresos</div>
          <div style={{ fontSize: 11, color: T.muted, marginBottom: 14 }}>Por categoría este mes</div>
          {catData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" paddingAngle={3}>
                    {catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => fmtS(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 6 }}>
                {catData.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], display: "inline-block", flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: T.text2 }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.text, fontFamily: "'DM Mono',monospace" }}>{fmtS(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: T.muted, fontSize: 13 }}>Sin egresos este mes</div>
          )}
        </div>

        {/* IVA & tax summary */}
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>Resumen fiscal</div>
          <div style={{ fontSize: 11, color: T.muted, marginBottom: 18 }}>IVA del período</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "IVA cobrado",  value: fin.tIVAc, color: T.green },
              { label: "IVA pagado",   value: fin.tIVAp, color: T.red },
              { label: "IVA neto",     value: fin.ivaN,  color: fin.ivaN >= 0 ? T.violet : T.green, bold: true },
            ].map(({ label, value, color, bold }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 13, color: T.text2, fontWeight: bold ? 700 : 400 }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "'DM Mono',monospace" }}>{fmtS(value)}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 10, background: fin.ivaN >= 0 ? "rgba(215,43,32,.06)" : "rgba(68,178,107,.06)", border: `1px solid ${fin.ivaN >= 0 ? "rgba(215,43,32,.15)" : "rgba(68,178,107,.15)"}` }}>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>{fin.ivaN >= 0 ? "A declarar ante la DIAN" : "Saldo a favor DIAN"}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: fin.ivaN >= 0 ? T.red : T.green, fontFamily: "'DM Mono',monospace" }}>{fmtS(Math.abs(fin.ivaN))}</div>
          </div>
        </div>
      </div>

      {/* ── Reports & Masters ── */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Reportes y accesos rápidos</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0 }}>
          {[
            { section: "Contabilidad", links: [{ label: "Ingresos", view: "ingresos" }, { label: "Egresos", view: "egresos" }, { label: "Reportes anuales", view: "reportes" }] },
            { section: "Operaciones",  links: [{ label: "Recurrentes", view: "recurrentes" }, { label: "Flujo de caja", view: "flujo" }, { label: "Importar extracto", view: "importar" }] },
            { section: "Clientes",     links: [{ label: "Gestión de clientes", view: "clientes" }, { label: "Facturas pendientes", view: "ingresos" }] },
          ].map(({ section, links }, si) => (
            <div key={section} style={{ paddingRight: si < 2 ? 24 : 0, borderRight: si < 2 ? `1px solid ${T.border}` : "none", marginRight: si < 2 ? 24 : 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 2, paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>{section}</div>
              {links.map(({ label, view }) => (
                <ReportLink key={label} label={label} onClick={() => onNavigate?.(view)} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent movements ── */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Movimientos recientes</div>
          <button onClick={() => onNavigate?.("ingresos")} style={{ fontSize: 12, color: T.muted, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            Ver todos <ArrowUpRight size={13} />
          </button>
        </div>
        {[...incomes.map(i => ({ ...i, tipo: "I" })), ...expenses.map(e => ({ ...e, tipo: "E" }))]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 7)
          .map((item, i, arr) => (
            <div key={item.id || i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: item.tipo === "I" ? "rgba(68,178,107,.1)" : "rgba(215,43,32,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {item.tipo === "I"
                    ? <TrendingUp size={14} color={T.green} />
                    : <TrendingDown size={14} color={T.red} />}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
                    {item.tipo === "I" ? item.client : (item.desc || item.description)}
                  </div>
                  <div style={{ fontSize: 11, color: T.muted }}>
                    {item.tipo === "I" ? item.project : item.cat} · {item.date}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {item.status && <Pill s={item.status} />}
                <span style={{ fontSize: 13, fontWeight: 700, color: item.tipo === "I" ? T.green : T.red, fontFamily: "'DM Mono',monospace" }}>
                  {item.tipo === "I" ? "+" : "−"}{fmtS(item.amount)}
                </span>
              </div>
            </div>
          ))}
        {incomes.length === 0 && expenses.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0", color: T.muted, fontSize: 13 }}>Sin movimientos este mes</div>
        )}
      </div>

    </div>
  )
}
