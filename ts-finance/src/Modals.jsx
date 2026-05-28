import { useState, useMemo } from 'react'
import { X, CheckCircle, Search, Plus, History, ArrowLeft } from 'lucide-react'
import { T, STATUS_LIST, PAY_METHODS, EXP_CATS, uid, fmtS, DIAN_DEDUCIBLES, DOC_TIPOS_SOPORTE } from './constants.js'
import { inp, lbl, btnGreen, btnRed, btnGhost } from './ui.jsx'

const today = () => new Date().toISOString().split("T")[0]

function ModalShell({ title, sub, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,.4)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: 20,
    }}>
      <div style={{
        background: "#FFFFFF", borderRadius: 16,
        border: "1px solid #EEECE8",
        padding: 0, width: "100%", maxWidth: 520,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,.15)",
      }}>
        {/* Modal header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          padding: "24px", borderBottom: "1px solid #EEECE8",
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.text, letterSpacing: "-.3px" }}>{title}</h2>
            {sub && <p style={{ margin: "4px 0 0", fontSize: 12, color: T.muted }}>{sub}</p>}
          </div>
          <button onClick={onClose} style={{
            background: "#F5F4F1", border: "1px solid #EEECE8", borderRadius: 8,
            width: 32, height: 32, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, marginLeft: 12,
          }}>
            <X size={14} color={T.subtle} />
          </button>
        </div>
        {/* Modal body */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 0 }}>
          {children}
        </div>
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
          <div style={{ fontSize: 14, fontWeight: 700, color: c, fontFamily: "'DM Mono',monospace", marginTop: 3 }}>{v}</div>
        </div>
      ))}
    </div>
  )
}

