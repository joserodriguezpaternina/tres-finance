import { useState } from 'react'
import { X, CheckCircle } from 'lucide-react'
import { T, STATUS_LIST, PAY_METHODS, EXP_CATS, uid, fmtS, getIVA, getBase } from './constants.js'
import { inp, lbl, btnGreen, btnRed, btnGhost } from './ui.jsx'

function ModalShell({ title, sub, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
      <div style={{ background: T.surf, borderRadius: 18, border: `1px solid ${T.border}`, padding: 28, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 32px 80px rgba(0,0,0,.6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: T.white, fontFamily: "'Syne',sans-serif" }}>{title}</h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: T.muted }}>{sub}</p>
          </div>
          <button onClick={onClose} style={{ background: T.surf2, border: `1px solid ${T.border}`, borderRadius: 9, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={15} color={T.text2} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function CalcBar({ amount, hasIVA, ivaP, colorTotal }) {
  if (!amount) return null
  const ivaAmt = hasIVA ? (amount * ivaP) / (100 + ivaP) : 0
  const base = amount - ivaAmt
  return (
    <div style={{ background: T.surf2, borderRadius: 10, padding: "12px 16px", marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, border: `1px solid ${T.border}` }}>
      {[["Base", fmtS(base), T.text], ["IVA", fmtS(ivaAmt), T.amber], ["Total", fmtS(amount), colorTotal]].map(([k, v, c]) => (
        <div key={k} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: T.subtle, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".6px" }}>{k}</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: c, fontFamily: "'DM Mono',monospace", marginTop: 3 }}>{v}</div>
        </div>
      ))}
    </div>
  )
}

export function IncomeModal({ initial, onSave, onClose }) {
  const [f, setF] = useState(initial || { client: "", project: "", date: new Date().toISOString().split("T")[0], amount: "", hasIVA: true, ivaP: 19, status: "Pendiente", method: "Transferencia", notes: "" })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const amt = parseFloat(f.amount) || 0

  return (
    <ModalShell title={initial ? "Editar ingreso" : "Nuevo ingreso"} sub="Registra el ingreso en Tres Studio" onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div><label style={lbl}>Cliente</label><input style={inp} value={f.client} onChange={e => set("client", e.target.value)} placeholder="Bancolombia" /></div>
        <div style={{ gridColumn: "1/-1" }}><label style={lbl}>Proyecto / Servicio</label><input style={inp} value={f.project} onChange={e => set("project", e.target.value)} placeholder="Rediseño de marca" /></div>
        <div><label style={lbl}>Fecha</label><input style={inp} type="date" value={f.date} onChange={e => set("date", e.target.value)} /></div>
        <div><label style={lbl}>Monto total (COP)</label><input style={inp} type="number" placeholder="0" value={f.amount} onChange={e => set("amount", e.target.value)} /></div>
        <div>
          <label style={lbl}>¿Aplica IVA?</label>
          <select style={inp} value={f.hasIVA ? "si" : "no"} onChange={e => set("hasIVA", e.target.value === "si")}>
            <option value="si">Sí — incluye IVA</option><option value="no">No — sin IVA</option>
          </select>
        </div>
        {f.hasIVA && <div><label style={lbl}>% IVA</label><input style={inp} type="number" value={f.ivaP} onChange={e => set("ivaP", parseFloat(e.target.value))} /></div>}
        <div>
          <label style={lbl}>Estado</label>
          <select style={inp} value={f.status} onChange={e => set("status", e.target.value)}>
            {STATUS_LIST.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Método de pago</label>
          <select style={inp} value={f.method} onChange={e => set("method", e.target.value)}>
            {PAY_METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: "1/-1" }}><label style={lbl}>Notas</label><input style={inp} value={f.notes} onChange={e => set("notes", e.target.value)} placeholder="Observaciones..." /></div>
      </div>
      <CalcBar amount={amt} hasIVA={f.hasIVA} ivaP={f.ivaP} colorTotal={T.green} />
      <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={btnGhost}>Cancelar</button>
        <button onClick={() => onSave({ ...f, id: f.id || uid(), amount: parseFloat(f.amount) || 0 })} style={btnGreen}>
          <CheckCircle size={14} />{initial ? "Actualizar" : "Guardar ingreso"}
        </button>
      </div>
    </ModalShell>
  )
}

