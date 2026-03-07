import { useMemo } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Wallet, Layers, Receipt, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { T, MONTHS_SHORT, fmtS, fmt, calcFin, filterM } from '../constants.js'
import { KPI, Pill, Tip, card } from '../ui.jsx'

const PIE_COLORS = [T.red, "#F97316", T.amber, T.violet, T.blue, T.green]

export default function Dashboard({ fin, incomes, expenses, allInc, allExp, month, year }) {
  const catData = useMemo(() => {
    const map = {}
    expenses.forEach(e => { map[e.cat] = (map[e.cat] || 0) + Number(e.amount) })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }))
  }, [expenses])

  const trend = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const m = (month - 5 + i + 12) % 12
    const y = month - 5 + i < 0 ? year - 1 : year
    const f = calcFin(filterM(allInc, m, y), filterM(allExp, m, y))
    return { name: MONTHS_SHORT[m], ingresos: f.tI, egresos: f.tE, utilidad: f.util }
  }), [allInc, allExp, month, year])

  const pending = incomes.filter(i => i.status === "Pendiente")
  const totalPending = pending.reduce((s, i) => s + Number(i.amount), 0)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Alert banner */}
      {pending.length > 0 && (
        <div style={{ background: T.amberBg, border: `1px solid ${T.amber}30`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle size={15} color={T.amber} />
          <span style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>
            <span style={{ color: T.amber, fontWeight: 700 }}>{pending.length} facturas pendientes</span> por cobrar —{" "}
            <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, color: T.amber }}>{fmt(totalPending)}</span>
          </span>
        </div>
      )}

      {/* Row 1 KPIs */}
      <div className="g4" style={{ display: "grid" }}>
        <KPI title="Ingresos del mes" value={fmtS(fin.tI)} sub={`${incomes.length} facturas`} icon={TrendingUp} color={T.green} />
        <KPI title="Egresos del mes" value={fmtS(fin.tE)} sub={`${expenses.length} registros`} icon={TrendingDown} color={T.red} />
        <KPI title="Utilidad neta" value={fmtS(fin.util)} sub="Sin IVA" icon={DollarSign} color={fin.util >= 0 ? T.green : T.red} />
        <KPI title="Caja disponible" value={fmtS(fin.caja)} sub="Cobrado − Pagado" icon={Wallet} color={T.blue} />
      </div>

      {/* Row 2 KPIs */}
      <div className="g4" style={{ display: "grid" }}>
        <KPI title="Base ingresos" value={fmtS(fin.tIb)} sub="Sin IVA" icon={Receipt} color={T.green} />
        <KPI title="IVA cobrado" value={fmtS(fin.tIVAc)} sub="IVA ventas" icon={Layers} color={T.amber} />
        <KPI title="IVA pagado" value={fmtS(fin.tIVAp)} sub="IVA compras" icon={Layers} color={T.amber} />
        <KPI title="IVA neto" value={fmtS(fin.ivaN)} sub={fin.ivaN >= 0 ? "A declarar" : "A favor"} icon={Receipt} color={T.violet}
          badge={fin.ivaN >= 0 ? { label: "A pagar", bg: T.redBg, color: T.red } : { label: "A favor", bg: T.greenBg, color: T.green }} />
      </div>

      {/* Charts row */}
      <div className="gc">
        {/* Bar chart */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.white }}>Evolución mensual</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Últimos 6 meses</div>
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              {[["Ingresos", T.green], ["Egresos", T.red], ["Utilidad", T.violet]].map(([l, c]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block" }} />
                  <span style={{ fontSize: 11, color: T.subtle }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={trend} barGap={3} barSize={14}>
              <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: T.muted, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v => fmtS(v)} width={55} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="ingresos" name="Ingresos" fill={T.green} radius={[4, 4, 0, 0]} />
              <Bar dataKey="egresos" name="Egresos" fill={T.red} radius={[4, 4, 0, 0]} />
              <Bar dataKey="utilidad" name="Utilidad" fill={T.violet} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut */}
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.white, marginBottom: 4 }}>Distribución egresos</div>
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
            <div style={{ textAlign: "center", padding: "40px 0", color: T.muted, fontSize: 13 }}>Sin egresos</div>
          )}
        </div>
      </div>

      {/* Recent movements */}
      <div style={card}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.white, marginBottom: 16 }}>Movimientos recientes</div>
        {[...incomes.map(i => ({ ...i, tipo: "I" })), ...expenses.map(e => ({ ...e, tipo: "E" }))]
          .sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 7)
          .map((item, i, arr) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: item.tipo === "I" ? T.greenBg : T.redBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {item.tipo === "I" ? <TrendingUp size={14} color={T.green} /> : <TrendingDown size={14} color={T.red} />}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.white }}>{item.tipo === "I" ? item.client : (item.desc || item.description)}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{item.tipo === "I" ? item.project : item.cat} · {item.date}</div>
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
      </div>
    </div>
  )
}
