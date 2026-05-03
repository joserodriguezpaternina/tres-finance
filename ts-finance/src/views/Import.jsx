import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { T, uid } from '../constants.js'
import { incomeService, expenseService } from '../dataService.js'

const CATS_EGRESO  = ["Nómina/honorarios","Software","Publicidad","Producción","Arriendo","Servicios","Transporte","Impuestos","Impuesto 4x1000","Banco/comisiones","Alimentación","Otro"]
const CATS_INGRESO = ["Branding","Social media","Diseño","Consultoría","Retainer","Transferencia recibida","Intereses","Reintegro","Otro"]
const EXP_CATS_MAP = { "Nómina/honorarios":"Honorarios","Software":"Software y suscripciones","Publicidad":"Publicidad","Producción":"Producción","Arriendo":"Arriendo","Servicios":"Servicios","Transporte":"Transporte","Impuestos":"Impuestos","Impuesto 4x1000":"Impuestos","Banco/comisiones":"Otros","Alimentación":"Otros","Otro":"Otros" }

const fmtCOP = n => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0}).format(n)

function parseBancolombia(rows) {
  let headerRow = -1
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i].map(c => String(c).toUpperCase())
    if (r.some(c => c.includes('FECHA')) && r.some(c => c.includes('DESCRIPCI'))) { headerRow = i; break }
  }
  if (headerRow === -1) return null

  const headers = rows[headerRow].map(c => String(c).toUpperCase().trim())
  const iF = headers.findIndex(h => h.includes('FECHA'))
  const iD = headers.findIndex(h => h.includes('DESCRIPCI'))
  const iV = headers.findIndex(h => h.includes('VALOR'))

  const txs = []
  for (let i = headerRow + 1; i < rows.length; i++) {
    const row = rows[i]
    const fecha = row[iF]
    const desc  = String(row[iD] || '').trim()
    const rawVal = row[iV]
    if (!desc || String(fecha||'').trim() === '') continue
    const val = typeof rawVal === 'number' ? rawVal : parseFloat(String(rawVal).replace(/[^0-9.-]/g,''))
    if (isNaN(val) || val === 0) continue

    let fechaStr = ''
    if (fecha instanceof Date) {
      fechaStr = fecha.toISOString().split('T')[0]
    } else {
      const s = String(fecha).trim()
      if (s.match(/^\d{1,2}\/\d{1,2}$/)) {
        const [d, m] = s.split('/')
        fechaStr = `${new Date().getFullYear()}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      } else { fechaStr = s }
    }

    const tipo   = val > 0 ? 'ingreso' : 'egreso'
    const omitir = desc.includes('IMPTO GOBIERNO') || desc.includes('ABONO INTERESES') || desc.includes('4X1000')

    txs.push({ id: uid(), fecha: fechaStr, descripcion: desc, valor: Math.abs(val), tipo, omitir, categoria: '', nota: '' })
  }
  return txs
}

function autoCateg(txs) {
  return txs.map(t => {
    const d = t.descripcion.toUpperCase()
    let cat = 'Otro'
    if (t.tipo === 'egreso') {
      if (d.includes('GOOGLE') || d.includes('ADOBE') || d.includes('FIGMA') || d.includes('SLACK') || d.includes('NOTION') || d.includes('SPOTIFY') || d.includes('LOOM')) cat = 'Software'
      else if (d.includes('RAPPI') || d.includes('DOUGH') || d.includes('SUPERTIEND') || d.includes('DOLLARCITY')) cat = 'Alimentación'
      else if (d.includes('UBER')) cat = 'Transporte'
      else if (d.includes('IMPTO') || d.includes('4X1000')) cat = 'Impuesto 4x1000'
      else if (d.includes('ICETEX') || d.includes('SURAMERICA') || d.includes('PROTEGE') || d.includes('PSE SOI') || d.includes('BOLD')) cat = 'Servicios'
      else if (d.includes('MANEJO') || d.includes('COMISION')) cat = 'Banco/comisiones'
      else if (d.includes('TRANSFERENCIA')) cat = 'Servicios'
    } else {
      if (d.includes('INTERESES')) cat = 'Intereses'
      else if (d.includes('REINTEGRO')) cat = 'Reintegro'
      else if (d.includes('TRANSFERENCIA') || d.includes('PAGO DE PROV') || d.includes('INGAF')) cat = 'Transferencia recibida'
    }
    return { ...t, categoria: cat }
  })
}

export default function ImportView({ onImported }) {
  const [step, setStep]     = useState('upload') // upload | review | saving | done
  const [txs, setTxs]       = useState([])
  const [filter, setFilter] = useState('todos')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(0)
  const fileRef             = useRef()

  const processFile = file => {
    const reader = new FileReader()
    reader.onload = e => {
      const wb   = XLSX.read(e.target.result, { type:'array', cellDates:true })
      const ws   = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws, { header:1, defval:'' })
      const parsed = parseBancolombia(rows)
      if (!parsed) { alert('No encontré el formato de Bancolombia. Revisa el archivo.'); return }
      setTxs(autoCateg(parsed))
      setStep('review')
    }
    reader.readAsArrayBuffer(file)
  }

  const updateTx = (id, field, val) => setTxs(prev => prev.map(t => t.id === id ? { ...t, [field]: val } : t))

  const importar = async () => {
    setSaving(true)
    setStep('saving')
    const active = txs.filter(t => !t.omitir)
    let count = 0
    for (const t of active) {
      if (t.tipo === 'ingreso') {
        await incomeService.upsert({ id: t.id, client: t.nota || 'Extracto bancario', project: t.descripcion, date: t.fecha, amount: t.valor, hasIVA: false, ivaP: 0, status: 'Pagado', method: 'Transferencia', notes: t.descripcion })
      } else {
        const cat = EXP_CATS_MAP[t.categoria] || 'Otros'
        await expenseService.upsert({ id: t.id, date: t.fecha, cat, sub: t.categoria, description: t.nota || t.descripcion, provider: '', amount: t.valor, hasIVA: false, ivaP: 0, method: 'Transferencia', obs: t.descripcion })
      }
      count++
      setSaved(count)
    }
    setSaving(false)
    setStep('done')
    if (onImported) onImported()
  }

  const active   = txs.filter(t => !t.omitir)
  const ingTotal = active.filter(t => t.tipo==='ingreso').reduce((s,t)=>s+t.valor,0)
  const egrTotal = active.filter(t => t.tipo==='egreso').reduce((s,t)=>s+t.valor,0)

  const filtered = txs.filter(t => {
    if (filter === 'todos')    return !t.omitir
    if (filter === 'ingreso')  return !t.omitir && t.tipo==='ingreso'
    if (filter === 'egreso')   return !t.omitir && t.tipo==='egreso'
    if (filter === 'omitir')   return t.omitir
    return true
  })

  const card = { background:T.surf, border:`1px solid ${T.border}`, borderRadius:12, padding:'20px' }

  if (step === 'upload') return (
    <div style={{ maxWidth:600, margin:'0 auto' }}>
      <div style={{ ...card, textAlign:'center', padding:'48px 24px', cursor:'pointer', borderStyle:'dashed' }}
        onClick={() => fileRef.current.click()}
        onDragOver={e=>e.preventDefault()}
        onDrop={e=>{e.preventDefault(); processFile(e.dataTransfer.files[0])}}>
        <div style={{ fontSize:36, marginBottom:12 }}>📄</div>
        <div style={{ fontSize:15, fontWeight:700, color:T.white, marginBottom:6 }}>Sube tu extracto de Bancolombia</div>
        <div style={{ fontSize:13, color:T.muted, marginBottom:20 }}>Arrastra el archivo aquí o haz clic para seleccionar</div>
        <div style={{ display:'inline-block', background:T.surf2, border:`1px solid ${T.border}`, borderRadius:8, padding:'8px 20px', fontSize:13, color:T.text }}>Seleccionar .xlsx</div>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{display:'none'}} onChange={e=>processFile(e.target.files[0])} />
      </div>
      <div style={{ marginTop:16, padding:'14px 16px', background:T.surf2, borderRadius:10, fontSize:12, color:T.muted, lineHeight:1.7 }}>
        <strong style={{color:T.text}}>Cómo exportar desde Bancolombia:</strong><br/>
        Sucursal Virtual → Cuenta de ahorros → Movimientos → Descargar → Excel
      </div>
    </div>
  )

  if (step === 'saving') return (
    <div style={{ textAlign:'center', padding:'60px 20px' }}>
      <div style={{ fontSize:13, color:T.muted, marginBottom:8 }}>Guardando transacciones...</div>
      <div style={{ fontSize:24, fontWeight:700, color:T.green }}>{saved} / {active.length}</div>
    </div>
  )

  if (step === 'done') return (
    <div style={{ textAlign:'center', padding:'60px 20px' }}>
      <div style={{ fontSize:32, marginBottom:12 }}>✅</div>
      <div style={{ fontSize:16, fontWeight:700, color:T.white, marginBottom:6 }}>{active.length} transacciones importadas</div>
      <div style={{ fontSize:13, color:T.muted, marginBottom:24 }}>Ya puedes verlas en Ingresos y Egresos</div>
      <button onClick={()=>setStep('upload')} style={{ background:T.surf2, border:`1px solid ${T.border}`, borderRadius:8, padding:'8px 20px', fontSize:13, color:T.text, cursor:'pointer' }}>Importar otro extracto</button>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {[
          { label:'Ingresos', val:ingTotal, color:T.green },
          { label:'Egresos',  val:egrTotal, color:T.red },
          { label:'Activas',  val:active.length, color:T.blue, raw:true },
        ].map(({label,val,color,raw})=>(
          <div key={label} style={card}>
            <div style={{ fontSize:11, color:T.muted, marginBottom:4, textTransform:'uppercase', letterSpacing:'.05em' }}>{label}</div>
            <div style={{ fontSize:20, fontWeight:700, color }}>{raw ? val : fmtCOP(val)}</div>
          </div>
        ))}
      </div>

      {/* Filters + actions */}
      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
        {['todos','ingreso','egreso','omitir'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{ fontSize:12, padding:'6px 14px', borderRadius:8, border:`1px solid ${filter===f?T.green:T.border}`, background:filter===f?T.greenBg:'transparent', color:filter===f?T.green:T.muted, cursor:'pointer' }}>
            {f==='todos'?'Todos':f==='omitir'?'Omitidos':f==='ingreso'?'Ingresos':'Egresos'}
          </button>
        ))}
        <div style={{ flex:1 }} />
        <button onClick={()=>setStep('upload')} style={{ fontSize:12, padding:'6px 14px', borderRadius:8, border:`1px solid ${T.border}`, background:'transparent', color:T.muted, cursor:'pointer' }}>← Volver</button>
        <button onClick={importar} style={{ fontSize:12, padding:'6px 18px', borderRadius:8, border:'none', background:T.green, color:'#000', fontWeight:700, cursor:'pointer' }}>
          Importar {active.length} transacciones →
        </button>
      </div>

      {/* Table */}
      <div style={{ ...card, padding:0, overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${T.border}` }}>
                {['Fecha','Descripción del banco','Tu nota / cliente','Categoría','Valor','Tipo'].map(h=>(
                  <th key={h} style={{ padding:'10px 12px', textAlign:'left', color:T.muted, fontWeight:500, whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t,i)=>{
                const cats = t.tipo==='ingreso' ? CATS_INGRESO : CATS_EGRESO
                return (
                  <tr key={t.id} style={{ borderBottom:`1px solid ${T.border}`, opacity:t.omitir?.5:1, background:i%2===0?'transparent':T.surf2 }}>
                    <td style={{ padding:'8px 12px', color:T.muted, whiteSpace:'nowrap' }}>{t.fecha.slice(5)}</td>
                    <td style={{ padding:'8px 12px', color:T.text, maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={t.descripcion}>{t.descripcion}</td>
                    <td style={{ padding:'4px 8px' }}>
                      <input value={t.nota} onChange={e=>updateTx(t.id,'nota',e.target.value)}
                        placeholder="Ej: Fiordi" style={{ width:110, fontSize:11, padding:'4px 8px', borderRadius:6, border:`1px solid ${T.border}`, background:T.surf, color:T.text }} />
                    </td>
                    <td style={{ padding:'4px 8px' }}>
                      <select value={t.categoria} onChange={e=>updateTx(t.id,'categoria',e.target.value)}
                        style={{ fontSize:11, padding:'4px 8px', borderRadius:6, border:`1px solid ${T.border}`, background:T.surf, color:T.text }}>
                        {cats.map(c=><option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:'8px 12px', textAlign:'right', fontWeight:600, color:t.tipo==='ingreso'?T.green:T.red, whiteSpace:'nowrap' }}>{fmtCOP(t.valor)}</td>
                    <td style={{ padding:'4px 8px' }}>
                      <select value={t.omitir?'omitir':t.tipo} onChange={e=>{
                        if(e.target.value==='omitir') updateTx(t.id,'omitir',true)
                        else { updateTx(t.id,'omitir',false); updateTx(t.id,'tipo',e.target.value) }
                      }} style={{ fontSize:11, padding:'4px 6px', borderRadius:6, border:`1px solid ${T.border}`, background:T.surf, color:T.text }}>
                        <option value="ingreso">↑ Ingreso</option>
                        <option value="egreso">↓ Egreso</option>
                        <option value="omitir">— Omitir</option>
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
