import { useMemo, useState } from 'react'
import {
  TrendingUp, TrendingDown, AlertCircle, DollarSign,
  Wallet, BarChart2, ArrowUpRight, ArrowDownRight, Calendar,
  PiggyBank
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell
} from 'recharts'
import { T, MONTHS, MONTHS_SHORT, fmt, fmtS, calcFin, filterM } from '../constants.js'
import { card, KPI, Tip } from '../ui.jsx'

const TRIMESTRES = [
  { label: "T1", meses: [0,1,2], vence: "May 2026" },
  { label: "T2", meses: [3,4,5], vence: "Ago 2026" },
  { label: "T3", meses: [6,7,8], vence: "Nov 2026" },
  { label: "T4", meses: [9,10,11], vence: "Feb 2027" },
]

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

/* ── Resumen financiero ─────────────────────────────────── */
function ReportsTab({ allInc, allExp, year }) {
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
      <div className="g4">
        <KPI title="Ingresos totales" value={fmtS(totals.i)} color={T.green}  icon={TrendingUp}   sub={`${allInc.length} facturas`} />
        <KPI title="Egresos totales"  value={fmtS(totals.e)} color={T.red}    icon={TrendingDown} sub={`${allExp.length} registros`} />
        <KPI title="Utilidad del año" value={fmtS(totals.u)} color={totals.u >= 0 ? T.green : T.red} icon={DollarSign} sub="Base gravable" />
        <KPI title="Margen operativo" value={`${marginAnual.toFixed(1)}%`} color={T.violet} icon={BarChart2} sub="Rentabilidad anual" />
      </div>

      <div style={card}>
        <SectionHeader title="Resumen trimestral" sub={`Ingresos, egresos y utilidad por trimestre · ${year}`} />
        <div className="g4" style={{ gap: 12 }}>
          {trimestreData.map((t, i) => {
            const active = activeT === i
            const margin = t.inc > 0 ? (t.util / t.inc * 100) : 0
            return (
              <div key={i} onClick={() => setActiveT(active ? null : i)} style={{
                borderRadius: 12, padding: "18px 16px", cursor: "pointer",
                border: active ? `1.5px solid ${T.text}` : `1px solid ${T.border}`,
                background: active ? T.text : T.surf, transition: "all .15s",
              }}>
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
                      <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "'DM Mono',monospace" }}>{value !== 0 ? fmtS(value) : "—"}</span>
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

      {/* IVA DIAN */}
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
        <div className="g4" style={{ gap: 10 }}>
          {trimestreData.map((t, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,.05)", borderRadius: 10, padding: "14px 16px", border: t.ivaN > 0 ? "1px solid rgba(248,113,113,.25)" : "1px solid rgba(255,255,255,.07)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.6)" }}>{t.label}</span>
                {t.ivaN > 0 && <AlertCircle size={13} color="#f87171" />}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "'DM Mono',monospace", letterSpacing: "-.5px",
                color: t.ivaN > 0 ? "#f87171" : t.ivaN < 0 ? "#4ade80" : "rgba(255,255,255,.3)"
              }}>
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

      <div className="g3-2">
        <div style={card}>
          <SectionHeader title="Ingresos vs Egresos" sub={`Comparativo mensual ${year}`} />
          <Legend items={[["Ingresos", T.green], ["Egresos", T.red]]} />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} barGap={4} barSize={14}>
              <defs>
                <linearGradient id="rGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.green} stopOpacity={1}/><stop offset="100%" stopColor={T.green} stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="rRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.red} stopOpacity={1}/><stop offset="100%" stopColor={T.red} stopOpacity={0.3}/>
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
        <div style={card}>
          <SectionHeader title="Utilidad neta" sub="Evolución del margen mensual" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="rUtil" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.violet} stopOpacity={0.2}/><stop offset="100%" stopColor={T.violet} stopOpacity={0}/>
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
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

