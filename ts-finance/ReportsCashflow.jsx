import { useMemo } from 'react'
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { T, MONTHS, MONTHS_SHORT, fmtS, calcFin, filterM } from '../constants.js'
import { KPI, Tip, card } from '../ui.jsx'

const fmt = n => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0}).format(n)

const TRIMESTRES = [
  { label:"T1", sub:"Ene–Mar", meses:[0,1,2],   vence:"Mayo 2026" },
  { label:"T2", sub:"Abr–Jun", meses:[3,4,5],   vence:"Ago 2026"  },
  { label:"T3", sub:"Jul–Sep", meses:[6,7,8],   vence:"Nov 2026"  },
  { label:"T4", sub:"Oct–Dic", meses:[9,10,11], vence:"Feb 2027"  },
]

function DarkTip({ active, payload, label }) {
  if (!active||!payload?.length) return null
  return (
    <div style={{ background:"#101010", borderRadius:12, padding:"10px 16px", boxShadow:"0 8px 32px rgba(0,0,0,.12)" }}>
      <div style={{ color:"rgba(255,255,255,.4)", fontSize:11, marginBottom:8, fontWeight:600, textTransform:"uppercase" }}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{ color:"#fff", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:8, marginBottom:i<payload.length-1?4:0, fontFamily:"'DM Mono',monospace" }}>
          <span style={{ width:8, height:8, borderRadius:2, background:p.color, display:"inline-block", flexShrink:0 }}/>
          <span style={{ color:"rgba(255,255,255,.4)", minWidth:65 }}>{p.name}</span>
          {fmt(p.value)}
        </div>
      ))}
    </div>
  )
}

