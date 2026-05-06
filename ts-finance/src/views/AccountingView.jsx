import { useMemo, useState } from 'react'
import { FileText, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { T, MONTHS_SHORT, fmtS, calcFin, filterM, DIAN_DEDUCIBLES } from '../constants.js'
import { card, Tip } from '../ui.jsx'

const SummaryCard = ({ title, sub, value, trend, trendLabel, trendUp, sparkData, sparkColor }) => (
  <div style={{ ...card, padding: "22px 24px" }}>
    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 8 }}>{title}</div>
    <div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>{sub}</div>
    <div style={{ fontSize: 28, fontWeight: 700, color: T.text, fontFamily: "'DM Mono',monospace", letterSpacing: "-.5px", marginBottom: 10 }}>{value}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: trendUp ? T.green : T.red }}>{trendUp ? "↑" : "↓"} {trend}</span>
      <span style={{ fontSize: 11, color: T.muted }}>{trendLabel}</span>
    </div>
    <div style={{ height: 60 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sparkData}>
          <Line type="monotone" dataKey="v" stroke={sparkColor} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
)

const DeducBadge = ({ rule }) => {
  if (!rule) return null
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
      background: rule.color + "18", color: rule.color,
      whiteSpace: "nowrap", letterSpacing: ".03em",
    }}>{rule.label}</span>
  )
}