/* ── Flujo de caja ──────────────────────────────────────── */
function CashFlowTab({ allInc, allExp, year }) {
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
      <div className="g4">
        <KPI title="Total cobrado"    value={fmtS(totalCobrado)} color={T.green}  icon={ArrowUpRight}   sub={`${allInc.filter(i=>i.status==="Pagado").length} pagos recibidos`} />
        <KPI title="Total pagado"     value={fmtS(totalPagado)}  color={T.red}    icon={ArrowDownRight} sub={`${allExp.length} egresos`} />
        <KPI title="Posición de caja" value={fmt(cajaFinal)}     color={cajaFinal >= 0 ? T.green : T.red} icon={Wallet} sub={cajaFinal >= 0 ? "Caja positiva" : "Caja negativa"} />
        <KPI title="Pendiente cobro"  value={fmtS(totalPend)}    color={T.amber}  icon={AlertCircle}    sub={`${pendientes.length} facturas abiertas`} />
      </div>

      <div className="g3-2">
        <div style={card}>
          <SectionHeader title="Caja acumulada" sub="Posición de liquidez mes a mes" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="cfAcum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.green} stopOpacity={0.18}/><stop offset="100%" stopColor={T.green} stopOpacity={0}/>
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

/* ── Contabilidad ───────────────────────────────────────── */
const SparkCard = ({ title, sub, value, sparkData, sparkColor, trend, trendUp }) => (
  <div style={{ ...card, padding: "22px 24px" }}>
    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>{sub}</div>
    <div style={{ fontSize: 26, fontWeight: 700, color: T.text, fontFamily: "'DM Mono',monospace", letterSpacing: "-.5px", marginBottom: 10 }}>{value}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: trendUp ? T.green : T.red }}>{trendUp ? "↑" : "↓"} {trend}</span>
    </div>
    <div style={{ height: 56 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sparkData}>
          <Line type="monotone" dataKey="v" stroke={sparkColor} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
)