export function ReportsView({ allInc, allExp, year }) {
  const data = useMemo(()=>MONTHS_SHORT.map((name,m)=>{
    const f=calcFin(filterM(allInc,m,year),filterM(allExp,m,year))
    return { name, ingresos:f.tI, egresos:f.tE, utilidad:f.util, ivaC:f.tIVAc, ivaP:f.tIVAp, ivaN:f.ivaN }
  }), [allInc,allExp,year])

  const totals = data.reduce((a,m)=>({ i:a.i+m.ingresos, e:a.e+m.egresos, u:a.u+m.utilidad, ivaC:a.ivaC+m.ivaC, ivaP:a.ivaP+m.ivaP, ivaN:a.ivaN+m.ivaN }),
    {i:0,e:0,u:0,ivaC:0,ivaP:0,ivaN:0})

  const trims = TRIMESTRES.map(t=>({ ...t,
    ivaC:t.meses.reduce((s,m)=>s+data[m].ivaC,0),
    ivaP:t.meses.reduce((s,m)=>s+data[m].ivaP,0),
    ivaN:t.meses.reduce((s,m)=>s+data[m].ivaN,0),
  }))

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:T.text, letterSpacing:"-.5px" }}>Reportes {year}</h2>
        <p style={{ margin:"4px 0 0", fontSize:13, color:T.muted }}>Resumen financiero anual</p>
      </div>

      <div className="g3">
        <KPI title="Ingresos totales" value={fmtS(totals.i)} sub={`Año ${year}`}    icon={TrendingUp}   color={T.green}/>
        <KPI title="Egresos totales"  value={fmtS(totals.e)} sub={`Año ${year}`}    icon={TrendingDown} color={T.red}/>
        <KPI title="Utilidad del año" value={fmtS(totals.u)} sub="Margen operativo" icon={TrendingUp}   color={totals.u>=0?T.green:T.red}/>
      </div>

      <div style={{ background:"#101010", borderRadius:16, padding:"24px 28px" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:22, flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontSize:10, fontWeight:600, color:"rgba(255,255,255,.35)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:8 }}>IVA a pagar — {year}</div>
            <div style={{ fontSize:34, fontWeight:700, color:"#fff", fontFamily:"'DM Mono',monospace", letterSpacing:"-1px" }}>{fmt(totals.ivaN)}</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,.3)", marginTop:6 }}>Total acumulado a declarar ante la DIAN</div>
          </div>
          <div style={{ display:"flex", gap:24 }}>
            <div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.3)", marginBottom:5 }}>IVA cobrado</div>
              <div style={{ fontSize:17, fontWeight:600, color:"#44B26B", fontFamily:"'DM Mono',monospace" }}>{fmt(totals.ivaC)}</div>
            </div>
            <div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.3)", marginBottom:5 }}>IVA pagado</div>
              <div style={{ fontSize:17, fontWeight:600, color:"#F87171", fontFamily:"'DM Mono',monospace" }}>{fmt(totals.ivaP)}</div>
            </div>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {trims.map((t,i)=>(
            <div key={i} style={{ background:"rgba(255,255,255,.05)", borderRadius:12, padding:"14px 16px", border:t.ivaN>0?"1px solid rgba(215,43,32,.3)":"1px solid rgba(255,255,255,.06)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div>
                  <span style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,.7)" }}>{t.label}</span>
                  <span style={{ fontSize:10, color:"rgba(255,255,255,.25)", marginLeft:6 }}>{t.sub}</span>
                </div>
                {t.ivaN>0 && <AlertCircle size={12} color="#F87171"/>}
              </div>
              <div style={{ fontSize:18, fontWeight:700, fontFamily:"'DM Mono',monospace", letterSpacing:"-.5px", color:t.ivaN>0?"#F87171":t.ivaN<0?"#44B26B":"rgba(255,255,255,.25)" }}>
                {fmt(Math.abs(t.ivaN))}
              </div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,.22)", marginTop:6 }}>
                {t.ivaN>0?"A pagar":t.ivaN<0?"A favor":"Sin mov."} · {t.vence}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <div style={{ marginBottom:18 }}>
          <div style={{ fontSize:14, fontWeight:700, color:T.text }}>Ingresos vs Egresos</div>
          <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>Comparativo mensual {year}</div>
        </div>
        <div style={{ display:"flex", gap:16, marginBottom:14 }}>
          {[["Ingresos","#44B26B"],["Egresos","#D72B20"]].map(([l,c])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ width:9, height:9, borderRadius:2, background:c, display:"inline-block" }}/>
              <span style={{ fontSize:11, color:T.muted }}>{l}</span>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={data} barGap={4} barSize={13}>
            <defs>
              <linearGradient id="rG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#44B26B" stopOpacity={.9}/><stop offset="100%" stopColor="#D1FAE5" stopOpacity={.25}/>
              </linearGradient>
              <linearGradient id="rR" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D72B20" stopOpacity={.9}/><stop offset="100%" stopColor="#FECACA" stopOpacity={.25}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false}/>
            <XAxis dataKey="name" tick={{ fontSize:11, fill:T.muted }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize:10, fill:T.muted, fontFamily:"'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v=>fmtS(v)} width={65}/>
            <Tooltip content={<DarkTip />}/>
            <Bar dataKey="ingresos" name="Ingresos" fill="url(#rG)" radius={[6,6,0,0]}/>
            <Bar dataKey="egresos"  name="Egresos"  fill="url(#rR)" radius={[6,6,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={card}>
        <div style={{ marginBottom:18 }}>
          <div style={{ fontSize:14, fontWeight:700, color:T.text }}>Utilidad neta mensual</div>
          <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>Evolución del margen</div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="rU" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#44B26B" stopOpacity={.1}/><stop offset="100%" stopColor="#44B26B" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false}/>
            <XAxis dataKey="name" tick={{ fontSize:11, fill:T.muted }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize:10, fill:T.muted, fontFamily:"'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v=>fmtS(v)} width={65}/>
            <Tooltip content={<DarkTip />}/>
            <ReferenceLine y={0} stroke={T.border} strokeDasharray="3 3"/>
            <Area type="monotone" dataKey="utilidad" name="Utilidad" stroke="#44B26B" strokeWidth={2.5} fill="url(#rU)" dot={{ r:3, fill:"#44B26B", strokeWidth:0 }} activeDot={{ r:5, fill:"#44B26B" }}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ ...card, overflowX:"auto" }}>
        <div style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:16 }}>Detalle mensual</div>
        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:640 }}>
          <thead>
            <tr>{["Mes","Ingresos","Egresos","Utilidad","IVA neto","Margen"].map(h=>(
              <th key={h} style={{ textAlign:"left", fontSize:10, fontWeight:600, color:T.muted, padding:"0 12px 12px", textTransform:"uppercase", letterSpacing:".08em", borderBottom:`1px solid ${T.border}` }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {data.map((m,i)=>{
              const margin=m.ingresos>0?(m.utilidad/m.ingresos*100):0
              const empty=m.ingresos===0&&m.egresos===0
              return (
                <tr key={i} style={{ borderBottom:`1px solid ${T.border}`, opacity:empty?.3:1 }}>
                  <td style={{ padding:"12px", fontSize:13, fontWeight:600, color:T.text }}>{MONTHS[i]}</td>
                  <td style={{ padding:"12px", fontSize:13, fontWeight:600, color:"#44B26B", fontFamily:"'DM Mono',monospace" }}>{empty?"—":fmtS(m.ingresos)}</td>
                  <td style={{ padding:"12px", fontSize:13, fontWeight:600, color:"#D72B20", fontFamily:"'DM Mono',monospace" }}>{empty?"—":fmtS(m.egresos)}</td>
                  <td style={{ padding:"12px", fontSize:13, fontWeight:600, color:m.utilidad>=0?"#44B26B":"#D72B20", fontFamily:"'DM Mono',monospace" }}>{empty?"—":fmtS(m.utilidad)}</td>
                  <td style={{ padding:"12px", fontSize:12, color:"#D97706", fontFamily:"'DM Mono',monospace" }}>{m.ivaN>0?fmtS(m.ivaN):"—"}</td>
                  <td style={{ padding:"12px" }}>
                    {!empty&&<span style={{ fontSize:11, fontWeight:600, padding:"3px 8px", borderRadius:6, background:margin>40?"#D1FAE5":margin>20?"#FEF3C7":"#FEE2E2", color:margin>40?"#38955A":margin>20?"#B45309":"#B52319" }}>{margin.toFixed(1)}%</span>}
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

export function CashFlowView({ allInc, allExp, year }) {
  const data = useMemo(()=>{
    let acum=0
    return MONTHS_SHORT.map((name,m)=>{
      const inc=filterM(allInc,m,year), exp=filterM(allExp,m,year)
      const cobr=inc.filter(i=>i.status==="Pagado").reduce((s,i)=>s+Number(i.amount),0)
      const pag=exp.reduce((s,e)=>s+Number(e.amount),0)
      acum+=cobr-pag
      return { name, cobrado:cobr, pagado:pag, neto:cobr-pag, acumulado:acum }
    })
  }, [allInc,allExp,year])

  const totalCobrado=data.reduce((s,d)=>s+d.cobrado,0)
  const totalPagado=data.reduce((s,d)=>s+d.pagado,0)
  const cajaFinal=data[data.length-1]?.acumulado||0

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:T.text, letterSpacing:"-.5px" }}>Flujo de caja {year}</h2>
        <p style={{ margin:"4px 0 0", fontSize:13, color:T.muted }}>Solo transacciones marcadas como Pagado</p>
      </div>

      <div className="g3">
        <KPI title="Total cobrado" value={fmtS(totalCobrado)} sub={`Año ${year}`}    icon={TrendingUp}   color={T.green}/>
        <KPI title="Total pagado"  value={fmtS(totalPagado)}  sub={`Año ${year}`}    icon={TrendingDown} color={T.red}/>
        <KPI title="Caja final"    value={fmtS(cajaFinal)}    sub="Posición actual"  icon={TrendingUp}   color={cajaFinal>=0?T.green:T.red}/>
      </div>

      <div style={card}>
        <div style={{ marginBottom:18 }}>
          <div style={{ fontSize:14, fontWeight:700, color:T.text }}>Caja acumulada</div>
          <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>Posición mes a mes</div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="cfA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#44B26B" stopOpacity={.1}/><stop offset="100%" stopColor="#44B26B" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false}/>
            <XAxis dataKey="name" tick={{ fontSize:11, fill:T.muted }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize:10, fill:T.muted, fontFamily:"'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v=>fmtS(v)} width={65}/>
            <Tooltip content={<DarkTip />}/>
            <ReferenceLine y={0} stroke={T.border} strokeDasharray="3 3"/>
            <Area type="monotone" dataKey="acumulado" name="Caja acumulada" stroke="#44B26B" strokeWidth={2.5} fill="url(#cfA)" dot={{ r:3, fill:"#44B26B", strokeWidth:0 }} activeDot={{ r:5 }}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={card}>
        <div style={{ marginBottom:18 }}>
          <div style={{ fontSize:14, fontWeight:700, color:T.text }}>Entradas vs Salidas</div>
          <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>Mes a mes</div>
        </div>
        <div style={{ display:"flex", gap:16, marginBottom:14 }}>
          {[["Cobrado","#44B26B"],["Pagado","#D72B20"]].map(([l,c])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ width:9, height:9, borderRadius:2, background:c, display:"inline-block" }}/>
              <span style={{ fontSize:11, color:T.muted }}>{l}</span>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barGap={4} barSize={13}>
            <defs>
              <linearGradient id="cfG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#44B26B" stopOpacity={.9}/><stop offset="100%" stopColor="#D1FAE5" stopOpacity={.25}/>
              </linearGradient>
              <linearGradient id="cfR" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D72B20" stopOpacity={.9}/><stop offset="100%" stopColor="#FECACA" stopOpacity={.25}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false}/>
            <XAxis dataKey="name" tick={{ fontSize:11, fill:T.muted }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize:10, fill:T.muted, fontFamily:"'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={v=>fmtS(v)} width={65}/>
            <Tooltip content={<DarkTip />}/>
            <Bar dataKey="cobrado" name="Cobrado" fill="url(#cfG)" radius={[6,6,0,0]}/>
            <Bar dataKey="pagado"  name="Pagado"  fill="url(#cfR)" radius={[6,6,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ ...card, overflowX:"auto" }}>
        <div style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:16 }}>Detalle mensual</div>
        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:500 }}>
          <thead>
            <tr>{["Mes","Cobrado","Pagado","Neto","Acumulado"].map(h=>(
              <th key={h} style={{ textAlign:"left", fontSize:10, fontWeight:600, color:T.muted, padding:"0 12px 12px", textTransform:"uppercase", letterSpacing:".08em", borderBottom:`1px solid ${T.border}` }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {data.map((d,i)=>{
              const empty=d.cobrado===0&&d.pagado===0
              return (
                <tr key={i} style={{ borderBottom:`1px solid ${T.border}`, opacity:empty?.3:1 }}>
                  <td style={{ padding:"12px", fontSize:13, fontWeight:600, color:T.text }}>{MONTHS[i]}</td>
                  <td style={{ padding:"12px", fontSize:13, fontWeight:600, color:"#44B26B", fontFamily:"'DM Mono',monospace" }}>{d.cobrado>0?fmtS(d.cobrado):"—"}</td>
                  <td style={{ padding:"12px", fontSize:13, fontWeight:600, color:"#D72B20", fontFamily:"'DM Mono',monospace" }}>{d.pagado>0?fmtS(d.pagado):"—"}</td>
                  <td style={{ padding:"12px", fontSize:13, fontWeight:600, color:d.neto>=0?"#44B26B":"#D72B20", fontFamily:"'DM Mono',monospace" }}>{!empty?fmtS(d.neto):"—"}</td>
                  <td style={{ padding:"12px", fontSize:13, fontWeight:600, color:d.acumulado>=0?"#44B26B":"#D72B20", fontFamily:"'DM Mono',monospace" }}>{!empty?fmtS(d.acumulado):"—"}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
