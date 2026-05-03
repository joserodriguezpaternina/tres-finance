import { useMemo, useState } from 'react'
import {
  TrendingUp, TrendingDown, AlertCircle, DollarSign,
  Wallet, BarChart2, ArrowUpRight, ArrowDownRight, Calendar
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell
} from 'recharts'
import { T, MONTHS, MONTHS_SHORT, fmtS, calcFin, filterM } from '../constants.js'
import { card, Tip } from '../ui.jsx'

const fmt = n => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0}).format(n)

const TRIMESTRES = [
  { label: "T1", meses: [0,1,2], vence: "May 2026" },
  { label: "T2", meses: [3,4,5], vence: "Ago 2026" },
  { label: "T3", meses: [6,7,8], vence: "Nov 2026" },
  { label: "T4", meses: [9,10,11], vence: "Feb 2027" },
]

/* ── shared ──────────────────────────────────────────────── */
const SectionHeader = ({ title, sub }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{title}</div>
    {sub && <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>{sub}</div>}
  </div>
)

const Legend = ({ items }) => (
  <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
    {items.map(([label, color]) => (
      <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: "inline-block" }} />
        <span style={{ fontSize: 12, color: T.muted }}>{label}</span>
      </div>
    ))}
  </div>
)

/* ── REPORTS ─────────────────────────────────────────────── */
export function ReportsView({ allInc, allExp, year }) {
  const [activeT, setActiveT] = useState(null)

  const data = useMemo(() => MONTHS_SHORT.map((name, m) => {
    const f = calcFin(filterM(allInc, m, year), filterM(allExp, m, year))
    return { name, ingresos: f.tI, egresos: f.tE, utilidad: f.util, ivaC: f.tIVAc, ivaP: f.tIVAp, ivaN: f.ivaN }
  }), [allInc, allExp, year])

  const totals = data.reduce((a, m) => ({
    i: a.i + m.ingresos, e: a.e + m.egresos, u: a.u + m.utilidad,
    ivaC: a.ivaC + m.ivaC, ivaP: a.ivaP + m.ivaP, ivaN: a.ivaN + m.ivaN,
  }), { i:0, e:0, u:0, ivaC:0, ivaP:0, ivaN:0 })

  const trimestreData = TRIMESTRES.map(t => {
    const inc  = t.meses.reduce((s,m) => s + data[m].ingresos, 0)
    const exp  = t.meses.reduce((s,m) => s + data[m].egresos,  0)
    const ivaC = t.meses.reduce((s,m) => s + data[m].ivaC, 0)
    const ivaP = t.meses.reduce((s,m) => s + data[m].ivaP, 0)
    return { ...t, inc, exp, util: inc - exp, ivaC, ivaP, ivaN: ivaC - ivaP }
  })

  const marginAnual = totals.i > 0 ? (totals.u / totals.i * 100) : 0

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: T.text, letterSpacing: "-.5px" }}>Reportes</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: T.muted }}>Resumen financiero anual · {year}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, background: T.surf, border: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600, color: T.text2 }}>
            <Calendar size={14} color={T.muted} />
            {year}
          </div>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div className="g4">
        {[
          { label: "Ingresos totales",  value: totals.i,  color: T.green,  bg: "rgba(68,178,107,.07)",  icon: TrendingUp,   sub: `${allInc.length} facturas` },
          { label: "Egresos totales",   value: totals.e,  color: T.red,    bg: "rgba(215,43,32,.07)",   icon: TrendingDown, sub: `${allExp.length} registros` },
          { label: "Utilidad del año",  value: totals.u,  color: totals.u >= 0 ? T.green : T.red, bg: totals.u >= 0 ? "rgba(68,178,107,.07)" : "rgba(215,43,32,.07)", icon: DollarSign, sub: "Base gravable" },
          { label: "Margen operativo",  value: `${marginAnual.toFixed(1)}%`, color: T.violet, bg: "rgba(90,62,231,.07)", icon: BarChart2, sub: "Rentabilidad anual", raw: true },
        ].map(({ label, value, color, bg, icon: Icon, sub, raw }) => (
          <div key={label} style={{ background: T.surf, borderRadius: 16, border: `1px solid ${T.border}`, padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: ".08em", maxWidth: 120, lineHeight: 1.4 }}>{label}</span>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={15} color={color} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: T.text, fontFamily: raw ? "inherit" : "'DM Mono',monospace", letterSpacing: "-.5px", lineHeight: 1.1 }}>{raw ? value : fmtS(value)}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 8 }}>{sub}</div>
            <div style={{ height: 2, borderRadius: 99, marginTop: 14, background: `linear-gradient(90deg, ${color}, transparent)`, opacity: .25 }} />
          </div>
        ))}
      </div>

      {/* ── Trimestres row ── */}
      <div style={card}>
        <SectionHeader title="Resumen trimestral" sub={`Ingresos, egresos y utilidad por trimestre · ${year}`} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {trimestreData.map((t, i) => {
            const active = activeT === i
            const margin = t.inc > 0 ? (t.util / t.inc * 100) : 0
            return (
              <div
                key={i}
                onClick={() => setActiveT(active ? null : i)}
                style={{
                  borderRadius: 12, padding: "18px 16px", cursor: "pointer",
                  border: active ? `1.5px solid ${T.text}` : `1px solid ${T.border}`,
                  background: active ? T.text : T.surf,
                  transition: "all .15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: active ? "#fff" : T.text }}>{t.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
                    background: active ? "rgba(255,255,255,.15)" : T.bg,
                    color: active ? "#fff" : T.muted,
                  }}>Vence {t.vence}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "Ingresos", value: t.inc,  color: active ? "#4ade80" : T.green },
                    { label: "Egresos",  value: t.exp,  color: active ? "#f87171" : T.red },
                    { label: "Utilidad", value: t.util, color: active ? (t.util >= 0 ? "#a78bfa" : "#f87171") : (t.util >= 0 ? T.violet : T.red) },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: active ? "rgba(255,255,255,.5)" : T.muted }}>{label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "'DM Mono',monospace" }}>{value > 0 || value < 0 ? fmtS(value) : "—"}</span>
                    </div>
                  ))}
                </div>
                {t.inc > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ height: 3, borderRadius: 99, background: active ? "rgba(255,255,255,.15)" : T.border }}>
                      <div style={{ height: "100%", borderRadius: 99, width: `${Math.min(100, Math.max(0, margin))}%`, background: active ? "#a78bfa" : T.violet, transition: "width .4s" }} />
                    </div>
                    <div style={{ fontSize: 10, color: active ? "rgba(255,255,255,.4)" : T.muted, marginTop: 4 }}>{margin.toFixed(1)}% margen</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── IVA DIAN panel ── */}
      <div style={{ borderRadius: 16, padding: "24px 28px", background: T.text, border: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 8 }}>IVA acumulado {year}</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: "#fff", fontFamily: "'DM Mono',monospace", letterSpacing: "-1.5px", lineHeight: 1 }}>{fmt(totals.ivaN)}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginTop: 6 }}>Total a declarar ante la DIAN</div>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[
              { label: "IVA cobrado", value: totals.ivaC, color: "#4ade80" },
              { label: "IVA pagado",  value: totals.ivaP, color: "#f87171" },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em" }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: "'DM Mono',monospace" }}>{fmt(value)}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {trimestreData.map((t, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,.05)", borderRadius: 10, padding: "14px 16px", border: t.ivaN > 0 ? "1px solid rgba(248,113,113,.25)" : "1px solid rgba(255,255,255,.07)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.6)" }}>{t.label}</span>
                {t.ivaN > 0 && <AlertCircle size={13} color="#f87171" />}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: t.ivaN > 0 ? "#f87171" : t.ivaN < 0 ? "#4ade80" : "rgba(255,255,255,.3)", fontFamily: "'DM Mono',monospace", letterSpacing: "-.5px" }}>
                {t.ivaN !== 0 ? fmt(Math.abs(t.ivaN)) : "—"}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>
                  {t.ivaN > 0 ? "A pagar" : t.ivaN < 0 ? "A favor" : "Sin movimiento"}
                </span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,.25)" }}>Vence {t.vence}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }}>
        {/* Bar chart */}
        <div style={card}>
          <SectionHeader title="Ingresos vs Egresos" sub={`Comparativo mensual ${year}`} />
          <Legend items={[["Ingresos", T.green], ["Egresos", T.red]]} />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} barGap={4} barSize={14}>
              <defs>
                <linearGradient id="rGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.green} stopOpacity={1}/>
                  <stop offset="100%" stopColor={T.green} stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="rRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.red} stopOpacity={1}/>
                  <stop offset="100%" stopColor={T.red} stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false}/>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 10, fill: T.muted, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v => fmtS(v)} width={62}/>
              <Tooltip content={<Tip />}/>
              <Bar dataKey="ingresos" name="Ingresos" fill="url(#rGreen)" radius={[5,5,0,0]}/>
              <Bar dataKey="egresos"  name="Egresos"  fill="url(#rRed)"   radius={[5,5,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Utilidad area */}
        <div style={card}>
          <SectionHeader title="Utilidad neta" sub="Evolución del margen mensual" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="rUtil" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.violet} stopOpacity={0.2}/>
                  <stop offset="100%" stopColor={T.violet} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false}/>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 10, fill: T.muted, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v => fmtS(v)} width={62}/>
              <Tooltip content={<Tip />}/>
              <ReferenceLine y={0} stroke={T.border} strokeDasharray="3 3"/>
              <Area type="monotone" dataKey="utilidad" name="Utilidad" stroke={T.violet} strokeWidth={2.5} fill="url(#rUtil)" dot={{ r: 3, fill: T.violet, strokeWidth: 0 }} activeDot={{ r: 5 }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Monthly table ── */}
      <div style={{ ...card, overflowX: "auto" }}>
        <SectionHeader title="Detalle mensual" sub={`Todos los meses de ${year}`} />
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
          <thead>
            <tr>
              {["Mes", "Ingresos", "Egresos", "Utilidad", "IVA neto", "Margen"].map(h => (
                <th key={h} style={{ textAlign: "left", fontSize: 10, fontWeight: 700, color: T.muted, padding: "0 16px 12px 0", textTransform: "uppercase", letterSpacing: ".08em", borderBottom: `1px solid ${T.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((m, i) => {
              const margin = m.ingresos > 0 ? (m.utilidad / m.ingresos * 100) : 0
              const empty  = m.ingresos === 0 && m.egresos === 0
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ padding: "13px 16px 13px 0", fontSize: 13, fontWeight: 600, color: empty ? T.muted : T.text }}>{MONTHS[i]}</td>
                  <td style={{ padding: "13px 16px 13px 0", fontSize: 13, fontWeight: 600, color: T.green, fontFamily: "'DM Mono',monospace" }}>{empty ? "—" : fmtS(m.ingresos)}</td>
                  <td style={{ padding: "13px 16px 13px 0", fontSize: 13, fontWeight: 600, color: T.red,   fontFamily: "'DM Mono',monospace" }}>{empty ? "—" : fmtS(m.egresos)}</td>
                  <td style={{ padding: "13px 16px 13px 0", fontSize: 13, fontWeight: 600, color: m.utilidad >= 0 ? T.green : T.red, fontFamily: "'DM Mono',monospace" }}>{empty ? "—" : fmtS(m.utilidad)}</td>
                  <td style={{ padding: "13px 16px 13px 0", fontSize: 12, color: m.ivaN > 0 ? T.amber : T.muted, fontFamily: "'DM Mono',monospace" }}>{m.ivaN > 0 ? fmtS(m.ivaN) : "—"}</td>
                  <td style={{ padding: "13px 0" }}>
                    {!empty ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 64, height: 5, borderRadius: 99, background: T.border, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.min(100, Math.max(0, margin))}%`, borderRadius: 99, background: margin > 40 ? T.green : margin > 20 ? T.amber : T.red }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: margin > 40 ? T.green : margin > 20 ? T.amber : T.red, fontFamily: "'DM Mono',monospace", minWidth: 36 }}>
                          {margin.toFixed(1)}%
                        </span>
                      </div>
                    ) : <span style={{ color: T.muted, fontSize: 12 }}>—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: `2px solid ${T.border}` }}>
              <td style={{ padding: "13px 16px 4px 0", fontSize: 12, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>Total</td>
              <td style={{ padding: "13px 16px 4px 0", fontSize: 13, fontWeight: 700, color: T.green, fontFamily: "'DM Mono',monospace" }}>{fmtS(totals.i)}</td>
              <td style={{ padding: "13px 16px 4px 0", fontSize: 13, fontWeight: 700, color: T.red,   fontFamily: "'DM Mono',monospace" }}>{fmtS(totals.e)}</td>
              <td style={{ padding: "13px 16px 4px 0", fontSize: 13, fontWeight: 700, color: totals.u >= 0 ? T.green : T.red, fontFamily: "'DM Mono',monospace" }}>{fmtS(totals.u)}</td>
              <td style={{ padding: "13px 16px 4px 0", fontSize: 12, fontWeight: 700, color: T.amber, fontFamily: "'DM Mono',monospace" }}>{totals.ivaN > 0 ? fmtS(totals.ivaN) : "—"}</td>
              <td style={{ padding: "13px 0 4px" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: marginAnual > 40 ? T.green : marginAnual > 20 ? T.amber : T.red, fontFamily: "'DM Mono',monospace" }}>
                  {marginAnual.toFixed(1)}%
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

/* ── CASH FLOW ─────────────────────────────────────────────── */
export function CashFlowView({ allInc, allExp, year }) {
  const data = useMemo(() => {
    let acum = 0
    return MONTHS_SHORT.map((name, m) => {
      const inc  = filterM(allInc, m, year)
      const exp  = filterM(allExp, m, year)
      const cobr = inc.filter(i => i.status === "Pagado").reduce((s, i) => s + Number(i.amount), 0)
      const pag  = exp.reduce((s, e) => s + Number(e.amount), 0)
      acum += cobr - pag
      return { name, cobrado: cobr, pagado: pag, neto: cobr - pag, acumulado: acum }
    })
  }, [allInc, allExp, year])

  const totalCobrado = data.reduce((s, d) => s + d.cobrado, 0)
  const totalPagado  = data.reduce((s, d) => s + d.pagado,  0)
  const cajaFinal    = data[data.length - 1]?.acumulado || 0
  const netoCaja     = totalCobrado - totalPagado
  const maxVal       = Math.max(...data.map(d => Math.max(d.cobrado, d.pagado))) || 1

  const pendientes   = allInc.filter(i => i.status === "Pendiente")
  const totalPend    = pendientes.reduce((s, i) => s + Number(i.amount), 0)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: T.text, letterSpacing: "-.5px" }}>Flujo de caja</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: T.muted }}>Solo transacciones marcadas como Pagado · {year}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, background: T.surf, border: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600, color: T.text2 }}>
            <Calendar size={14} color={T.muted} />
            {year}
          </div>
        </div>
      </div>

      {/* ── Caja banner ── */}
      <div style={{ borderRadius: 16, background: cajaFinal >= 0 ? T.text : "#7F1D1D", padding: "28px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 8 }}>Posición de caja actual</div>
          <div style={{ fontSize: 40, fontWeight: 700, color: "#fff", fontFamily: "'DM Mono',monospace", letterSpacing: "-2px", lineHeight: 1 }}>{fmt(cajaFinal)}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginTop: 8 }}>
            {cajaFinal >= 0 ? "Caja positiva — margen disponible" : "Caja negativa — revisar egresos"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          {[
            { label: "Total cobrado", value: totalCobrado, color: "#4ade80" },
            { label: "Total pagado",  value: totalPagado,  color: "#f87171" },
            { label: "Por cobrar",    value: totalPend,    color: "#fbbf24" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".07em" }}>{label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: "'DM Mono',monospace" }}>{fmt(value)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── KPI row ── */}
      <div className="g4">
        {[
          { label: "Total cobrado",  value: totalCobrado, color: T.green,  bg: "rgba(68,178,107,.07)",  icon: ArrowUpRight,   sub: `${allInc.filter(i=>i.status==="Pagado").length} pagos recibidos` },
          { label: "Total pagado",   value: totalPagado,  color: T.red,    bg: "rgba(215,43,32,.07)",   icon: ArrowDownRight, sub: `${allExp.length} egresos` },
          { label: "Neto del año",   value: netoCaja,     color: netoCaja >= 0 ? T.green : T.red, bg: netoCaja >= 0 ? "rgba(68,178,107,.07)" : "rgba(215,43,32,.07)", icon: Wallet, sub: "Cobrado − Pagado" },
          { label: "Pendiente cobro",value: totalPend,    color: T.amber,  bg: "rgba(217,119,6,.07)",   icon: AlertCircle,    sub: `${pendientes.length} facturas abiertas` },
        ].map(({ label, value, color, bg, icon: Icon, sub }) => (
          <div key={label} style={{ background: T.surf, borderRadius: 16, border: `1px solid ${T.border}`, padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: ".08em", maxWidth: 120, lineHeight: 1.4 }}>{label}</span>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={15} color={color} />
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: T.text, fontFamily: "'DM Mono',monospace", letterSpacing: "-.5px", lineHeight: 1.1 }}>{fmtS(value)}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 8 }}>{sub}</div>
            <div style={{ height: 2, borderRadius: 99, marginTop: 14, background: `linear-gradient(90deg, ${color}, transparent)`, opacity: .25 }} />
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }}>
        {/* Caja acumulada */}
        <div style={card}>
          <SectionHeader title="Caja acumulada" sub="Posición de liquidez mes a mes" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="cfAcum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.green} stopOpacity={0.18}/>
                  <stop offset="100%" stopColor={T.green} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false}/>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 10, fill: T.muted, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v => fmtS(v)} width={62}/>
              <Tooltip content={<Tip />}/>
              <ReferenceLine y={0} stroke={T.border} strokeDasharray="3 3"/>
              <Area type="monotone" dataKey="acumulado" name="Caja acumulada" stroke={T.green} strokeWidth={2.5} fill="url(#cfAcum)" dot={{ r: 3, fill: T.green, strokeWidth: 0 }} activeDot={{ r: 5 }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Neto mensual */}
        <div style={card}>
          <SectionHeader title="Neto mensual" sub="Cobrado menos pagado por mes" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} barSize={16}>
              <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false}/>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 10, fill: T.muted, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v => fmtS(v)} width={62}/>
              <Tooltip content={<Tip />}/>
              <ReferenceLine y={0} stroke={T.border}/>
              <Bar dataKey="neto" name="Neto" radius={[5,5,0,0]}>
                {data.map((d, i) => <Cell key={i} fill={d.neto >= 0 ? T.green : T.red} opacity={0.85}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Entradas vs Salidas full-width ── */}
      <div style={card}>
        <SectionHeader title="Entradas vs Salidas reales" sub="Movimientos efectivamente cobrados y pagados" />
        <Legend items={[["Cobrado", T.green], ["Pagado", T.red]]} />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barGap={4} barSize={14}>
            <defs>
              <linearGradient id="cfG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.green} stopOpacity={1}/><stop offset="100%" stopColor={T.green} stopOpacity={0.3}/>
              </linearGradient>
              <linearGradient id="cfR" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.red} stopOpacity={1}/><stop offset="100%" stopColor={T.red} stopOpacity={0.3}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false}/>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize: 10, fill: T.muted, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v => fmtS(v)} width={62}/>
            <Tooltip content={<Tip />}/>
            <Bar dataKey="cobrado" name="Cobrado" fill="url(#cfG)" radius={[5,5,0,0]}/>
            <Bar dataKey="pagado"  name="Pagado"  fill="url(#cfR)" radius={[5,5,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Monthly table ── */}
      <div style={{ ...card, overflowX: "auto" }}>
        <SectionHeader title="Detalle mensual" sub="Movimientos reales de caja por mes" />
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
          <thead>
            <tr>
              {["Mes", "Cobrado", "Pagado", "Neto", "Acumulado", "Estado"].map(h => (
                <th key={h} style={{ textAlign: "left", fontSize: 10, fontWeight: 700, color: T.muted, padding: "0 16px 12px 0", textTransform: "uppercase", letterSpacing: ".08em", borderBottom: `1px solid ${T.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => {
              const empty = d.cobrado === 0 && d.pagado === 0
              const pct   = maxVal > 0 ? (d.cobrado / maxVal * 100) : 0
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ padding: "13px 16px 13px 0", fontSize: 13, fontWeight: 600, color: empty ? T.muted : T.text }}>{MONTHS[i]}</td>
                  <td style={{ padding: "13px 16px 13px 0", fontSize: 13, fontWeight: 600, color: T.green, fontFamily: "'DM Mono',monospace" }}>{d.cobrado > 0 ? fmtS(d.cobrado) : "—"}</td>
                  <td style={{ padding: "13px 16px 13px 0", fontSize: 13, fontWeight: 600, color: T.red,   fontFamily: "'DM Mono',monospace" }}>{d.pagado  > 0 ? fmtS(d.pagado)  : "—"}</td>
                  <td style={{ padding: "13px 16px 13px 0", fontSize: 13, fontWeight: 600, color: d.neto >= 0 ? T.green : T.red, fontFamily: "'DM Mono',monospace" }}>{!empty ? fmtS(d.neto) : "—"}</td>
                  <td style={{ padding: "13px 16px 13px 0", fontSize: 13, fontWeight: 600, color: d.acumulado >= 0 ? T.green : T.red, fontFamily: "'DM Mono',monospace" }}>{!empty ? fmtS(d.acumulado) : "—"}</td>
                  <td style={{ padding: "13px 0" }}>
                    {!empty ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 56, height: 5, borderRadius: 99, background: T.border, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: d.neto >= 0 ? T.green : T.red }} />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                          background: d.neto >= 0 ? "rgba(68,178,107,.1)" : "rgba(215,43,32,.1)",
                          color: d.neto >= 0 ? T.green : T.red,
                        }}>{d.neto >= 0 ? "+" : "−"}</span>
                      </div>
                    ) : <span style={{ color: T.muted, fontSize: 12 }}>—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: `2px solid ${T.border}` }}>
              <td style={{ padding: "13px 16px 4px 0", fontSize: 12, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>Total</td>
              <td style={{ padding: "13px 16px 4px 0", fontSize: 13, fontWeight: 700, color: T.green, fontFamily: "'DM Mono',monospace" }}>{fmtS(totalCobrado)}</td>
              <td style={{ padding: "13px 16px 4px 0", fontSize: 13, fontWeight: 700, color: T.red,   fontFamily: "'DM Mono',monospace" }}>{fmtS(totalPagado)}</td>
              <td style={{ padding: "13px 16px 4px 0", fontSize: 13, fontWeight: 700, color: netoCaja >= 0 ? T.green : T.red, fontFamily: "'DM Mono',monospace" }}>{fmtS(netoCaja)}</td>
              <td style={{ padding: "13px 16px 4px 0", fontSize: 13, fontWeight: 700, color: cajaFinal >= 0 ? T.green : T.red, fontFamily: "'DM Mono',monospace" }}>{fmtS(cajaFinal)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