function AccountingTab({ allInc, allExp, year, month }) {
  const [analyticsPeriod, setAnalyticsPeriod] = useState("12 meses")

  const monthlyData = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const f = calcFin(filterM(allInc, i, year), filterM(allExp, i, year))
    return { name: MONTHS_SHORT[i], ingresos: f.tI, egresos: f.tE, utilidad: f.util, cobrado: f.cobr }
  }), [allInc, allExp, year])

  const last6Inc = monthlyData.slice(Math.max(0, month - 5), month + 1)

  const totalInc = allInc.reduce((s, i) => s + Number(i.amount), 0)
  const totalExp = allExp.reduce((s, e) => s + Number(e.amount), 0)
  const totalPro = totalInc - totalExp

  const incSpark = monthlyData.map(d => ({ v: d.ingresos }))
  const expSpark = monthlyData.map(d => ({ v: d.egresos }))
  const utlSpark = monthlyData.map(d => ({ v: d.utilidad }))

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="g3">
        <SparkCard title="Total facturas de compra" sub="Egresos totales del año"  value={fmtS(totalExp)} trend="+7%" trendUp={true}          sparkData={expSpark} sparkColor={T.red}    />
        <SparkCard title="Total pagos recibidos"    sub="Ingresos totales del año" value={fmtS(totalInc)} trend="+7%" trendUp={true}           sparkData={incSpark} sparkColor={T.green}  />
        <SparkCard title="Utilidad total del año"   sub="Margen operativo neto"    value={fmtS(totalPro)} trend="+4%" trendUp={totalPro >= 0}   sparkData={utlSpark} sparkColor={T.violet} />
      </div>

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
          <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${T.border}` }}>
            {["12 meses", "30 días", "24 horas"].map(p => (
              <button key={p} onClick={() => setAnalyticsPeriod(p)} style={{
                padding: "6px 14px", border: "none", cursor: "pointer", background: "transparent",
                fontSize: 12, fontWeight: analyticsPeriod === p ? 600 : 400, fontFamily: "inherit",
                color: analyticsPeriod === p ? T.text : T.muted,
                borderBottom: analyticsPeriod === p ? `2px solid ${T.text}` : "2px solid transparent",
                marginBottom: -1,
                transition: "color .12s, border-color .12s",
              }}>{p}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="aInc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={T.green} stopOpacity={0.15}/><stop offset="95%" stopColor={T.green} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="aExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={T.blue} stopOpacity={0.15}/><stop offset="95%" stopColor={T.blue} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="aUtl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={T.violet} stopOpacity={0.15}/><stop offset="95%" stopColor={T.violet} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: T.muted, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v => fmtS(v)} width={60} />
            <Tooltip content={<Tip />} />
            <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke={T.green}  fill="url(#aInc)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="egresos"  name="Egresos"  stroke={T.blue}   fill="url(#aExp)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="utilidad" name="Utilidad" stroke={T.violet} fill="url(#aUtl)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="g2">
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 6 }}>Facturas entrantes (Compras)</div>
          <div style={{ fontSize: 11, color: T.muted, marginBottom: 14 }}>Últimos 6 meses</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={last6Inc}>
              <defs>
                <linearGradient id="aInc2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.violet} stopOpacity={0.2}/><stop offset="95%" stopColor={T.violet} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: T.muted, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v => fmtS(v)} width={56} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="egresos" name="Egresos" stroke={T.red}    fill="url(#aInc2)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="cobrado" name="Cobrado" stroke={T.violet} fill="transparent" strokeWidth={2} strokeDasharray="4 2" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 6 }}>Facturas salientes (Ventas)</div>
          <div style={{ fontSize: 11, color: T.muted, marginBottom: 14 }}>Todo el año</div>
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
    </div>
  )
}

/* ── Provisión renta ────────────────────────────────────── */
const RATES = [
  { label: "25%", value: 25, desc: "Tarifa reducida" },
  { label: "33%", value: 33, desc: "Tarifa estándar" },
  { label: "35%", value: 35, desc: "Tarifa SAS/SA" },
]

function ProvisionTab({ allInc, allExp, year }) {
  const [rate, setRate]     = useState(33)
  const [custom, setCustom] = useState("")
  const effectiveRate       = custom !== "" ? Math.min(100, Math.max(0, Number(custom))) : rate

  const data = useMemo(() => {
    let acum = 0
    return MONTHS_SHORT.map((name, m) => {
      const f        = calcFin(filterM(allInc, m, year), filterM(allExp, m, year))
      const utilidad = f.util
      const provision = utilidad > 0 ? Math.round(utilidad * effectiveRate / 100) : 0
      acum += provision
      return { name, month: m, ingresos: f.tI, egresos: f.tE, utilidad, provision, acumulado: acum }
    })
  }, [allInc, allExp, year, effectiveRate])

  const totalUtil  = data.reduce((s, d) => s + Math.max(0, d.utilidad), 0)
  const totalProv  = data[data.length - 1]?.acumulado || 0
  const provMes    = data.filter(d => d.provision > 0).length
  const promMensual = provMes > 0 ? totalProv / provMes : 0

  /* provision by client */
  const byClient = useMemo(() => {
    const map = {}
    for (const i of allInc) {
      const key = i.client || i.project || "Sin cliente"
      if (!map[key]) map[key] = 0
      map[key] += Number(i.amount)
    }
    return Object.entries(map)
      .map(([name, total]) => ({ name, total, provision: Math.round(total * effectiveRate / 100) }))
      .sort((a, b) => b.provision - a.provision)
      .slice(0, 8)
  }, [allInc, effectiveRate])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Rate selector */}
      <div style={{ ...card, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>Tasa de provisión</div>
            <div style={{ fontSize: 12, color: T.muted }}>Porcentaje de la utilidad neta a apartar cada mes</div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {RATES.map(r => (
              <button key={r.value} onClick={() => { setRate(r.value); setCustom("") }} style={{
                padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${custom === "" && rate === r.value ? T.text : T.border}`,
                background: custom === "" && rate === r.value ? T.text : T.surf,
                color: custom === "" && rate === r.value ? "#fff" : T.text2,
                fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                transition: "all .12s",
              }}>
                <span>{r.label}</span>
                <span style={{ fontSize: 10, marginLeft: 6, opacity: 0.65, fontWeight: 400 }}>{r.desc}</span>
              </button>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 6, border: `1.5px solid ${custom !== "" ? T.text : T.border}`, borderRadius: 8, padding: "6px 10px", background: T.surf }}>
              <input
                type="number" min="1" max="99" value={custom}
                onChange={e => { setCustom(e.target.value); setRate(0) }}
                placeholder="Otro %"
                style={{ width: 56, border: "none", background: "transparent", fontSize: 13, fontWeight: 600, color: T.text, outline: "none" }}
              />
              <span style={{ fontSize: 12, color: T.muted }}>%</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="g3">
        {[
          { title: "Total a apartar en el año", value: fmtS(totalProv), sub: `Al ${effectiveRate}% sobre utilidades`, color: T.violet, icon: PiggyBank },
          { title: "Utilidad gravable acumulada", value: fmtS(totalUtil), sub: "Solo meses con utilidad positiva", color: T.green, icon: TrendingUp },
          { title: "Promedio mensual a apartar", value: fmtS(promMensual), sub: `En ${provMes} meses con utilidad`, color: T.amber, icon: Calendar },
        ].map(({ title, value, sub, color, icon: Icon }) => (
          <KPI key={title} title={title} value={value} color={color} icon={Icon} sub={sub} />
        ))}
      </div>

      {/* Chart */}
      <div style={card}>
        <SectionHeader title="Provisión acumulada" sub={`Dinero a apartar para declaración de renta ${year} · tasa ${effectiveRate}%`} />
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="pAcum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.violet} stopOpacity={0.2}/><stop offset="100%" stopColor={T.violet} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="pProv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.amber} stopOpacity={0.15}/><stop offset="100%" stopColor={T.amber} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false}/>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize: 10, fill: T.muted, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v => fmtS(v)} width={66}/>
            <Tooltip content={<Tip />}/>
            <Area type="monotone" dataKey="acumulado" name="Acumulado"  stroke={T.violet} strokeWidth={2.5} fill="url(#pAcum)" dot={{ r: 3, fill: T.violet, strokeWidth: 0 }} activeDot={{ r: 5 }}/>
            <Area type="monotone" dataKey="provision" name="Este mes"   stroke={T.amber}  strokeWidth={1.5} fill="url(#pProv)" dot={false} strokeDasharray="4 2"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly table */}
      <div style={{ ...card, overflowX: "auto" }}>
        <SectionHeader title="Detalle mes a mes" sub={`Provisión sugerida al ${effectiveRate}% sobre utilidad neta`} />
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 580 }}>
          <thead>
            <tr>
              {["Mes", "Ingresos", "Egresos", "Utilidad neta", `Provisión (${effectiveRate}%)`, "Acumulado"].map(h => (
                <th key={h} style={{ textAlign: "left", fontSize: 10, fontWeight: 700, color: T.muted, padding: "0 16px 12px 0", textTransform: "uppercase", letterSpacing: ".07em", borderBottom: `1px solid ${T.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => {
              const empty = d.ingresos === 0 && d.egresos === 0
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${T.border}`, background: d.provision > 0 ? T.violetBg : "transparent" }}>
                  <td style={{ padding: "13px 16px 13px 0", fontSize: 13, fontWeight: 600, color: empty ? T.muted : T.text }}>{MONTHS[i]}</td>
                  <td style={{ padding: "13px 16px 13px 0", fontSize: 12, color: T.green,  fontFamily: "'DM Mono',monospace" }}>{d.ingresos > 0 ? fmtS(d.ingresos) : "—"}</td>
                  <td style={{ padding: "13px 16px 13px 0", fontSize: 12, color: T.red,    fontFamily: "'DM Mono',monospace" }}>{d.egresos  > 0 ? fmtS(d.egresos)  : "—"}</td>
                  <td style={{ padding: "13px 16px 13px 0", fontSize: 13, fontWeight: 600, color: d.utilidad >= 0 ? T.green : T.red, fontFamily: "'DM Mono',monospace" }}>{empty ? "—" : fmtS(d.utilidad)}</td>
                  <td style={{ padding: "13px 16px 13px 0" }}>
                    {d.provision > 0 ? (
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.violet, fontFamily: "'DM Mono',monospace" }}>{fmtS(d.provision)}</span>
                    ) : (
                      <span style={{ fontSize: 11, color: T.muted }}>
                        {d.utilidad < 0 ? "Pérdida" : "—"}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "13px 0", fontSize: 13, fontWeight: 700, color: T.text2, fontFamily: "'DM Mono',monospace" }}>{d.acumulado > 0 ? fmtS(d.acumulado) : "—"}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: `2px solid ${T.border}` }}>
              <td style={{ padding: "13px 16px 4px 0", fontSize: 12, fontWeight: 700, color: T.muted, textTransform: "uppercase" }}>Total</td>
              <td colSpan={2} />
              <td style={{ padding: "13px 16px 4px 0", fontSize: 13, fontWeight: 700, color: totalUtil >= 0 ? T.green : T.red, fontFamily: "'DM Mono',monospace" }}>{fmtS(totalUtil)}</td>
              <td style={{ padding: "13px 16px 4px 0", fontSize: 13, fontWeight: 700, color: T.violet, fontFamily: "'DM Mono',monospace" }}>{fmtS(totalProv)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* By client */}
      {byClient.length > 0 && (
        <div style={card}>
          <SectionHeader title="Provisión por cliente / proyecto" sub={`Cuánto apartar por cada fuente de ingreso · tasa ${effectiveRate}%`} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {byClient.map(({ name, total, provision }) => {
              const pct = totalProv > 0 ? (provision / totalProv * 100) : 0
              return (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                      <div style={{ display: "flex", gap: 16, alignItems: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Mono',monospace" }}>{fmtS(total)}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.violet, fontFamily: "'DM Mono',monospace", minWidth: 80, textAlign: "right" }}>{fmtS(provision)}</span>
                      </div>
                    </div>
                    <div style={{ height: 5, borderRadius: 99, background: T.border, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(100, pct)}%`, borderRadius: 99, background: T.violet, opacity: 0.7, transition: "width .4s" }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ fontSize: 12, color: T.muted, padding: "14px 18px", background: T.surf2, borderRadius: 10, border: `1px solid ${T.border}`, lineHeight: 1.7 }}>
        <strong style={{ color: T.text2 }}>Nota:</strong> Esta provisión es un estimado orientativo basado en tu utilidad neta del período. El valor exacto del impuesto de renta lo calcula tu contador al cierre del año fiscal, considerando deducciones, rentas exentas y la tabla de tarifas vigente de la DIAN. Aparta este dinero en una cuenta separada para evitar sorpresas.
      </div>
    </div>
  )
}

/* ── Export único ───────────────────────────────────────── */
const TABS = [
  { id: "resumen",      label: "Resumen financiero" },
  { id: "flujo",        label: "Flujo de caja" },
  { id: "contabilidad", label: "Contabilidad" },
  { id: "provision",    label: "Provisión renta" },
]

export function ReportsView({ allInc, allExp, year, month }) {
  const [tab, setTab] = useState("resumen")

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: T.text, letterSpacing: "-.5px" }}>Reportes & Finanzas</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: T.muted }}>Análisis financiero · {year}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, background: T.surf, border: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600, color: T.text2 }}>
          <Calendar size={14} color={T.muted} />
          {year}
        </div>
      </div>

      {/* Tabs — Stripe underline style */}
      <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${T.border}`, alignSelf: "stretch", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 18px", border: "none", cursor: "pointer", background: "transparent",
            fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
            color: tab === t.id ? T.text : T.muted,
            borderBottom: tab === t.id ? `2px solid ${T.text}` : "2px solid transparent",
            marginBottom: -1,
            fontFamily: "inherit",
            transition: "color .12s, border-color .12s",
            whiteSpace: "nowrap",
          }}>{t.label}</button>
        ))}
      </div>

      {tab === "resumen"      && <ReportsTab     allInc={allInc} allExp={allExp} year={year} />}
      {tab === "flujo"        && <CashFlowTab    allInc={allInc} allExp={allExp} year={year} />}
      {tab === "contabilidad" && <AccountingTab  allInc={allInc} allExp={allExp} year={year} month={month || 0} />}
      {tab === "provision"    && <ProvisionTab   allInc={allInc} allExp={allExp} year={year} />}
    </div>
  )
}