export default function AccountingView({ allInc, allExp, year, month }) {
  const [analyticsPeriod, setAnalyticsPeriod] = useState("12 meses")
  const [expandedCat, setExpandedCat] = useState(null)
  const [rentaTab, setRentaTab] = useState("resumen")

  const monthlyData = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const f = calcFin(filterM(allInc, i, year), filterM(allExp, i, year))
    return { name: MONTHS_SHORT[i], ingresos: f.tI, egresos: f.tE, utilidad: f.util, cobrado: f.cobr }
  }), [allInc, allExp, year])

  const incSpark = monthlyData.map(d => ({ v: d.ingresos }))
  const expSpark = monthlyData.map(d => ({ v: d.egresos }))
  const utlSpark = monthlyData.map(d => ({ v: d.utilidad }))

  const last6Inc = monthlyData.slice(Math.max(0, month - 5), month + 1)

  const totalInc = allInc.reduce((s, i) => s + Number(i.amount), 0)
  const totalExp = allExp.reduce((s, e) => s + Number(e.amount), 0)
  const totalPro = totalInc - totalExp

  /* ── Cálculo de deducibles ── */
  const expWithRules = useMemo(() => allExp.map(e => ({
    ...e,
    rule: DIAN_DEDUCIBLES[e.cat] || DIAN_DEDUCIBLES["Otros"],
  })), [allExp])

  const totalDeducible   = expWithRules.filter(e => e.rule.si === true).reduce((s, e) => s + Number(e.amount), 0)
  const totalNoDeducible = expWithRules.filter(e => e.rule.si === false).reduce((s, e) => s + Number(e.amount), 0)
  const totalCondicional = expWithRules.filter(e => e.rule.si === "p" || e.rule.si === "c").reduce((s, e) => s + Number(e.amount), 0)

  const ingresosBrutos = allInc.reduce((s, i) => {
    const iva = (i.hasIVA || i.has_iva) ? (Number(i.amount) * (i.ivaP || i.iva_p || 19)) / (100 + (i.ivaP || i.iva_p || 19)) : 0
    return s + Number(i.amount) - iva
  }, 0)
  const baseGravableEst = ingresosBrutos - totalDeducible

  /* Agrupado por categoría */
  const porCategoria = useMemo(() => {
    const map = {}
    for (const e of expWithRules) {
      if (!map[e.cat]) map[e.cat] = { cat: e.cat, rule: e.rule, total: 0, items: [] }
      map[e.cat].total += Number(e.amount)
      map[e.cat].items.push(e)
    }
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [expWithRules])

  /* Ingresos con documento soporte */
  const incConDoc  = allInc.filter(i => i.docNum || i.docTipo)
  const incSinDoc  = allInc.filter(i => !i.docNum && !i.docTipo)

  const deducPct = totalExp > 0 ? (totalDeducible / totalExp * 100) : 0

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Summary cards ── */}
      <div className="g3">
        <SummaryCard title="Total facturas de compra" sub="Egresos totales del año" value={fmtS(totalExp)}
          trend="+7%" trendLabel="vs año anterior" trendUp={true} sparkData={expSpark} sparkColor={T.red} />
        <SummaryCard title="Total pagos recibidos" sub="Ingresos totales del año" value={fmtS(totalInc)}
          trend="-7%" trendLabel="vs año anterior" trendUp={false} sparkData={incSpark} sparkColor={T.green} />
        <SummaryCard title="Utilidad total del año" sub="Margen operativo neto" value={fmtS(totalPro)}
          trend="+4%" trendLabel="vs año anterior" trendUp={totalPro >= 0} sparkData={utlSpark} sparkColor={T.violet} />
      </div>

      {/* ── Analítica total ── */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Analítica total</div>
            <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
              {[
                { label: fmtS(totalInc), color: T.green },
                { label: fmtS(totalExp), color: T.blue },
                { label: fmtS(totalPro), color: T.violet },
              ].map(({ label, color }, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: "inline-block" }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.text2, fontFamily: "'DM Mono',monospace" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, background: T.bg, borderRadius: 10, padding: 4 }}>
            {["12 meses", "30 días", "24 horas"].map(p => (
              <button key={p} onClick={() => setAnalyticsPeriod(p)} style={{
                padding: "5px 14px", borderRadius: 7, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 600, fontFamily: "inherit",
                background: analyticsPeriod === p ? T.surf : "transparent",
                color: analyticsPeriod === p ? T.text : T.muted,
                boxShadow: analyticsPeriod === p ? "0 1px 4px rgba(0,0,0,.06)" : "none",
              }}>{p}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={T.green} stopOpacity={0.15}/><stop offset="95%" stopColor={T.green} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={T.blue} stopOpacity={0.15}/><stop offset="95%" stopColor={T.blue} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gUtl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={T.violet} stopOpacity={0.15}/><stop offset="95%" stopColor={T.violet} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: T.muted, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v => fmtS(v)} width={60} />
            <Tooltip content={<Tip />} />
            <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke={T.green}  fill="url(#gInc)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="egresos"  name="Egresos"  stroke={T.blue}   fill="url(#gExp)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="utilidad" name="Utilidad" stroke={T.violet} fill="url(#gUtl)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Facturas entrantes (Compras)</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Última sincronización hace 2 minutos</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={last6Inc}>
              <defs>
                <linearGradient id="gInc2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.violet} stopOpacity={0.2}/><stop offset="95%" stopColor={T.violet} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: T.muted, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v => fmtS(v)} width={56} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="egresos" name="Egresos" stroke={T.red} fill="url(#gInc2)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="cobrado" name="Cobrado" stroke={T.violet} fill="transparent" strokeWidth={2} strokeDasharray="4 2" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 6 }}>Facturas salientes (Ventas)</div>
          <div style={{ fontSize: 11, color: T.muted, marginBottom: 10 }}>Última sincronización hace 2 minutos</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barSize={12}>
              <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: T.muted, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v => fmtS(v)} width={56} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="ingresos" name="Ingresos" fill={T.violet} radius={[3,3,0,0]} opacity={0.5} />
              <Bar dataKey="cobrado"  name="Cobrado"  fill={T.violet} radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          DECLARACIÓN DE RENTA — DIAN
         ══════════════════════════════════════════════════════ */}
      <div style={{ borderRadius: 16, border: `1px solid ${T.border}`, overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px", background: T.text, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>Declaración de Renta · {year}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#fff", fontFamily: "'DM Mono',monospace", letterSpacing: "-1px" }}>{fmtS(baseGravableEst)}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginTop: 4 }}>Base gravable estimada (ingresos netos − deducciones)</div>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { label: "Deducible", value: fmtS(totalDeducible),   color: "#4ade80" },
              { label: "Condicional", value: fmtS(totalCondicional), color: "#fbbf24" },
              { label: "No deducible", value: fmtS(totalNoDeducible), color: "#f87171" },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: "'DM Mono',monospace" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, background: T.redBg }}>
          <div style={{ height: "100%", width: `${Math.min(100, deducPct)}%`, background: `linear-gradient(90deg, ${T.green}, ${T.green}aa)`, transition: "width .6s" }} />
        </div>
        <div style={{ padding: "6px 24px 0", background: T.surf2, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: T.muted }}>{deducPct.toFixed(1)}% de gastos son deducibles</span>
          <span style={{ fontSize: 11, color: T.muted }}>{allExp.length} egresos analizados</span>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, background: T.surf2, borderBottom: `1px solid ${T.border}`, padding: "0 24px" }}>
          {[
            { id: "resumen",    label: "Por categoría" },
            { id: "detalle",    label: "Detalle de egresos" },
            { id: "documentos", label: "Documentos soporte" },
          ].map(t => (
            <button key={t.id} onClick={() => setRentaTab(t.id)} style={{
              padding: "12px 16px", border: "none", background: "transparent", cursor: "pointer",
              fontSize: 12, fontWeight: rentaTab === t.id ? 700 : 400,
              color: rentaTab === t.id ? T.text : T.muted,
              borderBottom: rentaTab === t.id ? `2px solid ${T.text}` : "2px solid transparent",
              fontFamily: "inherit", transition: "color .12s",
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{ padding: "20px 24px", background: T.surf }}>

          {/* ── Tab: Por categoría ── */}
          {rentaTab === "resumen" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {porCategoria.length === 0 ? (
                <div style={{ textAlign: "center", color: T.muted, fontSize: 13, padding: "24px 0" }}>Sin egresos registrados</div>
              ) : porCategoria.map(({ cat, rule, total, items }) => {
                const expanded = expandedCat === cat
                return (
                  <div key={cat} style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden" }}>
                    <button
                      onClick={() => setExpandedCat(expanded ? null : cat)}
                      style={{
                        display: "flex", alignItems: "center", width: "100%", padding: "12px 16px",
                        background: T.surf2, border: "none", cursor: "pointer", gap: 12, textAlign: "left",
                      }}
                    >
                      <DeducBadge rule={rule} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.text, flex: 1 }}>{cat}</span>
                      <span style={{ fontSize: 12, color: T.muted, marginRight: 4 }}>{items.length} registro{items.length !== 1 ? "s" : ""}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: rule.color, fontFamily: "'DM Mono',monospace" }}>{fmtS(total)}</span>
                      {expanded ? <ChevronUp size={14} color={T.muted} /> : <ChevronDown size={14} color={T.muted} />}
                    </button>
                    {expanded && (
                      <div style={{ padding: "8px 16px 12px", background: T.surf }}>
                        <div style={{ fontSize: 11, color: T.muted, marginBottom: 10, padding: "6px 10px", background: rule.color + "10", borderRadius: 7, borderLeft: `3px solid ${rule.color}` }}>
                          {rule.nota}
                        </div>
                        {items.map(e => (
                          <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${T.border}` }}>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{e.provider || e.sub || e.desc || cat}</div>
                              <div style={{ fontSize: 11, color: T.muted }}>{e.date}</div>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: T.text2, fontFamily: "'DM Mono',monospace" }}>{fmtS(Number(e.amount))}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Tab: Detalle de egresos ── */}
          {rentaTab === "detalle" && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 580 }}>
                <thead>
                  <tr>
                    {["Fecha", "Concepto", "Categoría", "Monto", "Estado DIAN"].map(h => (
                      <th key={h} style={{ textAlign: "left", fontSize: 10, fontWeight: 700, color: T.muted, padding: "0 12px 12px 0", textTransform: "uppercase", letterSpacing: ".08em", borderBottom: `1px solid ${T.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {expWithRules.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: "center", color: T.muted, padding: "24px 0", fontSize: 13 }}>Sin egresos registrados</td></tr>
                  ) : [...expWithRules].sort((a,b) => (b.date||"").localeCompare(a.date||"")).map((e, i) => (
                    <tr key={e.id || i} style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: "11px 12px 11px 0", fontSize: 12, color: T.muted }}>{e.date}</td>
                      <td style={{ padding: "11px 12px 11px 0", fontSize: 13, fontWeight: 600, color: T.text }}>{e.provider || e.sub || e.desc || "—"}</td>
                      <td style={{ padding: "11px 12px 11px 0", fontSize: 12, color: T.text2 }}>{e.cat}</td>
                      <td style={{ padding: "11px 12px 11px 0", fontSize: 13, fontWeight: 700, color: T.text2, fontFamily: "'DM Mono',monospace" }}>{fmtS(Number(e.amount))}</td>
                      <td style={{ padding: "11px 0" }}><DeducBadge rule={e.rule} /></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: `2px solid ${T.border}` }}>
                    <td colSpan={3} style={{ padding: "12px 12px 4px 0", fontSize: 12, fontWeight: 700, color: T.muted, textTransform: "uppercase" }}>Total deducible confirmado</td>
                    <td style={{ padding: "12px 12px 4px 0", fontSize: 13, fontWeight: 700, color: T.green, fontFamily: "'DM Mono',monospace" }}>{fmtS(totalDeducible)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* ── Tab: Documentos soporte ── */}
          {rentaTab === "documentos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* KPIs */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { label: "Con documento soporte", value: incConDoc.length, color: T.green,  bg: T.greenBg,  icon: CheckCircle },
                  { label: "Sin documento soporte", value: incSinDoc.length, color: T.amber,  bg: T.amberBg,  icon: AlertCircle },
                  { label: "Total ingresos",         value: allInc.length,   color: T.violet, bg: T.violetBg, icon: FileText },
                ].map(({ label, value, color, bg, icon: Icon }) => (
                  <div key={label} style={{ background: T.surf2, borderRadius: 10, padding: "14px 16px", border: `1px solid ${T.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".07em" }}>{label}</span>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={13} color={color} />
                      </div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: T.text, fontFamily: "'DM Mono',monospace" }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 580 }}>
                  <thead>
                    <tr>
                      {["Fecha", "Cliente", "Proyecto", "Monto", "Tipo doc.", "N° / Ref."].map(h => (
                        <th key={h} style={{ textAlign: "left", fontSize: 10, fontWeight: 700, color: T.muted, padding: "0 12px 12px 0", textTransform: "uppercase", letterSpacing: ".08em", borderBottom: `1px solid ${T.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allInc.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: "center", color: T.muted, padding: "24px 0", fontSize: 13 }}>Sin ingresos registrados</td></tr>
                    ) : [...allInc].sort((a,b) => (b.date||"").localeCompare(a.date||"")).map((inc, i) => {
                      const tieneDoc = inc.docNum || inc.docTipo
                      return (
                        <tr key={inc.id || i} style={{ borderBottom: `1px solid ${T.border}` }}>
                          <td style={{ padding: "11px 12px 11px 0", fontSize: 12, color: T.muted }}>{inc.date}</td>
                          <td style={{ padding: "11px 12px 11px 0", fontSize: 13, fontWeight: 600, color: T.text }}>{inc.client || "—"}</td>
                          <td style={{ padding: "11px 12px 11px 0", fontSize: 12, color: T.text2 }}>{inc.project || "—"}</td>
                          <td style={{ padding: "11px 12px 11px 0", fontSize: 13, fontWeight: 700, color: T.green, fontFamily: "'DM Mono',monospace" }}>{fmtS(Number(inc.amount))}</td>
                          <td style={{ padding: "11px 12px 11px 0", fontSize: 12, color: T.text2 }}>
                            {inc.docTipo
                              ? <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: T.greenBg, color: T.green, fontWeight: 600 }}>{inc.docTipo}</span>
                              : <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: T.amberBg, color: T.amber, fontWeight: 600 }}>Sin registrar</span>
                            }
                          </td>
                          <td style={{ padding: "11px 0", fontSize: 12, color: tieneDoc ? T.text : T.muted }}>
                            {inc.docNum || (tieneDoc ? "—" : <span style={{ color: T.amber, fontSize: 11 }}>Pendiente</span>)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ fontSize: 11, color: T.muted, padding: "10px 14px", background: T.surf2, borderRadius: 8, lineHeight: 1.6 }}>
                <strong style={{ color: T.text2 }}>Nota DIAN:</strong> Para que los egresos por honorarios u otros servicios sean deducibles, debes contar con factura electrónica de venta o documento soporte de adquisición (Resolución DIAN 167 de 2021). Registra el número de documento en cada ingreso desde el modal de edición.
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
