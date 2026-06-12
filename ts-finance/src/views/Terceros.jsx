/* ─── PAGOS A TERCEROS — liquidación con retenciones (Colombia) ──────────
   Tabs: Liquidar pago · Prestadores · Historial.
   Simulador en vivo (Retefuente · ReteIVA · ReteICA), comprobante de
   egreso con asiento contable y consolidado por prestador.
   ─────────────────────────────────────────────────────────────────────── */
import { useState, useMemo } from 'react'
import {
  Banknote, Calculator, UserPlus, Users, History, Printer, CheckCircle2,
  AlertTriangle, X, Plus, Trash2, Edit2, FileText,
} from 'lucide-react'
import {
  T, fmtS, uid, UVT, RETEFUENTE, RETEIVA_RATE, RETEICA_TARIFAS,
  PAY_METHODS, MONTHS, DOC_TIPOS_SOPORTE,
} from '../constants.js'
import { card, inp, lbl, btnPrimary, btnGhost, btnSmall, btnLime, EmptyState } from '../ui.jsx'
import { prestadorService, pagoTerceroService, calcRetenciones, nextFolio } from '../terceroService.js'
import { logAudit } from '../audit.js'

/* ── Brand moments (intencionalmente oscuros en ambos temas) ── */
const FOREST = '#062F28'
const LIME   = '#9FE870'

const today = () => new Date().toISOString().split('T')[0]
const mono  = { fontFamily: "'DM Mono',monospace" }
const ML    = { fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: T.muted }

const REGIMENES     = ['Responsable de IVA', 'No responsable de IVA', 'Régimen simple']
const TIPOS_PERSONA = ['Natural', 'Jurídica']

const EMPTY_PRESTADOR = {
  nombre: '', nit: '', tipoPersona: 'Natural', declarante: false,
  regimen: 'No responsable de IVA', email: '', telefono: '', ciudad: 'Bogotá',
  actividad: '', conceptoDefault: 'honorarios_pn', notas: '',
}
const emptyForm = () => ({
  prestadorId: '', conceptoId: 'honorarios_pn', bruto: '', aplicaIVA: false, ivaP: 19,
  aplicaReteIVA: false, aplicaReteICA: false, icaTarifaId: 'servicios',
  otras: '', fecha: today(), metodo: 'Transferencia',
  soporte: 'Documento soporte DIAN (Res. 167/2021)', notas: '',
})

const initials = (n = '') => n.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '·'
const fmtFecha = d => { try { return new Date(d + 'T12:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return d } }

/* ── Micro-componentes ───────────────────────────────────────────────── */
function Chip({ label, color = T.text2, bg = T.surf2 }) {
  return <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 9px', borderRadius: 999, background: bg, color, whiteSpace: 'nowrap' }}>{label}</span>
}

function Switch({ on, onChange, disabled }) {
  return (
    <button type="button" onClick={() => !disabled && onChange(!on)} aria-pressed={on} style={{
      width: 36, height: 20, borderRadius: 999, border: 'none', padding: 2, flexShrink: 0,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .4 : 1,
      background: on ? FOREST : T.border, transition: 'background .15s', display: 'flex',
      justifyContent: on ? 'flex-end' : 'flex-start', alignItems: 'center',
    }}>
      <span style={{ width: 16, height: 16, borderRadius: '50%', background: on ? LIME : T.surf, display: 'block', transition: 'all .15s' }} />
    </button>
  )
}

function SwitchRow({ label, sub, on, onChange, disabled, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderRadius: 10, border: `1px solid ${on && !disabled ? T.limeBorder : T.border}`, background: on && !disabled ? T.limeBg : T.surf2 }}>
      <Switch on={on} onChange={onChange} disabled={disabled} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: disabled ? T.muted : T.text }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{sub}</div>}
      </div>
      {children}
    </div>
  )
}