/* ── Pantalla de inicio: nuevo vs historial ─────────────── */
function StartScreen({ onNew, onFromHistory, onClose, historyCount }) {
  const btnStyle = {
    display: "flex", alignItems: "center", gap: 14,
    padding: "16px 18px", borderRadius: 12, border: `1.5px solid ${T.border}`,
    background: T.surf, cursor: "pointer", textAlign: "left", width: "100%",
    transition: "border-color .12s",
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <button style={btnStyle}
        onClick={onNew}
        onMouseEnter={e => e.currentTarget.style.borderColor = T.text}
        onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
      >
        <div style={{ width: 36, height: 36, borderRadius: 10, background: T.greenBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Plus size={16} color={T.green} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Registrar nuevo</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Formulario en blanco</div>
        </div>
      </button>
      <button style={{ ...btnStyle, opacity: historyCount === 0 ? .4 : 1, cursor: historyCount === 0 ? "default" : "pointer" }}
        onClick={historyCount > 0 ? onFromHistory : undefined}
        onMouseEnter={e => { if (historyCount > 0) e.currentTarget.style.borderColor = T.violet }}
        onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
      >
        <div style={{ width: 36, height: 36, borderRadius: 10, background: T.violetBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <History size={16} color={T.violet} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Repetir uno anterior</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
            {historyCount > 0 ? `Buscar entre ${historyCount} registros y autocompletar` : "Sin registros anteriores"}
          </div>
        </div>
      </button>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
        <button onClick={onClose} style={btnGhost}>Cancelar</button>
      </div>
    </div>
  )
}

/* ── Buscador de historial ──────────────────────────────── */
function HistoryPicker({ items, labelFn, subFn, onSelect, onBack }) {
  const [q, setQ] = useState("")
  const sorted = useMemo(() => [...items].sort((a, b) => (b.date || "").localeCompare(a.date || "")), [items])
  const filtered = useMemo(() => {
    const lq = q.trim().toLowerCase()
    if (!lq) return sorted.slice(0, 25)
    return sorted.filter(i => {
      const hay = [labelFn(i), subFn && subFn(i), i.date, String(i.amount)].filter(Boolean).join(" ").toLowerCase()
      return hay.includes(lq)
    }).slice(0, 25)
  }, [sorted, q, labelFn, subFn])

  return (
    <div>
      <div style={{ position: "relative", marginBottom: 12 }}>
        <Search size={14} color={T.muted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        <input
          style={{ ...inp, paddingLeft: 36 }}
          placeholder="Buscar por nombre, proveedor, concepto..."
          value={q}
          onChange={e => setQ(e.target.value)}
          autoFocus
        />
      </div>
      <div style={{ maxHeight: 280, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: T.muted, fontSize: 13, padding: "28px 0" }}>Sin resultados</div>
        ) : filtered.map((item, i) => (
          <button
            key={item.id || i}
            onClick={() => onSelect(item)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "11px 14px", borderRadius: 10, border: `1px solid ${T.border}`,
              background: T.surf2, cursor: "pointer", textAlign: "left", width: "100%",
              transition: "background .1s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = T.surf3}
            onMouseLeave={e => e.currentTarget.style.background = T.surf2}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{labelFn(item)}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{subFn ? subFn(item) : item.date}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text2, fontFamily: "'DM Mono',monospace", marginLeft: 12, flexShrink: 0 }}>
              {fmtS(Number(item.amount))}
            </div>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 14 }}>
        <button onClick={onBack} style={{ ...btnGhost, fontSize: 12, padding: "6px 12px", gap: 6 }}>
          <ArrowLeft size={13} />Volver
        </button>
      </div>
    </div>
  )
}

/* ── Autocomplete de clientes ───────────────────────────── */
function ClientAutocomplete({ value, onChange, clients }) {
  const [open, setOpen] = useState(false)
  const suggestions = useMemo(() => {
    if (!open) return []
    if (value.length === 0) return clients.slice(0, 8)
    return clients.filter(c => c.name.toLowerCase().includes(value.toLowerCase()))
  }, [open, value, clients])

  return (
    <div style={{ position: "relative", marginBottom: 14 }}>
      <label style={lbl}>Cliente</label>
      <input
        style={inp}
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Escribe o selecciona un cliente..."
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: T.surf, border: `1px solid ${T.border}`, borderRadius: 10, zIndex: 50, maxHeight: 220, overflowY: "auto", boxShadow: "0 12px 32px rgba(0,0,0,.15)" }}>
          {suggestions.map(c => (
            <div
              key={c.id}
              onMouseDown={() => { onChange(c.name); setOpen(false) }}
              style={{ padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${T.border}` }}
              onMouseEnter={e => e.currentTarget.style.background = T.surf2}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ width: 28, height: 28, borderRadius: 7, background: T.greenBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.green }}>{c.name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{c.name}</div>
                {c.nit && <div style={{ fontSize: 11, color: T.muted }}>{c.nit}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Modal de ingreso ───────────────────────────────────── */
export function IncomeModal({ initial, onSave, onClose, clients = [], incomes = [] }) {
  const isEdit = Boolean(initial)
  const [mode, setMode] = useState(isEdit ? "form" : "start")
  const [showDoc, setShowDoc] = useState(Boolean(initial?.docTipo || initial?.docNum))
  const [f, setF] = useState(initial || { client: "", project: "", date: today(), amount: "", hasIVA: true, ivaP: 19, status: "Pendiente", method: "Transferencia", notes: "", docTipo: "", docNum: "", docFecha: today(), docNota: "" })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const amt = parseFloat(f.amount) || 0

  const fillFromHistory = item => {
    setF({ ...item, id: undefined, date: today(), amount: item.amount, status: "Pendiente" })
    setMode("form")
  }

  const titleMap = { start: "Nuevo ingreso", history: "Nuevo ingreso · Historial", form: isEdit ? "Editar ingreso" : "Nuevo ingreso" }
  const subMap   = { start: "¿Es nuevo o ya ocurrió antes?", history: "Selecciona para autocompletar", form: "Registra el ingreso en Tres Studio" }

  return (
    <ModalShell title={titleMap[mode]} sub={subMap[mode]} onClose={onClose}>
      {mode === "start" && (
        <StartScreen
          historyCount={incomes.length}
          onNew={() => setMode("form")}
          onFromHistory={() => setMode("history")}
          onClose={onClose}
        />
      )}
      {mode === "history" && (
        <HistoryPicker
          items={incomes}
          labelFn={i => i.client || i.project || "Sin nombre"}
          subFn={i => `${i.date}${i.project ? " · " + i.project : ""}`}
          onSelect={fillFromHistory}
          onBack={() => setMode("start")}
        />
      )}
      {mode === "form" && (
        <>
          <ClientAutocomplete value={f.client} onChange={v => set("client", v)} clients={clients} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
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

          {/* ── Documento soporte DIAN ── */}
          <div style={{ marginTop: 16, borderRadius: 10, border: `1px solid ${T.border}`, overflow: "hidden" }}>
            <button
              onClick={() => setShowDoc(v => !v)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "11px 14px", background: T.surf2, border: "none", cursor: "pointer", textAlign: "left" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>Documento soporte</span>
                {f.docTipo
                  ? <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: T.greenBg, color: T.green, fontWeight: 600 }}>Registrado</span>
                  : <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: T.amberBg, color: T.amber, fontWeight: 600 }}>Opcional — recomendado para deducibles</span>
                }
              </div>
              <span style={{ fontSize: 14, color: T.muted }}>{showDoc ? "▲" : "▼"}</span>
            </button>
            {showDoc && (
              <div style={{ padding: "14px 14px 6px", background: T.surf, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ fontSize: 11, color: T.muted, gridColumn: "1/-1", lineHeight: 1.5, marginBottom: 2 }}>
                  Para gastos deducibles (honorarios, servicios, etc.) el pagador necesita factura electrónica o <strong>Documento Soporte DIAN</strong> (Res. 167/2021).
                </div>
                <div>
                  <label style={lbl}>Tipo de documento</label>
                  <select style={inp} value={f.docTipo} onChange={e => set("docTipo", e.target.value)}>
                    <option value="">— Seleccionar —</option>
                    {DOC_TIPOS_SOPORTE.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Número / Referencia</label>
                  <input style={inp} value={f.docNum} onChange={e => set("docNum", e.target.value)} placeholder="FE-0001 / DS-2024-001" />
                </div>
                <div>
                  <label style={lbl}>Fecha del documento</label>
                  <input style={inp} type="date" value={f.docFecha} onChange={e => set("docFecha", e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>Observación</label>
                  <input style={inp} value={f.docNota} onChange={e => set("docNota", e.target.value)} placeholder="Ej: Honorarios diseño marca" />
                </div>
              </div>
            )}
          </div>

          <CalcBar amount={amt} hasIVA={f.hasIVA} ivaP={f.ivaP} colorTotal={T.green} />
          <div style={{ display: "flex", gap: 10, marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.border}`, justifyContent: "flex-end", alignItems: "center" }}>
            {!isEdit && <button onClick={() => setMode("start")} style={{ ...btnGhost, fontSize: 12, padding: "6px 12px", gap: 5, marginRight: "auto" }}><ArrowLeft size={13} />Volver</button>}
            <button onClick={onClose} style={btnGhost}>Cancelar</button>
            <button onClick={() => onSave({ ...f, id: f.id || uid(), amount: parseFloat(f.amount) || 0 })} style={btnGreen}>
              <CheckCircle size={14} />{isEdit ? "Actualizar" : "Guardar ingreso"}
            </button>
          </div>
        </>
      )}
    </ModalShell>
  )
}

/* ── Modal de egreso ────────────────────────────────────── */
export function ExpenseModal({ initial, onSave, onClose, expenses = [] }) {
  const isEdit = Boolean(initial)
  const [mode, setMode] = useState(isEdit ? "form" : "start")
  const [f, setF] = useState(initial || { date: today(), cat: "Software y suscripciones", sub: "", desc: "", provider: "", amount: "", hasIVA: false, ivaP: 19, method: "Transferencia", obs: "" })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const amt = parseFloat(f.amount) || 0

  const fillFromHistory = item => {
    setF({ ...item, id: undefined, date: today() })
    setMode("form")
  }

  const titleMap = { start: "Nuevo egreso", history: "Nuevo egreso · Historial", form: isEdit ? "Editar egreso" : "Nuevo egreso" }
  const subMap   = { start: "¿Es nuevo o ya ocurrió antes?", history: "Selecciona para autocompletar", form: "Registra el gasto en Tres Studio" }

  return (
    <ModalShell title={titleMap[mode]} sub={subMap[mode]} onClose={onClose}>
      {mode === "start" && (
        <StartScreen
          historyCount={expenses.length}
          onNew={() => setMode("form")}
          onFromHistory={() => setMode("history")}
          onClose={onClose}
        />
      )}
      {mode === "history" && (
        <HistoryPicker
          items={expenses}
          labelFn={i => i.provider || i.sub || i.desc || i.cat || "Sin nombre"}
          subFn={i => `${i.date} · ${i.cat}`}
          onSelect={fillFromHistory}
          onBack={() => setMode("start")}
        />
      )}
      {mode === "form" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={lbl}>Fecha</label><input style={inp} type="date" value={f.date} onChange={e => set("date", e.target.value)} /></div>
            <div>
              <label style={lbl}>Categoría</label>
              <select style={inp} value={f.cat} onChange={e => set("cat", e.target.value)}>
                {EXP_CATS.map(c => <option key={c}>{c}</option>)}
              </select>
              {(() => {
                const rule = DIAN_DEDUCIBLES[f.cat] || DIAN_DEDUCIBLES["Otros"]
                return (
                  <div style={{ marginTop: 6, fontSize: 11, padding: "5px 10px", borderRadius: 7, background: rule.color + "12", borderLeft: `3px solid ${rule.color}`, color: rule.color, lineHeight: 1.5 }}>
                    <strong>{rule.label}</strong> — {rule.nota}
                  </div>
                )
              })()}
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
          <div style={{ display: "flex", gap: 10, marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.border}`, justifyContent: "flex-end", alignItems: "center" }}>
            {!isEdit && <button onClick={() => setMode("start")} style={{ ...btnGhost, fontSize: 12, padding: "6px 12px", gap: 5, marginRight: "auto" }}><ArrowLeft size={13} />Volver</button>}
            <button onClick={onClose} style={btnGhost}>Cancelar</button>
            <button onClick={() => onSave({ ...f, id: f.id || uid(), amount: parseFloat(f.amount) || 0 })} style={btnRed}>
              <CheckCircle size={14} />{isEdit ? "Actualizar" : "Guardar egreso"}
            </button>
          </div>
        </>
      )}
    </ModalShell>
  )
}

/* ── Modal de recurrente ────────────────────────────────── */
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
      <div style={{ display: "flex", gap: 10, marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.border}`, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={btnGhost}>Cancelar</button>
        <button onClick={() => onSave({ ...f, id: f.id || uid(), amount: parseFloat(f.amount) || 0 })} style={btnRed}>
          <CheckCircle size={14} />{initial ? "Actualizar" : "Guardar recurrente"}
        </button>
      </div>
    </ModalShell>
  )
}

/* ── Modal de cliente ───────────────────────────────────── */
export function ClientModalWrapper({ initial, onSave, onClose }) {
  const [f, setF] = useState(initial || { name: "", nit: "", email: "", phone: "", contacto: "", notas: "" })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  return (
    <ModalShell title={initial ? "Editar cliente" : "Nuevo cliente"} sub="Información del cliente" onClose={onClose}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <div style={{ gridColumn:"1/-1" }}><label style={lbl}>Nombre / Razón social *</label><input style={inp} value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Bancolombia S.A." /></div>
        <div><label style={lbl}>NIT / Cédula</label><input style={inp} value={f.nit} onChange={e=>set("nit",e.target.value)} placeholder="900.123.456-7" /></div>
        <div><label style={lbl}>Contacto</label><input style={inp} value={f.contacto} onChange={e=>set("contacto",e.target.value)} placeholder="Nombre del contacto" /></div>
        <div><label style={lbl}>Email</label><input style={inp} type="email" value={f.email} onChange={e=>set("email",e.target.value)} placeholder="contacto@empresa.com" /></div>
        <div><label style={lbl}>Teléfono</label><input style={inp} value={f.phone} onChange={e=>set("phone",e.target.value)} placeholder="+57 300 123 4567" /></div>
        <div style={{ gridColumn:"1/-1" }}><label style={lbl}>Notas</label><input style={inp} value={f.notas} onChange={e=>set("notas",e.target.value)} placeholder="Información adicional..." /></div>
      </div>
      <div style={{ display:"flex", gap:10, marginTop:24, paddingTop:20, borderTop:`1px solid ${T.border}`, justifyContent:"flex-end" }}>
        <button onClick={onClose} style={btnGhost}>Cancelar</button>
        <button onClick={() => { if(f.name.trim()) onSave({...f, id:f.id||uid()}) }} style={btnGreen}>
          <CheckCircle size={14} />{initial ? "Actualizar" : "Guardar cliente"}
        </button>
      </div>
    </ModalShell>
  )
}
