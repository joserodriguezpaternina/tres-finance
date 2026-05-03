import { useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { T, MONTHS_SHORT, fmtS, calcFin, filterM } from '../constants.js'
import { card, Tip } from '../ui.jsx'

const SummaryCard = ({ title, sub, value, trend, trendLabel, trendUp, sparkData, sparkColor }) => (
  <div style={{ ...card, padding: "22px 24px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{title}</div>
    </div>
    <div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>{sub}</div>
    <div style={{ fontSize: 28, fontWeight: 700, color: T.text, fontFamily: "'DM Mono',monospace", letterSpacing: "-.5px", marginBottom: 10 }}>{value}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: trendUp ? T.green : T.red }}>
        {trendUp ? "↑" : "↓"} {trend}
      </span>
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

export default function AccountingView({ allInc, allExp, year, month }) {
  const [analyticsPeriod, setAnalyticsPeriod] = useState("12 meses")

  const monthlyData = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const f = calcFin(filterM(allInc, i, year), filterM(allExp, i, year))
    return { name: MONTHS_SHORT[i], ingresos: f.tI, egresos: f.tE, utilidad: f.util, cobrado: f.cobr }
  }), [allInc, allExp, year])

  const incSpark = monthlyData.map(d => ({ v: d.ingresos }))
  const expSpark = monthlyData.map(d => ({ v: d.egresos }))
  const utlSpark = monthlyData.map(d => ({ v: d.utilidad }))

  const monthInc = filterM(allInc, month, year)
  const monthExp = filterM(allExp, month, year)
  const fin = calcFin(monthInc, monthExp)

  const totalInc = allInc.reduce((s, i) => s + Number(i.amount), 0)
  const totalExp = allExp.reduce((s, e) => s + Number(e.amount), 0)
  const totalPro = totalInc - totalExp

  const last6Inc = monthlyData.slice(Math.max(0, month - 5), month + 1)
  const last6Exp = monthlyData.slice(Math.max(0, month - 5), month + 1)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Summary cards ── */}
      <div className="g3">
        <SummaryCard
          title="Total facturas de compra"
          sub="Egresos totales del año"
          value={fmtS(totalExp)}
          trend="+7%"
          trendLabel="vs año anterior"
          trendUp={true}
          sparkData={expSpark}
          sparkColor={T.red}
        />
        <SummaryCard
          title="Total pagos recibidos"
          sub="Ingresos totales del año"
          value={fmtS(totalInc)}
          trend="-7%"
          trendLabel="vs año anterior"
          trendUp={false}
          sparkData={incSpark}
          sparkColor={T.green}
        />
        <SummaryCard
          title="Utilidad total del año"
          sub="Margen operativo neto"
          value={fmtS(totalPro)}
          trend="+4%"
          trendLabel="vs año anterior"
          trendUp={totalPro >= 0}
          sparkData={utlSpark}
          sparkColor={T.violet}
        />
      </div>

      {/* ── Total Analytics ── */}
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
                <stop offset="5%" stopColor={T.green} stopOpacity={0.15}/>
                <stop offset="95%" stopColor={T.green} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={T.blue} stopOpacity={0.15}/>
                <stop offset="95%" stopColor={T.blue} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gUtl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={T.violet} stopOpacity={0.15}/>
                <stop offset="95%" stopColor={T.violet} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: T.muted, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v => fmtS(v)} width={60} />
            <Tooltip content={<Tip />} />
            <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke={T.green} fill="url(#gInc)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="egresos"  name="Egresos"  stroke={T.blue}  fill="url(#gExp)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="utilidad" name="Utilidad" stroke={T.violet} fill="url(#gUtl)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Two charts row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Incoming Bills */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Facturas entrantes (Compras)</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Última sincronización hace 2 minutos</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <select style={{ fontSize: 11, padding: "4px 8px", borderRadius: 7, border: `1px solid ${T.border}`, color: T.text2, background: T.surf, fontFamily: "inherit" }}>
                <option>Mensual</option>
                <option>Anual</option>
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={last6Inc}>
              <defs>
                <linearGradient id="gInc2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.violet} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={T.violet} stopOpacity={0}/>
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

        {/* Outgoing Bills */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Facturas salientes (Ventas)</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Última sincronización hace 2 minutos</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <select style={{ fontSize: 11, padding: "4px 8px", borderRadius: 7, border: `1px solid ${T.border}`, color: T.text2, background: T.surf, fontFamily: "inherit" }}>
                <option>Anual</option>
                <option>Mensual</option>
              </select>
            </div>
          </div>
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