/* ── Formulario de prestador (inline, estilo Modals.jsx) ─────────────── */
function PrestadorForm({ initial, onSave, onCancel, compact }) {
  const [f, setF] = useState(initial || EMPTY_PRESTADOR)
  const [tried, setTried] = useState(false)
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const err = tried && !f.nombre.trim()

  return (
    <div style={{ ...card, borderColor: T.border2 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <UserPlus size={15} color={T.green} />
        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{initial?.id ? 'Editar prestador' : 'Nuevo prestador'}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr 1fr' : 'repeat(3,1fr)', gap: 14 }}>
        <div style={{ gridColumn: compact ? '1/-1' : 'span 2' }}>
          <label style={lbl}>Nombre / Razón social *</label>
          <input style={{ ...inp, borderColor: err ? T.red : T.border }} value={f.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Laura Gómez / Estudio Pixel SAS" />
          {err && <div style={{ fontSize: 11, color: T.red, marginTop: 4 }}>El nombre es obligatorio.</div>}
        </div>
        <div><label style={lbl}>NIT / Cédula</label><input style={inp} value={f.nit} onChange={e => set('nit', e.target.value)} placeholder="1.020.456.789" /></div>
        <div>
          <label style={lbl}>Tipo de persona</label>
          <select style={inp} value={f.tipoPersona} onChange={e => set('tipoPersona', e.target.value)}>
            {TIPOS_PERSONA.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>¿Declarante de renta?</label>
          <select style={inp} value={f.declarante ? 'si' : 'no'} onChange={e => set('declarante', e.target.value === 'si')}>
            <option value="no">No declarante</option><option value="si">Declarante</option>
          </select>
        </div>
        <div>
          <label style={lbl}>Régimen IVA</label>
          <select style={inp} value={f.regimen} onChange={e => set('regimen', e.target.value)}>
            {REGIMENES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Email</label><input style={inp} type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="correo@dominio.com" /></div>
        <div><label style={lbl}>Teléfono</label><input style={inp} value={f.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+57 300 123 4567" /></div>
        <div><label style={lbl}>Ciudad</label><input style={inp} value={f.ciudad} onChange={e => set('ciudad', e.target.value)} placeholder="Bogotá" /></div>
        <div style={{ gridColumn: compact ? 'auto' : 'span 2' }}>
          <label style={lbl}>Actividad / Servicio</label>
          <input style={inp} value={f.actividad} onChange={e => set('actividad', e.target.value)} placeholder="Diseño, desarrollo, asesoría..." />
        </div>
        <div>
          <label style={lbl}>Concepto retefuente habitual</label>
          <select style={inp} value={f.conceptoDefault} onChange={e => set('conceptoDefault', e.target.value)}>
            {RETEFUENTE.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Notas</label><input style={inp} value={f.notas} onChange={e => set('notas', e.target.value)} placeholder="Información adicional..." /></div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.border}`, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={btnGhost}>Cancelar</button>
        <button onClick={() => { setTried(true); if (f.nombre.trim()) onSave({ ...f, id: f.id || uid() }) }} style={btnPrimary}>
          <CheckCircle2 size={14} />{initial?.id ? 'Actualizar prestador' : 'Guardar prestador'}
        </button>
      </div>
    </div>
  )
}

/* ── Panel de simulación (brand moment — oscuro en ambos temas) ──────── */
function SimRow({ label, value, sign, dim, rate }) {
  const color = sign === '+' ? LIME : sign === '-' ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.92)'
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
      <div style={{ minWidth: 0 }}>
        <span style={{ fontSize: 12, color: dim ? 'rgba(255,255,255,.45)' : 'rgba(255,255,255,.78)' }}>{label}</span>
        {rate && <span style={{ fontSize: 10, color: 'rgba(159,232,112,.7)', marginLeft: 6, ...mono }}>{rate}</span>}
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: dim ? 'rgba(255,255,255,.35)' : color, ...mono, whiteSpace: 'nowrap' }}>
        {sign === '-' && value > 0 ? '−' : sign === '+' && value > 0 ? '+' : ''}{fmtS(value)}
      </span>
    </div>
  )
}

function SimPanel({ calc, concepto, tarifaICA, f, hasPrestador, hasBruto }) {
  const tieneRete = calc.retefuente > 0
  return (
    <div style={{ position: 'sticky', top: 20, background: FOREST, borderRadius: 14, padding: '22px 22px 20px', border: '1px solid rgba(159,232,112,.18)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Calculator size={14} color={LIME} />
        <span style={{ ...ML, color: 'rgba(255,255,255,.55)' }}>Simulación de liquidación</span>
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 14 }}>
        {concepto ? concepto.label : 'Selecciona un concepto'} · UVT 2026 {fmtS(UVT)}
      </div>

      <SimRow label="Valor bruto del servicio" value={calc.base} dim={!hasBruto} />
      <SimRow label={`(+) IVA ${f.aplicaIVA ? `${f.ivaP}%` : ''}`} value={calc.iva} sign="+" dim={calc.iva === 0} />
      <SimRow
        label={`(−) Retefuente`}
        rate={concepto ? `${concepto.rate}%` : null}
        value={calc.retefuente} sign="-" dim={!tieneRete}
      />
      <SimRow label={`(−) ReteIVA (${RETEIVA_RATE}% del IVA)`} value={calc.reteiva} sign="-" dim={calc.reteiva === 0} />
      <SimRow label={`(−) ReteICA${tarifaICA && calc.reteica > 0 ? ` ${tarifaICA.perMil}×mil` : ''}`} value={calc.reteica} sign="-" dim={calc.reteica === 0} />
      <SimRow label="(−) Otras deducciones" value={calc.otras} sign="-" dim={calc.otras === 0} />

      <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 12, background: 'rgba(159,232,112,.08)', border: `1px solid rgba(159,232,112,.25)` }}>
        <div style={{ ...ML, color: 'rgba(159,232,112,.75)' }}>Neto a pagar</div>
        <div style={{ fontSize: 30, fontWeight: 700, color: LIME, ...mono, letterSpacing: '-.5px', lineHeight: 1.15, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {fmtS(calc.neto)}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 6 }}>
          Total retenido <span style={{ color: '#FFFFFF', fontWeight: 600, ...mono }}>{fmtS(calc.totalRetenido)}</span>
          {calc.iva > 0 && <> · Total factura <span style={{ color: '#FFFFFF', fontWeight: 600, ...mono }}>{fmtS(calc.base + calc.iva)}</span></>}
        </div>
      </div>

      {calc.aplicaBaseMinima && concepto && (
        <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 10, background: 'rgba(217,119,6,.15)', border: '1px solid rgba(217,119,6,.4)' }}>
          <AlertTriangle size={14} color="#F5B45E" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 11, color: '#F5D7AE', lineHeight: 1.5 }}>
            No aplica retención: base inferior a {concepto.baseUVT} UVT — {fmtS(calc.baseMinimaCOP)}
          </span>
        </div>
      )}
      {(!hasPrestador || !hasBruto) && (
        <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,.4)', lineHeight: 1.5 }}>
          {!hasPrestador && 'Selecciona un prestador. '}{!hasBruto && 'Ingresa el valor bruto del servicio.'}
        </div>
      )}
    </div>
  )
}

/* ── Comprobante de egreso (modal) ───────────────────────────────────── */
function ComprobanteModal({ pago, onClose }) {
  if (!pago) return null
  const lineas = [
    { c: pago.concepto, base: pago.base, t: '—', v: pago.base, pos: true },
    pago.iva > 0 && { c: 'IVA facturado', base: pago.base, t: '19%', v: pago.iva, pos: true },
    pago.retefuente > 0 && { c: 'Retención en la fuente', base: pago.base, t: `${(RETEFUENTE.find(x => x.id === pago.conceptoId) || {}).rate ?? '—'}%`, v: -pago.retefuente },
    pago.reteiva > 0 && { c: 'Retención de IVA', base: pago.iva, t: `${RETEIVA_RATE}% IVA`, v: -pago.reteiva },
    pago.reteica > 0 && { c: 'Retención de ICA', base: pago.base, t: 'por mil', v: -pago.reteica },
    pago.otras > 0 && { c: 'Otras deducciones', base: pago.base, t: '—', v: -pago.otras },
  ].filter(Boolean)

  const asiento = [
    { cuenta: '5110 · Honorarios', d: pago.bruto, c: 0 },
    pago.iva > 0 && { cuenta: '2408D · IVA descontable', d: pago.iva, c: 0 },
    pago.retefuente > 0 && { cuenta: '2365 · Retefuente por pagar', d: 0, c: pago.retefuente },
    pago.reteiva > 0 && { cuenta: '2367 · ReteIVA por pagar', d: 0, c: pago.reteiva },
    pago.reteica > 0 && { cuenta: '2368 · ReteICA por pagar', d: 0, c: pago.reteica },
    pago.otras > 0 && { cuenta: 'Otras deducciones por pagar', d: 0, c: pago.otras },
    { cuenta: '1105 · Caja / Bancos', d: 0, c: pago.neto },
  ].filter(Boolean)

  const thC = { ...ML, textAlign: 'left', padding: '7px 10px', borderBottom: `1px solid ${T.border}` }
  const thR = { ...thC, textAlign: 'right' }
  const tdC = { fontSize: 12, color: T.text2, padding: '7px 10px', borderBottom: `1px solid ${T.border}` }
  const tdR = { ...tdC, textAlign: 'right', ...mono }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20 }}>
      <div style={{ background: T.surf, borderRadius: 16, border: `1px solid ${T.border}`, width: '100%', maxWidth: 620, maxHeight: '92vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ background: FOREST, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div style={{ ...ML, color: 'rgba(159,232,112,.8)' }}>tres Finance® · Comprobante de egreso</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#FFFFFF', marginTop: 4, letterSpacing: '-.3px' }}>Pago a terceros</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 3, ...mono }}>{pago.folio} · {fmtFecha(pago.fecha)}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <X size={14} color="#FFFFFF" />
          </button>
        </div>

        <div style={{ padding: '22px 24px' }}>
          {/* Prestador */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: '14px 16px', borderRadius: 10, background: T.surf2, border: `1px solid ${T.border}`, marginBottom: 18 }}>
            <div>
              <div style={ML}>Pagado a</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginTop: 3 }}>{pago.prestadorNombre}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>NIT/CC {pago.nit || '—'}</div>
            </div>
            <div>
              <div style={ML}>Detalle</div>
              <div style={{ fontSize: 12, color: T.text2, marginTop: 3 }}>{pago.metodo} · {pago.soporte}</div>
              {pago.notas && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{pago.notas}</div>}
            </div>
          </div>

          {/* Liquidación */}
          <div style={{ ...ML, marginBottom: 8 }}>Liquidación</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 18 }}>
            <thead><tr><th style={thC}>Concepto</th><th style={thR}>Base</th><th style={thR}>Tarifa</th><th style={thR}>Valor</th></tr></thead>
            <tbody>
              {lineas.map((l, i) => (
                <tr key={i}>
                  <td style={tdC}>{l.c}</td>
                  <td style={tdR}>{fmtS(l.base)}</td>
                  <td style={{ ...tdR, color: T.muted }}>{l.t}</td>
                  <td style={{ ...tdR, fontWeight: 600, color: l.v < 0 ? T.red : T.text }}>{l.v < 0 ? `−${fmtS(-l.v)}` : fmtS(l.v)}</td>
                </tr>
              ))}
              <tr>
                <td style={{ ...tdC, fontWeight: 700, color: T.text, borderBottom: 'none' }} colSpan={3}>Neto a pagar</td>
                <td style={{ ...tdR, fontWeight: 700, fontSize: 14, color: T.green, borderBottom: 'none' }}>{fmtS(pago.neto)}</td>
              </tr>
            </tbody>
          </table>

          {/* Asiento contable */}
          <div style={{ ...ML, marginBottom: 8 }}>Asiento contable (vista previa)</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={thC}>Cuenta</th><th style={thR}>Débito</th><th style={thR}>Crédito</th></tr></thead>
            <tbody>
              {asiento.map((a, i) => (
                <tr key={i}>
                  <td style={tdC}>{a.cuenta}</td>
                  <td style={tdR}>{a.d ? fmtS(a.d) : '—'}</td>
                  <td style={tdR}>{a.c ? fmtS(a.c) : '—'}</td>
                </tr>
              ))}
              <tr>
                <td style={{ ...tdC, fontWeight: 700, color: T.text, borderBottom: 'none' }}>Sumas iguales</td>
                <td style={{ ...tdR, fontWeight: 700, borderBottom: 'none' }}>{fmtS(asiento.reduce((s, a) => s + a.d, 0))}</td>
                <td style={{ ...tdR, fontWeight: 700, borderBottom: 'none' }}>{fmtS(asiento.reduce((s, a) => s + a.c, 0))}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 10, color: T.subtle }}>Documento generado por tres Finance®</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onClose} style={btnGhost}>Cerrar</button>
              <button onClick={() => window.print()} style={btnPrimary}><Printer size={14} />Imprimir</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════ */
export default function TercerosView({ clients = [], onRegisterExpense }) {
  const [tab, setTab]                 = useState('liquidar')
  const [prestadores, setPrestadores] = useState(() => prestadorService.getAll())
  const [pagos, setPagos]             = useState(() => pagoTerceroService.getAll())

  /* Tab 1 */
  const [f, setF]               = useState(emptyForm)
  const [tried, setTried]       = useState(false)
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState(null)
  const [miniPrestador, setMiniPrestador] = useState(false)

  /* Tab 2 */
  const [prestadorForm, setPrestadorForm] = useState(null)   // null | {} | prestador

  /* Tab 3 */
  const [fPrest, setFPrest]         = useState('todos')
  const [fMes, setFMes]             = useState('todos')
  const [comprobante, setComprobante] = useState(null)

  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const prestador = prestadores.find(p => p.id === f.prestadorId) || null
  const concepto  = RETEFUENTE.find(c => c.id === f.conceptoId) || null
  const tarifaICA = RETEICA_TARIFAS.find(t => t.id === f.icaTarifaId) || null
  const bruto     = parseFloat(f.bruto) || 0

  const calc = useMemo(() => calcRetenciones({
    bruto, aplicaIVA: f.aplicaIVA, ivaP: parseFloat(f.ivaP) || 0, conceptoId: f.conceptoId,
    declarante: prestador?.declarante, responsableIVA: prestador?.regimen === 'Responsable de IVA',
    aplicaReteIVA: f.aplicaIVA && f.aplicaReteIVA, aplicaReteICA: f.aplicaReteICA,
    icaTarifaId: f.icaTarifaId, otras: parseFloat(f.otras) || 0,
  }), [bruto, f, prestador])

  const errPrestador = tried && !f.prestadorId
  const errBruto     = tried && bruto <= 0

  /* ── seleccionar prestador → sugerencias automáticas ── */
  const pickPrestador = id => {
    const p = prestadores.find(x => x.id === id)
    if (!p) { set('prestadorId', '') ; return }
    const respIVA = p.regimen === 'Responsable de IVA'
    setF(prev => ({
      ...prev, prestadorId: id,
      conceptoId: p.conceptoDefault || prev.conceptoId,
      aplicaIVA: respIVA, aplicaReteIVA: respIVA,
    }))
  }

  const savePrestador = (p, fromMini) => {
    const isEdit = prestadores.some(x => x.id === p.id)
    setPrestadores(prestadorService.upsert(p))
    logAudit(isEdit ? 'editar' : 'crear', 'prestador', `${p.nombre}${p.nit ? ' · ' + p.nit : ''}`, { id: p.id })
    if (fromMini) { setMiniPrestador(false); pickPrestadorAfter(p) }
    else setPrestadorForm(null)
  }
  const pickPrestadorAfter = p => {
    const respIVA = p.regimen === 'Responsable de IVA'
    setF(prev => ({ ...prev, prestadorId: p.id, conceptoId: p.conceptoDefault || prev.conceptoId, aplicaIVA: respIVA, aplicaReteIVA: respIVA }))
  }
  const deletePrestador = p => {
    if (!window.confirm(`¿Eliminar al prestador "${p.nombre}"? Los pagos registrados se conservan.`)) return
    setPrestadores(prestadorService.remove(p.id))
    logAudit('eliminar', 'prestador', p.nombre, { id: p.id })
  }

  /* ── liquidar y registrar ── */
  const liquidar = async () => {
    setTried(true)
    if (!f.prestadorId || bruto <= 0 || !prestador || !concepto || saving) return
    setSaving(true)
    try {
      const folio = nextFolio(pagos)
      const pago = {
        id: uid(), fecha: f.fecha, prestadorId: prestador.id, prestadorNombre: prestador.nombre,
        nit: prestador.nit || '', concepto: concepto.label, conceptoId: concepto.id,
        bruto: calc.base, iva: calc.iva, base: calc.base,
        retefuente: calc.retefuente, reteiva: calc.reteiva, reteica: calc.reteica, otras: calc.otras,
        totalRetenido: calc.totalRetenido, neto: calc.neto,
        metodo: f.metodo, soporte: f.soporte, folio, notas: f.notas,
      }
      setPagos(pagoTerceroService.add(pago))
      const desglose = [
        `Pago a terceros ${folio}`, `Concepto: ${concepto.label}`,
        `Bruto ${fmtS(calc.base)}`, calc.iva > 0 && `IVA ${fmtS(calc.iva)}`,
        calc.retefuente > 0 && `Retefuente ${concepto.rate}% ${fmtS(calc.retefuente)}`,
        calc.reteiva > 0 && `ReteIVA ${fmtS(calc.reteiva)}`,
        calc.reteica > 0 && `ReteICA ${fmtS(calc.reteica)}`,
        calc.otras > 0 && `Otras ${fmtS(calc.otras)}`,
        `Neto ${fmtS(calc.neto)}`, `Soporte: ${f.soporte}`,
      ].filter(Boolean).join(' · ')
      await onRegisterExpense({
        id: uid(), date: f.fecha, cat: 'Honorarios', sub: 'Pago a terceros',
        desc: `${concepto.label} — ${prestador.nombre} (${folio})`, provider: prestador.nombre,
        amount: calc.neto, hasIVA: false, ivaP: 0, method: f.metodo, obs: desglose,
      })
      logAudit('crear', 'pago tercero', `${folio} · ${prestador.nombre} · neto ${fmtS(calc.neto)}`, { folio, pagoId: pago.id })
      setSuccess(pago)
    } finally { setSaving(false) }
  }

  const resetForm = () => { setF(emptyForm()); setTried(false); setSuccess(null); setMiniPrestador(false) }

  /* ── métricas (año en curso) ── */
  const year = new Date().getFullYear()
  const pagosYear = useMemo(() => pagos.filter(p => new Date(p.fecha + 'T12:00:00').getFullYear() === year), [pagos, year])
  const histFiltered = useMemo(() => pagosYear.filter(p =>
    (fPrest === 'todos' || p.prestadorId === fPrest) &&
    (fMes === 'todos' || new Date(p.fecha + 'T12:00:00').getMonth() === Number(fMes))
  ), [pagosYear, fPrest, fMes])

  const kpis = useMemo(() => ({
    pagado:    pagosYear.reduce((s, p) => s + p.neto, 0),
    retenido:  pagosYear.reduce((s, p) => s + p.totalRetenido, 0),
    retefuente: pagosYear.reduce((s, p) => s + p.retefuente, 0),
    n:         pagosYear.length,
  }), [pagosYear])

  const consolidado = useMemo(() => {
    const m = new Map()
    histFiltered.forEach(p => {
      const k = p.prestadorId || p.prestadorNombre
      const c = m.get(k) || { nombre: p.prestadorNombre, nit: p.nit, n: 0, bruto: 0, retenido: 0, neto: 0 }
      c.n += 1; c.bruto += p.bruto + p.iva; c.retenido += p.totalRetenido; c.neto += p.neto
      m.set(k, c)
    })
    return [...m.values()].sort((a, b) => b.neto - a.neto)
  }, [histFiltered])

  const statsPrestador = id => {
    const mine = pagosYear.filter(p => p.prestadorId === id)
    return { total: mine.reduce((s, p) => s + p.neto, 0), n: mine.length }
  }

  /* ── table styles ── */
  const th  = { ...ML, textAlign: 'left', padding: '10px 14px', borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap' }
  const thR = { ...th, textAlign: 'right' }
  const td  = { fontSize: 13, color: T.text2, padding: '11px 14px', borderBottom: `1px solid ${T.border}` }
  const tdR = { ...td, textAlign: 'right', ...mono }

  const TABS = [
    ['liquidar',    'Liquidar pago', Banknote],
    ['prestadores', 'Prestadores',   Users],
    ['historial',   'Historial',     History],
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="page-hdr">
        <div>
          <div className="page-title">Pagos a Terceros</div>
          <div className="page-sub">Liquidación de servicios y honorarios con retenciones — Retefuente · ReteIVA · ReteICA.</div>
        </div>
      </div>

      {/* Segmented control */}
      <div style={{ display: 'inline-flex', alignSelf: 'flex-start', gap: 4, padding: 4, background: T.surf2, border: `1px solid ${T.border}`, borderRadius: 12 }}>
        {TABS.map(([val, label, Icon]) => (
          <button key={val} onClick={() => setTab(val)} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9,
            border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
            background: tab === val ? FOREST : 'transparent',
            color: tab === val ? LIME : T.muted, transition: 'all .15s',
          }}>
            <Icon size={13} />{label}
          </button>
        ))}
      </div>

      {/* ════════ TAB 1 — LIQUIDAR PAGO ════════ */}
      {tab === 'liquidar' && (success ? (
        <div style={{ ...card, maxWidth: 560, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 32px' }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: T.greenBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <CheckCircle2 size={26} color={T.green} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: T.text, letterSpacing: '-.3px' }}>Pago liquidado y registrado</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>El egreso quedó registrado en gastos como "Honorarios · Pago a terceros".</div>
          <div style={{ width: '100%', marginTop: 20, padding: '14px 18px', borderRadius: 12, background: T.surf2, border: `1px solid ${T.border}`, textAlign: 'left' }}>
            {[
              ['Folio', success.folio], ['Prestador', success.prestadorNombre],
              ['Bruto', fmtS(success.bruto)], ['Total retenido', `−${fmtS(success.totalRetenido)}`],
              ['Neto pagado', fmtS(success.neto)],
            ].map(([k, v], i, arr) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                <span style={ML}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: i === arr.length - 1 ? 700 : 600, color: i === arr.length - 1 ? T.green : T.text, ...mono }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <button onClick={() => setComprobante(success)} style={btnGhost}><FileText size={14} />Ver comprobante</button>
            <button onClick={resetForm} style={btnLime}><Plus size={14} />Nuevo pago</button>
          </div>
        </div>
      ) : (
        <div className="g2-1">
          {/* ── FORM ── */}
          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Prestador */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <label style={{ ...lbl, marginBottom: 0 }}>Prestador del servicio *</label>
                <button onClick={() => setMiniPrestador(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: T.green, display: 'flex', alignItems: 'center', gap: 4, padding: 0, fontFamily: 'inherit' }}>
                  <UserPlus size={12} />{miniPrestador ? 'Cerrar' : 'Nuevo prestador'}
                </button>
              </div>
              <select
                style={{ ...inp, borderColor: errPrestador ? T.red : T.border }}
                value={f.prestadorId} onChange={e => pickPrestador(e.target.value)}
              >
                <option value="">— Seleccionar prestador —</option>
                {prestadores.map(p => <option key={p.id} value={p.id}>{p.nombre}{p.nit ? ` · ${p.nit}` : ''}</option>)}
              </select>
              {errPrestador && <div style={{ fontSize: 11, color: T.red, marginTop: 4 }}>Selecciona el prestador del servicio.</div>}
              {prestador && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  <Chip label={`Persona ${prestador.tipoPersona}`} color={T.blue} bg={T.blueBg} />
                  <Chip label={prestador.regimen} color={T.violet} bg={T.violetBg} />
                  <Chip label={prestador.declarante ? 'Declarante' : 'No declarante'} color={prestador.declarante ? T.green : T.amber} bg={prestador.declarante ? T.greenBg : T.amberBg} />
                  {prestador.nit && <Chip label={`NIT ${prestador.nit}`} />}
                </div>
              )}
              {miniPrestador && (
                <div style={{ marginTop: 12 }}>
                  <PrestadorForm compact onSave={p => savePrestador(p, true)} onCancel={() => setMiniPrestador(false)} />
                </div>
              )}
            </div>

            {/* Concepto + bruto */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Concepto de retención</label>
                <select style={inp} value={f.conceptoId} onChange={e => set('conceptoId', e.target.value)}>
                  {RETEFUENTE.map(c => <option key={c.id} value={c.id}>{c.label} — {c.rate}%{c.baseUVT > 0 ? ` (base ${c.baseUVT} UVT)` : ''}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Valor bruto del servicio (COP) *</label>
                <input
                  style={{ ...inp, ...mono, borderColor: errBruto ? T.red : T.border }}
                  type="number" min="0" placeholder="0"
                  value={f.bruto} onChange={e => set('bruto', e.target.value)}
                />
                {errBruto && <div style={{ fontSize: 11, color: T.red, marginTop: 4 }}>Ingresa un valor bruto mayor a cero.</div>}
              </div>
              <div><label style={lbl}>Fecha del pago</label><input style={inp} type="date" value={f.fecha} onChange={e => set('fecha', e.target.value)} /></div>
            </div>

            {/* IVA + retenciones sugeridas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={ML}>Impuestos y retenciones</span>
              <SwitchRow
                label="Factura con IVA" sub="El IVA se suma al valor bruto"
                on={f.aplicaIVA}
                onChange={v => setF(p => ({ ...p, aplicaIVA: v, aplicaReteIVA: v ? p.aplicaReteIVA : false }))}
              >
                {f.aplicaIVA && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <input style={{ ...inp, width: 64, padding: '6px 9px', ...mono }} type="number" value={f.ivaP} onChange={e => set('ivaP', e.target.value)} />
                    <span style={{ fontSize: 12, color: T.muted }}>%</span>
                  </div>
                )}
              </SwitchRow>
              <SwitchRow
                label={`Aplicar ReteIVA (${RETEIVA_RATE}%)`}
                sub={f.aplicaIVA ? 'Sobre el IVA facturado' : 'Requiere factura con IVA'}
                on={f.aplicaIVA && f.aplicaReteIVA} disabled={!f.aplicaIVA}
                onChange={v => set('aplicaReteIVA', v)}
              />
              <SwitchRow
                label="Aplicar ReteICA" sub="Industria y comercio — tarifa municipal"
                on={f.aplicaReteICA} onChange={v => set('aplicaReteICA', v)}
              >
                {f.aplicaReteICA && (
                  <select style={{ ...inp, width: 220, padding: '6px 9px' }} value={f.icaTarifaId} onChange={e => set('icaTarifaId', e.target.value)}>
                    {RETEICA_TARIFAS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                )}
              </SwitchRow>
            </div>

            {/* Detalle del pago */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div><label style={lbl}>Otras deducciones (COP)</label><input style={{ ...inp, ...mono }} type="number" min="0" placeholder="0" value={f.otras} onChange={e => set('otras', e.target.value)} /></div>
              <div>
                <label style={lbl}>Método de pago</label>
                <select style={inp} value={f.metodo} onChange={e => set('metodo', e.target.value)}>
                  {PAY_METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Tipo de soporte</label>
                <select style={inp} value={f.soporte} onChange={e => set('soporte', e.target.value)}>
                  {DOC_TIPOS_SOPORTE.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Notas</label><input style={inp} value={f.notas} onChange={e => set('notas', e.target.value)} placeholder="Observaciones del pago..." /></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
              <button onClick={liquidar} disabled={saving} style={{ ...btnPrimary, padding: '11px 22px', fontSize: 13, opacity: saving ? .6 : 1 }}>
                <Banknote size={15} />{saving ? 'Registrando…' : 'Liquidar y registrar pago'}
              </button>
            </div>
          </div>

          {/* ── SIMULACIÓN ── */}
          <div>
            <SimPanel calc={calc} concepto={concepto} tarifaICA={tarifaICA} f={f} hasPrestador={Boolean(f.prestadorId)} hasBruto={bruto > 0} />
          </div>
        </div>
      ))}

      {/* ════════ TAB 2 — PRESTADORES ════════ */}
      {tab === 'prestadores' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{prestadores.length} prestador{prestadores.length !== 1 ? 'es' : ''} registrado{prestadores.length !== 1 ? 's' : ''}</span>
            {!prestadorForm && (
              <button onClick={() => setPrestadorForm({})} style={btnPrimary}><UserPlus size={14} />Nuevo prestador</button>
            )}
          </div>
          {prestadorForm && (
            <PrestadorForm
              initial={prestadorForm.id ? prestadorForm : null}
              onSave={p => savePrestador(p, false)}
              onCancel={() => setPrestadorForm(null)}
            />
          )}
          {prestadores.length === 0 && !prestadorForm ? (
            <div style={{ ...card }}>
              <EmptyState icon={Users} title="Sin prestadores registrados" sub="Registra a las personas y empresas a las que pagas servicios para liquidar sus retenciones." action="Registrar prestador" onAction={() => setPrestadorForm({})} />
            </div>
          ) : (
            <div className="g3">
              {prestadores.map(p => {
                const st = statsPrestador(p.id)
                const conc = RETEFUENTE.find(c => c.id === p.conceptoDefault)
                return (
                  <div key={p.id} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: FOREST, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: LIME, ...mono }}>{initials(p.nombre)}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</div>
                        <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{p.nit ? `NIT/CC ${p.nit}` : 'Sin NIT'}{p.ciudad ? ` · ${p.ciudad}` : ''}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                        <button onClick={() => setPrestadorForm(p)} title="Editar" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, borderRadius: 7, display: 'flex' }}><Edit2 size={13} color={T.blue} /></button>
                        <button onClick={() => deletePrestador(p)} title="Eliminar" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, borderRadius: 7, display: 'flex' }}><Trash2 size={13} color={T.red} /></button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      <Chip label={p.tipoPersona} color={T.blue} bg={T.blueBg} />
                      <Chip label={p.regimen} color={T.violet} bg={T.violetBg} />
                      <Chip label={p.declarante ? 'Declarante' : 'No declarante'} color={p.declarante ? T.green : T.amber} bg={p.declarante ? T.greenBg : T.amberBg} />
                    </div>
                    {(p.actividad || conc) && (
                      <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>
                        {p.actividad && <>{p.actividad}<br /></>}
                        {conc && <>Concepto habitual: {conc.label} ({conc.rate}%)</>}
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 10, borderTop: `1px solid ${T.border}`, marginTop: 'auto' }}>
                      <div>
                        <div style={ML}>Pagado {year}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: T.text, ...mono, marginTop: 2 }}>{fmtS(st.total)}</div>
                      </div>
                      <Chip label={`${st.n} pago${st.n !== 1 ? 's' : ''}`} color={st.n > 0 ? T.green : T.muted} bg={st.n > 0 ? T.greenBg : T.surf2} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ════════ TAB 3 — HISTORIAL ════════ */}
      {tab === 'historial' && (
        <>
          {/* KPI strip */}
          <div style={{ display: 'flex', background: T.surf, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden', flexWrap: 'wrap' }}>
            {[
              ['Total pagado (neto)', fmtS(kpis.pagado), T.text],
              ['Total retenido', fmtS(kpis.retenido), T.amber],
              ['Retefuente acumulada', fmtS(kpis.retefuente), T.red],
              [`Pagos en ${year}`, String(kpis.n), T.text],
            ].map(([label, value, color], i, arr) => (
              <div key={label} style={{ flex: '1 1 160px', padding: '16px 20px', borderRight: i < arr.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                <div style={ML}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color, ...mono, letterSpacing: '-.4px', marginTop: 6 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <select style={{ ...inp, width: 'auto', minWidth: 200 }} value={fPrest} onChange={e => setFPrest(e.target.value)}>
              <option value="todos">Todos los prestadores</option>
              {prestadores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <select style={{ ...inp, width: 'auto', minWidth: 150 }} value={fMes} onChange={e => setFMes(e.target.value)}>
              <option value="todos">Todo el año</option>
              {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
          </div>

          {/* Tabla */}
          <div className="tbl-wrap" style={{ background: T.surf, borderRadius: 14, border: `1px solid ${T.border}` }}>
            {histFiltered.length === 0 ? (
              <EmptyState icon={History} title="Sin pagos en este período" sub="Liquida tu primer pago a terceros para verlo aquí con su comprobante." action="Liquidar pago" onAction={() => setTab('liquidar')} />
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                <thead>
                  <tr>
                    <th style={th}>Folio</th><th style={th}>Fecha</th><th style={th}>Prestador</th>
                    <th style={th}>Concepto</th><th style={thR}>Bruto</th><th style={thR}>Retenciones</th>
                    <th style={thR}>Neto</th><th style={th}></th>
                  </tr>
                </thead>
                <tbody>
                  {histFiltered.map(p => (
                    <tr key={p.id}>
                      <td style={{ ...td, fontWeight: 600, color: T.text, ...mono, fontSize: 12 }}>{p.folio}</td>
                      <td style={{ ...td, fontSize: 12, color: T.muted, whiteSpace: 'nowrap' }}>{fmtFecha(p.fecha)}</td>
                      <td style={{ ...td, fontWeight: 600, color: T.text }}>{p.prestadorNombre}</td>
                      <td style={{ ...td, fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.concepto}</td>
                      <td style={tdR}>{fmtS(p.bruto)}</td>
                      <td style={{ ...tdR, color: T.red }}>−{fmtS(p.totalRetenido)}</td>
                      <td style={{ ...tdR, fontWeight: 700, color: T.green }}>{fmtS(p.neto)}</td>
                      <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button onClick={() => setComprobante(p)} style={{ ...btnSmall, background: T.surf2, color: T.text2, border: `1px solid ${T.border}` }}>
                          <FileText size={12} />Ver comprobante
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Consolidado por prestador */}
          {consolidado.length > 0 && (
            <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={14} color={T.green} />
                <span style={{ fontSize: 12, fontWeight: 700, color: T.text, textTransform: 'uppercase', letterSpacing: '.06em' }}>Consolidado por prestador</span>
                <span style={{ fontSize: 11, color: T.muted }}>— base del certificado de retenciones {year}</span>
              </div>
              <div className="tbl-wrap">
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
                  <thead>
                    <tr>
                      <th style={th}>Prestador</th><th style={thR}>Pagos</th>
                      <th style={thR}>Bruto + IVA</th><th style={thR}>Total retenido</th><th style={thR}>Neto pagado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consolidado.map(c => (
                      <tr key={c.nombre}>
                        <td style={{ ...td, fontWeight: 600, color: T.text }}>{c.nombre}<span style={{ fontSize: 11, color: T.muted, fontWeight: 400 }}>{c.nit ? ` · ${c.nit}` : ''}</span></td>
                        <td style={tdR}>{c.n}</td>
                        <td style={tdR}>{fmtS(c.bruto)}</td>
                        <td style={{ ...tdR, color: T.red }}>−{fmtS(c.retenido)}</td>
                        <td style={{ ...tdR, fontWeight: 700, color: T.green }}>{fmtS(c.neto)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Comprobante modal */}
      {comprobante && <ComprobanteModal pago={comprobante} onClose={() => setComprobante(null)} />}
    </div>
  )
}
