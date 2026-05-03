import { useState } from 'react'
import { Plus, Edit2, Trash2, RefreshCw, PauseCircle, PlayCircle, Zap } from 'lucide-react'
import { T, fmtS, fmt, getIVA, getBase, freqMult } from '../constants.js'
import { card, btnRed, ICON_MAP } from '../ui.jsx'

function SoftIcon({ icon }) {
  const cfg = ICON_MAP[icon] || ICON_MAP.default
  return (
    <div style={{ width: 36, height: 36, borderRadius: 10, background: cfg.bg, border: `1px solid ${cfg.color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: 12, fontWeight: 800, color: cfg.color, fontFamily: "'Inter',sans-serif" }}>{cfg.label}</span>
    </div>
  )
}

export default function RecurringView({ recurring, expenses = [], onAdd, onEdit, onDelete, onToggle }) {
  const [filter, setFilter] = useState("all") // all | active | paused

  const active = recurring.filter(r => r.active)
  const paused = recurring.filter(r => !r.active)
  const filtered = filter === "active" ? active : filter === "paused" ? paused : recurring

  // Monthly equivalent cost
  const monthlyTotal = active.reduce((s, r) => s + Number(r.amount) * freqMult(r.freq), 0)
  const monthlyIVA   = active.reduce((s, r) => s + getIVA(r) * freqMult(r.freq), 0)
  const monthlyBase  = monthlyTotal - monthlyIVA

  // Next payments this month (day of month)
  const today = new Date().getDate()
  const upcoming = active.filter(r => r.freq === "Mensual" && r.day >= today).sort((a, b) => a.day - b.day).slice(0, 5)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: T.white, fontFamily: "'Inter',sans-serif" }}>Gastos recurrentes</h2>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: T.muted }}>Suscripciones, software y pagos fijos</p>
        </div>
        <button onClick={onAdd} style={btnRed}><Plus size={14} />Agregar</button>
      </div>

      {/* Summary cards */}
      <div className="g4">
        {[
          { label: "Costo mensual equivalente", val: fmtS(monthlyTotal), color: T.red },
          { label: "Base sin IVA", val: fmtS(monthlyBase), color: T.text },
          { label: "IVA mensual estimado", val: fmtS(monthlyIVA), color: T.amber },
          { label: "Suscripciones activas", val: `${active.length}`, color: T.green },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ ...card, padding: "16px 18px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.subtle, textTransform: "uppercase", letterSpacing: ".7px", marginBottom: 10 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'DM Mono',monospace", letterSpacing: "-1px" }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14 }}>
        {/* Main list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 6 }}>
            {[["all", "Todos"], ["active", "Activos"], ["paused", "Pausados"]].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)} style={{ padding: "7px 14px", borderRadius: 8, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", background: filter === val ? T.red : T.surf2, color: filter === val ? "#fff" : T.muted, fontFamily: "'Inter',sans-serif" }}>
                {label} {val === "all" ? `(${recurring.length})` : val === "active" ? `(${active.length})` : `(${paused.length})`}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map(r => {
              const ivaAmt = getIVA(r)
              const base = getBase(r)
              const monthlyEq = Number(r.amount) * freqMult(r.freq)
              return (
                <div key={r.id} style={{ ...card, padding: "16px 18px", opacity: r.active ? 1 : 0.55, transition: "opacity .2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <SoftIcon icon={r.icon} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: T.white }}>{r.name}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: T.surf2, color: T.muted, border: `1px solid ${T.border}` }}>{r.freq}</span>
                        {!r.active && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: T.amberBg, color: T.amber }}>Pausado</span>}
                        {(() => { const n = expenses.filter(e => e.recurringId === r.id || (e.obs && e.obs.includes(r.id))).length; return n > 0 ? (
                          <span title={`${n} egreso${n>1?'s':''} generado${n>1?'s':''} automáticamente`} style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: "rgba(139,92,246,.15)", color: "#8B5CF6", border: "1px solid rgba(139,92,246,.25)", display:"flex", alignItems:"center", gap:3 }}>
                            <RefreshCw size={8} />{n} egreso{n>1?'s':''}
                          </span>
                        ) : null })()}
                      </div>
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                        {r.cat} · Día {r.day} · {r.method}
                        {r.notes && <span> · {r.notes}</span>}
                      </div>
                    </div>

                    {/* Amounts */}
                    <div style={{ textAlign: "right", marginRight: 14 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: r.active ? T.red : T.muted, fontFamily: "'DM Mono',monospace" }}>{fmtS(r.amount)}</div>
                      <div style={{ fontSize: 11, color: T.muted }}>
                        Base {fmtS(base)} {r.hasIVA && `· IVA ${fmtS(ivaAmt)}`}
                      </div>
                      {r.freq !== "Mensual" && (
                        <div style={{ fontSize: 10, color: T.subtle, marginTop: 2 }}>
                          ≈ {fmtS(monthlyEq)}/mes
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => onToggle(r.id)} title={r.active ? "Pausar" : "Activar"} style={{ background: r.active ? T.amberBg : T.greenBg, border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer" }}>
                        {r.active ? <PauseCircle size={13} color={T.amber} /> : <PlayCircle size={13} color={T.green} />}
                      </button>
                      <button onClick={() => onEdit(r)} style={{ background: T.blueBg, border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer" }}><Edit2 size={13} color={T.blue} /></button>
                      <button onClick={() => onDelete(r.id)} style={{ background: T.redBg, border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer" }}><Trash2 size={13} color={T.red} /></button>
                    </div>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div style={{ ...card, textAlign: "center", padding: "48px", color: T.muted, fontSize: 13 }}>
                No hay gastos recurrentes. Agrega el primero.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: upcoming */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Zap size={13} color={T.amber} />
              <span style={{ fontSize: 12, fontWeight: 700, color: T.text, textTransform: "uppercase", letterSpacing: ".5px" }}>Próximos cobros</span>
            </div>
            {upcoming.length === 0 ? (
              <div style={{ color: T.muted, fontSize: 12, textAlign: "center", padding: "16px 0" }}>Sin cobros pendientes</div>
            ) : upcoming.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < upcoming.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: T.surf2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: T.amber, fontFamily: "'DM Mono',monospace" }}>{r.day}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.white }}>{r.name}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.red, fontFamily: "'DM Mono',monospace" }}>{fmtS(r.amount)}</span>
              </div>
            ))}
          </div>

          <div style={card}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 12 }}>Resumen activos</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(active.reduce((acc, r) => {
                acc[r.cat] = (acc[r.cat] || 0) + Number(r.amount) * freqMult(r.freq)
                return acc
              }, {})).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
                <div key={cat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: T.text2 }}>{cat}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.red, fontFamily: "'DM Mono',monospace" }}>{fmtS(val)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