export function ExpenseModal({ initial, onSave, onClose }) {
  const [f, setF] = useState(initial || { date: new Date().toISOString().split("T")[0], cat: "Software y suscripciones", sub: "", desc: "", provider: "", amount: "", hasIVA: false, ivaP: 19, method: "Transferencia", obs: "" })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const amt = parseFloat(f.amount) || 0

  return (
    <ModalShell title={initial ? "Editar egreso" : "Nuevo egreso"} sub="Registra el gasto en Tres Studio" onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div><label style={lbl}>Fecha</label><input style={inp} type="date" value={f.date} onChange={e => set("date", e.target.value)} /></div>
        <div>
          <label style={lbl}>Categoría</label>
          <select style={inp} value={f.cat} onChange={e => set("cat", e.target.value)}>
            {EXP_CATS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Subcategoría</label><input style={inp} value={f.sub} onChange={e => set("sub", e.target.value)} placeholder="Ej: Adobe CC" /></div>
        <div><label style={lbl}>Proveedor</label><input style={inp} value={f.provider} onChange={e => set("provider", e.target.value)} placeholder="Nombre proveedor" /></div>
        <div style={{ gridColumn: "1/-1" }}><label style={lbl}>Descripción</label><input style={inp} value={f.desc} onChange={e => set("desc", e.target.value)} placeholder="Descripción del gasto" /></div>
        <div><label style={lbl}>Monto total (COP)</label><input style={inp} type="number" placeholder="0" value={f.amount} onChange={e => set("amount", e.target.value)} /></div>
        <div>
          <label style={lbl}>¿Incluye IVA?</label>
          <select style={inp} value={f.hasIVA ? "si" : "no"} onChange={e => set("hasIVA", e.target.value === "si")}>
            <option value="si">Sí</option><option value="no">No</option>
          </select>
        </div>
        {f.hasIVA && <div><label style={lbl}>% IVA</label><input style={inp} type="number" value={f.ivaP} onChange={e => set("ivaP", parseFloat(e.target.value))} /></div>}
        <div>
          <label style={lbl}>Método de pago</label>
          <select style={inp} value={f.method} onChange={e => set("method", e.target.value)}>
            {PAY_METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: "1/-1" }}><label style={lbl}>Observaciones</label><input style={inp} value={f.obs} onChange={e => set("obs", e.target.value)} placeholder="Notas adicionales..." /></div>
      </div>
      <CalcBar amount={amt} hasIVA={f.hasIVA} ivaP={f.ivaP} colorTotal={T.red} />
      <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={btnGhost}>Cancelar</button>
        <button onClick={() => onSave({ ...f, id: f.id || uid(), amount: parseFloat(f.amount) || 0 })} style={btnRed}>
          <CheckCircle size={14} />{initial ? "Actualizar" : "Guardar egreso"}
        </button>
      </div>
    </ModalShell>
  )
}

export function RecurringModal({ initial, onSave, onClose }) {
  const [f, setF] = useState(initial || { name: "", cat: "Software", amount: "", hasIVA: true, ivaP: 19, freq: "Mensual", day: 1, method: "T. crédito", active: true, icon: "default", notes: "" })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const amt = parseFloat(f.amount) || 0
  const ICONS = ["adobe","figma","slack","google","notion","loom","office","wifi","globe","spotify","default"]
  const EXP_CATS_RECUR = ["Software","Arriendo","Internet","Servicios","Nómina","Otros"]
  const DAYS = Array.from({length:28},(_,i)=>i+1)

  return (
    <ModalShell title={initial ? "Editar recurrente" : "Nuevo gasto recurrente"} sub="Software, suscripciones, pagos fijos mensuales" onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ gridColumn: "1/-1" }}><label style={lbl}>Nombre</label><input style={inp} value={f.name} onChange={e => set("name", e.target.value)} placeholder="Ej: Adobe Creative Cloud" /></div>
        <div>
          <label style={lbl}>Categoría</label>
          <select style={inp} value={f.cat} onChange={e => set("cat", e.target.value)}>
            {EXP_CATS_RECUR.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Ícono</label>
          <select style={inp} value={f.icon} onChange={e => set("icon", e.target.value)}>
            {ICONS.map(i => <option key={i} value={i}>{i.charAt(0).toUpperCase()+i.slice(1)}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Monto (COP)</label><input style={inp} type="number" placeholder="0" value={f.amount} onChange={e => set("amount", e.target.value)} /></div>
        <div>
          <label style={lbl}>¿Incluye IVA?</label>
          <select style={inp} value={f.hasIVA ? "si" : "no"} onChange={e => set("hasIVA", e.target.value === "si")}>
            <option value="si">Sí</option><option value="no">No</option>
          </select>
        </div>
        {f.hasIVA && <div><label style={lbl}>% IVA</label><input style={inp} type="number" value={f.ivaP} onChange={e => set("ivaP", parseFloat(e.target.value))} /></div>}
        <div>
          <label style={lbl}>Frecuencia</label>
          <select style={inp} value={f.freq} onChange={e => set("freq", e.target.value)}>
            {["Mensual","Bimestral","Trimestral","Semestral","Anual"].map(fr => <option key={fr}>{fr}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Día del mes</label>
          <select style={inp} value={f.day} onChange={e => set("day", parseInt(e.target.value))}>
            {DAYS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Método de pago</label>
          <select style={inp} value={f.method} onChange={e => set("method", e.target.value)}>
            {PAY_METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Estado</label>
          <select style={inp} value={f.active ? "activo" : "pausado"} onChange={e => set("active", e.target.value === "activo")}>
            <option value="activo">Activo</option><option value="pausado">Pausado</option>
          </select>
        </div>
        <div style={{ gridColumn: "1/-1" }}><label style={lbl}>Notas</label><input style={inp} value={f.notes} onChange={e => set("notes", e.target.value)} placeholder="Descripción o detalles..." /></div>
      </div>
      <CalcBar amount={amt} hasIVA={f.hasIVA} ivaP={f.ivaP} colorTotal={T.red} />
      <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={btnGhost}>Cancelar</button>
        <button onClick={() => onSave({ ...f, id: f.id || uid(), amount: parseFloat(f.amount) || 0 })} style={btnRed}>
          <CheckCircle size={14} />{initial ? "Actualizar" : "Guardar recurrente"}
        </button>
      </div>
    </ModalShell>
  )
}
