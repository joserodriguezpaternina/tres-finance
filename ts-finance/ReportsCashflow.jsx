import { useMemo } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { T, MONTHS, MONTHS_SHORT, fmtS, calcFin, filterM } from '../constants.js'
import { KPI, Tip, card } from '../ui.jsx'

/* ── REPORTS ─────────────────────────────────────────────── */
export function ReportsView({ allInc, allExp, year }) {
  const data = useMemo(() => MONTHS_SHORT.map((name, m) => {
    const f = calcFin(filterM(allInc, m, year), filterM(allExp, m, year))
    return { name, ingresos: f.tI, egresos: f.tE, utilidad: f.util, iva: f.ivaN }
  }), [allInc, allExp, year])

  const totals = data.reduce((a, m) => ({ i: a.i + m.ingresos, e: a.e + m.egresos, u: a.u + m.utilidad }), { i: 0, e: 0, u: 0 })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: T.white, fontFamily: "'Inter',sans-serif" }}>Reportes {year}</h2>
        <p style={{ margin: "3px 0 0", fontSize: 12, color: T.muted }}>Resumen financiero anual</p>
      </div>
      <div className="g3">
        <KPI title="Ingresos totales" value={fmtS(totals.i)} sub={`Año ${year}`} icon={TrendingUp} color={T.green} />
        <KPI title="Egresos totales" value={fmtS(totals.e)} sub={`Año ${year}`} icon={TrendingDown} color={T.red} />
        <KPI title="Utilidad del año" value={fmtS(totals.u)} sub="Margen operativo" icon={TrendingUp} color={totals.u >= 0 ? T.green : T.red} />
      </div>
      <div style={card}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.white, marginBottom: 16 }}>Ingresos vs Egresos mensuales</div>
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: T.muted, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v => fmtS(v)} width={55} />
            <Tooltip content={<Tip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: T.text2 }} />
            <Bar dataKey="ingresos" name="Ingresos" fill={T.green} radius={[4, 4, 0, 0]} />
            <Bar dataKey="egresos" name="Egresos" fill={T.red} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={card}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.white, marginBottom: 16 }}>Utilidad neta mensual</div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="ug" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={T.green} stopOpacity={0.2} />
                <stop offset="95%" stopColor={T.green} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: T.muted, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v => fmtS(v)} width={55} />
            <Tooltip content={<Tip />} />
            <Area type="monotone" dataKey="utilidad" name="Utilidad" stroke={T.green} strokeWidth={2} fill="url(#ug)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{ ...card, overflowX: "auto" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.white, marginBottom: 14 }}>Detalle mensual</div>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead>
            <tr>{["Mes", "Ingresos", "Egresos", "Utilidad", "IVA neto", "Margen"].map(h => (
              <th key={h} style={{ textAlign: "left", fontSize: 10, fontWeight: 700, color: T.muted, padding: "0 12px 12px", textTransform: "uppercase", letterSpacing: ".7px", borderBottom: `1px solid ${T.border}` }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {data.map((m, i) => {
              const margin = m.ingresos > 0 ? (m.utilidad / m.ingresos * 100) : 0
              const empty = m.ingresos === 0
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${T.border}`, opacity: empty ? 0.35 : 1 }}>
                  <td style={{ padding: "11px 12px", fontSize: 13, fontWeight: 700, color: T.white }}>{MONTHS[i]}</td>
                  <td style={{ padding: "11px 12px", fontSize: 13, fontWeight: 700, color: T.green, fontFamily: "'DM Mono',monospace" }}>{empty ? "—" : fmtS(m.ingresos)}</td>
                  <td style={{ padding: "11px 12px", fontSize: 13, fontWeight: 700, color: T.red, fontFamily: "'DM Mono',monospace" }}>{empty ? "—" : fmtS(m.egresos)}</td>
                  <td style={{ padding: "11px 12px", fontSize: 13, fontWeight: 700, color: m.utilidad >= 0 ? T.green : T.red, fontFamily: "'DM Mono',monospace" }}>{empty ? "—" : fmtS(m.utilidad)}</td>
                  <td style={{ padding: "11px 12px", fontSize: 12, color: T.amber, fontFamily: "'DM Mono',monospace" }}>{m.iva > 0 ? fmtS(m.iva) : "—"}</td>
                  <td style={{ padding: "11px 12px" }}>
                    {!empty && <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: margin > 40 ? T.greenBg : margin > 20 ? T.amberBg : T.redBg, color: margin > 40 ? T.green : margin > 20 ? T.amber : T.red }}>{margin.toFixed(1)}%</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── CASH FLOW ────────────────────────────────────────────── */
export function CashFlowView({ allInc, allExp, year }) {
  const data = useMemo(() => {
    let acum = 0
    return MONTHS_SHORT.map((name, m) => {
      const inc = filterM(allInc, m, year)
      const exp = filterM(allExp, m, year)
      const cobr = inc.filter(i => i.status === "Pagado").reduce((s, i) => s + Number(i.amount), 0)
      const pag  = exp.reduce((s, e) => s + Number(e.amount), 0)
      acum += cobr - pag
      return { name, cobrado: cobr, pagado: pag, neto: cobr - pag, acumulado: acum }
    })
  }, [allInc, allExp, year])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: T.white, fontFamily: "'Inter',sans-serif" }}>Flujo de caja {year}</h2>
        <p style={{ margin: "3px 0 0", fontSize: 12, color: T.muted }}>Solo transacciones confirmadas como "Pagado"</p>
      </div>
      <div style={card}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.white, marginBottom: 16 }}>Caja acumulada</div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={T.green} stopOpacity={0.2} />
                <stop offset="95%" stopColor={T.green} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: T.muted, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v => fmtS(v)} width={55} />
            <Tooltip content={<Tip />} />
            <Area type="monotone" dataKey="acumulado" name="Caja acumulada" stroke={T.green} strokeWidth={2.5} fill="url(#ag)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={card}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.white, marginBottom: 16 }}>Entradas vs Salidas reales</div>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: T.muted, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v => fmtS(v)} width={55} />
            <Tooltip content={<Tip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: T.text2 }} />
            <Bar dataKey="cobrado" name="Cobrado" fill={T.green} radius={[4, 4, 0, 0]} />
            <Bar dataKey="pagado"  name="Pagado"  fill={T.red}   radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ ...card, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
          <thead>
            <tr>{["Mes", "Cobrado", "Pagado", "Neto", "Acumulado"].map(h => (
              <th key={h} style={{ textAlign: "left", fontSize: 10, fontWeight: 700, color: T.muted, padding: "0 12px 12px", textTransform: "uppercase", letterSpacing: ".7px", borderBottom: `1px solid ${T.border}` }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${T.border}`, opacity: d.cobrado === 0 && d.pagado === 0 ? 0.35 : 1 }}>
                <td style={{ padding: "11px 12px", fontSize: 13, fontWeight: 700, color: T.white }}>{MONTHS[i]}</td>
                <td style={{ padding: "11px 12px", fontSize: 13, fontWeight: 700, color: T.green, fontFamily: "'DM Mono',monospace" }}>{d.cobrado > 0 ? fmtS(d.cobrado) : "—"}</td>
                <td style={{ padding: "11px 12px", fontSize: 13, fontWeight: 700, color: T.red, fontFamily: "'DM Mono',monospace" }}>{d.pagado > 0 ? fmtS(d.pagado) : "—"}</td>
                <td style={{ padding: "11px 12px", fontSize: 13, fontWeight: 700, color: d.neto >= 0 ? T.green : T.red, fontFamily: "'DM Mono',monospace" }}>{d.cobrado > 0 || d.pagado > 0 ? fmtS(d.neto) : "—"}</td>
                <td style={{ padding: "11px 12px", fontSize: 13, fontWeight: 700, color: d.acumulado >= 0 ? T.green : T.red, fontFamily: "'DM Mono',monospace" }}>{d.cobrado > 0 || d.pagado > 0 ? fmtS(d.acumulado) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
