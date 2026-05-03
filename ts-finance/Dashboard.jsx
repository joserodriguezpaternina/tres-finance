import { useMemo } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Wallet, Layers, Receipt, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { T, MONTHS_SHORT, fmtS, fmt, calcFin, filterM } from '../constants.js'
import { KPI, Pill, Tip, card } from '../ui.jsx'

const PIE_COLORS = ["#44B26B","#D72B20","#D97706","#2563EB","#5A3EE7","#0891B2"]
const PIE_LIGHTS = ["#D1FAE5","#FEE2E2","#FEF3C7","#DBEAFE","#EDE9FE","#CFFAFE"]

export default function Dashboard({ fin, incomes, expenses, allInc, allExp, month, year }) {
  const catData = useMemo(()=>{
    const map = {}
    expenses.forEach(e=>{ map[e.cat]=(map[e.cat]||0)+Number(e.amount) })
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([name,value])=>({name,value}))
  }, [expenses])

  const trend = useMemo(()=>Array.from({length:6},(_,i)=>{
    const m=(month-5+i+12)%12, y=month-5+i<0?year-1:year
    const f=calcFin(filterM(allInc,m,y),filterM(allExp,m,y))
    return { name:MONTHS_SHORT[m], ingresos:f.tI, egresos:f.tE, utilidad:f.util }
  }), [allInc,allExp,month,year])

  const pending = incomes.filter(i=>i.status==="Pendiente")
  const totalPending = pending.reduce((s,i)=>s+Number(i.amount),0)

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {pending.length > 0 && (
        <div style={{ background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
          <AlertTriangle size={14} color="#D97706"/>
          <span style={{ fontSize:13, color:T.text, fontWeight:500 }}>
            <span style={{ color:"#D97706", fontWeight:700 }}>{pending.length} facturas pendientes</span>{" "}por cobrar —{" "}
            <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, color:"#D97706" }}>{fmt(totalPending)}</span>
          </span>
        </div>
      )}

      <div className="g4">
        <KPI title="Ingresos del mes"  value={fmtS(fin.tI)}   sub={`${incomes.length} facturas`}   icon={TrendingUp}   color={T.green}/>
        <KPI title="Egresos del mes"   value={fmtS(fin.tE)}   sub={`${expenses.length} registros`}  icon={TrendingDown} color={T.red}/>
        <KPI title="Utilidad neta"     value={fmtS(fin.util)} sub="Sin IVA"                         icon={DollarSign}   color={fin.util>=0?T.green:T.red}/>
        <KPI title="Caja disponible"   value={fmtS(fin.caja)} sub="Cobrado − Pagado"                icon={Wallet}       color={T.blue}/>
      </div>

      <div className="g4">
        <KPI title="Base ingresos" value={fmtS(fin.tIb)}   sub="Sin IVA"     icon={Receipt} color={T.green}/>
        <KPI title="IVA cobrado"   value={fmtS(fin.tIVAc)} sub="IVA ventas"  icon={Layers}  color={T.amber}/>
        <KPI title="IVA pagado"    value={fmtS(fin.tIVAp)} sub="IVA compras" icon={Layers}  color={T.amber}/>
        <KPI title="IVA neto" value={fmtS(fin.ivaN)} sub={fin.ivaN>=0?"A declarar":"A favor"} icon={Receipt} color={T.violet}
          badge={fin.ivaN>=0?{label:"A pagar",bg:"#FEE2E2",color:"#D72B20"}:{label:"A favor",bg:"#D1FAE5",color:"#44B26B"}}/>
      </div>

      <div className="gc">
        <div style={card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:T.text }}>Evolución mensual</div>
              <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>Últimos 6 meses</div>
            </div>
            <div style={{ display:"flex", gap:14 }}>
              {[["Ingresos","#44B26B"],["Egresos","#D72B20"],["Utilidad","#5A3EE7"]].map(([l,c])=>(
                <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ width:8, height:8, borderRadius:2, background:c, display:"inline-block" }}/>
                  <span style={{ fontSize:11, color:T.muted }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trend} barGap={3} barSize={12}>
              <defs>
                <linearGradient id="dG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#44B26B" stopOpacity={.9}/><stop offset="100%" stopColor="#D1FAE5" stopOpacity={.3}/>
                </linearGradient>
                <linearGradient id="dR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D72B20" stopOpacity={.9}/><stop offset="100%" stopColor="#FECACA" stopOpacity={.3}/>
                </linearGradient>
                <linearGradient id="dV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5A3EE7" stopOpacity={.9}/><stop offset="100%" stopColor="#EDE9FE" stopOpacity={.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false}/>
              <XAxis dataKey="name" tick={{ fontSize:11, fill:T.muted }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:10, fill:T.muted, fontFamily:"'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v=>fmtS(v)} width={65}/>
              <Tooltip content={<Tip />}/>
              <Bar dataKey="ingresos" name="Ingresos" fill="url(#dG)" radius={[6,6,0,0]}/>
              <Bar dataKey="egresos"  name="Egresos"  fill="url(#dR)" radius={[6,6,0,0]}/>
              <Bar dataKey="utilidad" name="Utilidad" fill="url(#dV)" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <div style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:4 }}>Distribución egresos</div>
          <div style={{ fontSize:11, color:T.muted, marginBottom:16 }}>Por categoría este mes</div>
          {catData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <defs>
                    {PIE_COLORS.map((c,i)=>(
                      <linearGradient key={i} id={`dp${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={c} stopOpacity={1}/><stop offset="100%" stopColor={PIE_LIGHTS[i]} stopOpacity={.6}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie data={catData} cx="50%" cy="50%" innerRadius={40} outerRadius={62} dataKey="value" paddingAngle={3}>
                    {catData.map((_,i)=><Cell key={i} fill={`url(#dp${i%PIE_COLORS.length})`}/>)}
                  </Pie>
                  <Tooltip formatter={v=>fmtS(v)} contentStyle={{ background:"#101010", border:"none", borderRadius:10, color:"#fff", fontSize:12 }}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:8 }}>
                {catData.map((item,i)=>(
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ width:8, height:8, borderRadius:2, background:PIE_COLORS[i%PIE_COLORS.length], display:"inline-block", flexShrink:0 }}/>
                      <span style={{ fontSize:12, color:T.text2 }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize:12, fontWeight:600, color:T.text, fontFamily:"'DM Mono',monospace" }}>{fmtS(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign:"center", padding:"40px 0", color:T.muted, fontSize:13 }}>Sin egresos este mes</div>
          )}
        </div>
      </div>

      <div style={card}>
        <div style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:16 }}>Movimientos recientes</div>
        {[...incomes.map(i=>({...i,tipo:"I"})),...expenses.map(e=>({...e,tipo:"E"}))]
          .sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,7)
          .map((item,i,arr)=>(
            <div key={item.id||i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 0", borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:34, height:34, borderRadius:10, background:item.tipo==="I"?"#D1FAE5":"#FEE2E2", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {item.tipo==="I"?<TrendingUp size={14} color="#44B26B"/>:<TrendingDown size={14} color="#D72B20"/>}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{item.tipo==="I"?item.client:(item.desc||item.description)}</div>
                  <div style={{ fontSize:11, color:T.muted }}>{item.tipo==="I"?item.project:item.cat} · {item.date}</div>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                {item.status && <Pill s={item.status}/>}
                <span style={{ fontSize:13, fontWeight:700, color:item.tipo==="I"?"#44B26B":"#D72B20", fontFamily:"'DM Mono',monospace" }}>
                  {item.tipo==="I"?"+":"−"}{fmtS(item.amount)}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
