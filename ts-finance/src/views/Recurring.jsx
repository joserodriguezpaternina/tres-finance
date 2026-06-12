import { useState } from 'react'
import { Plus, Edit2, Trash2, RefreshCw, PauseCircle, PlayCircle, Zap, MoreVertical } from 'lucide-react'
import { T, fmtS, getIVA, getBase, freqMult } from '../constants.js'
import { card, btnPrimary, ICON_MAP } from '../ui.jsx'

function ServiceIcon({ icon, name }) {
  const cfg = ICON_MAP[icon] || ICON_MAP.default
  return (
    <div style={{ width: 48, height: 48, borderRadius: 12, background: cfg.bg, border: `1px solid ${cfg.color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: cfg.color, fontFamily: "inherit" }}>{cfg.label}</span>
    </div>
  )
}

function StatusBadge({ active }) {
  if (active) return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 999, background: "rgba(30,158,90,.12)", color: "#1E9E5A", fontSize: 12, fontWeight: 600 }}>
      Activo
    </span>
  )
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 999, background: "rgba(224,160,48,.14)", color: "#D97706", fontSize: 12, fontWeight: 600 }}>
      Pausado
    </span>
  )
}

export default function RecurringView({ recurring, expenses = [], onAdd, onEdit, onDelete, onToggle }) {
  const [filter, setFilter] = useState("all")
  const [openMenu, setOpenMenu] = useState(null)

  const active = recurring.filter(r => r.active)
  const paused = recurring.filter(r => !r.active)
  const filtered = filter === "active" ? active : filter === "paused" ? paused : recurring

  const monthlyTotal = active.reduce((s, r) => s + Number(r.amount) * freqMult(r.freq), 0)
  const monthlyIVA   = active.reduce((s, r) => s + getIVA(r) * freqMult(r.freq), 0)
  const monthlyBase  = monthlyTotal - monthlyIVA

  const today = new Date().getDate()
  const upcoming = active.filter(r => r.freq === "Mensual" && r.day >= today).sort((a, b) => a.day - b.day).slice(0, 5)

  const catBreakdown = Object.entries(
    active.reduce((acc, r) => { acc[r.cat] = (acc[r.cat] || 0) + Number(r.amount) * freqMult(r.freq); return acc }, {})
  ).sort((a, b) => b[1] - a[1])

  const mainCat = catBreakdown[0]
  const mainCatPct = mainCat ? Math.round((mainCat[1] / monthlyTotal) * 100) : 0

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div className="page-hdr">
        <div>
          <div className="page-title">Suscripciones y Pagos Recurrentes</div>
          <div className="page-sub">Gestiona tus herramientas y servicios automatizados.</div>
        </div>
        <button onClick={onAdd} style={{ ...btnPrimary, padding: "10px 20px", fontSize: 14 }}>
          <Plus size={15} />
          Nueva Suscripción
        </button>
      </div>

      {/* Summary cards — Stitch bento style */}
      <div className="g3">
        {[
          {
            icon: "💳",
            label: "Total Mensual",
            value: fmtS(monthlyTotal),
            sub: monthlyIVA > 0 ? `Base ${fmtS(monthlyBase)} · IVA ${fmtS(monthlyIVA)}` : "Sin IVA",
            trend: null,
          },
          {
            icon: "🔄",
            label: "Suscripciones Activas",
            value: `${active.length}`,
            sub: upcoming.length > 0 ? `${upcoming.length} pago${upcoming.length > 1 ? "s" : ""} próximo${upcoming.length > 1 ? "s" : ""} en 7 días` : "Sin cobros próximos",
            trend: null,
          },
          {
            icon: "📊",
            label: "Categoría Principal",
            value: mainCat ? mainCat[0] : "—",
            sub: mainCat ? `Representa el ${mainCatPct}% del gasto` : "Sin datos",
            trend: null,
          },
        ].map(({ icon, label, value, sub }) => (
          <div key={label} style={{ ...card, display: "flex", flexDirection: "column", justifyContent: "space-between", cursor: "default", transition: "background .2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--surf2)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--surf)"}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: ".07em" }}>{label}</span>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: T.text, letterSpacing: "-.5px", fontFamily: "'DM Mono',monospace" }}>{value}</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Subscriptions list */}
      <div style={{ background: "var(--surf)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>
        {/* Table header */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(244,245,241,.6)" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.text, textTransform: "uppercase", letterSpacing: ".05em" }}>Detalle de Suscripciones</span>
          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            {[["all", "Todos"], ["active", "Activos"], ["paused", "Pausados"]].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)} style={{
                padding: "5px 12px", borderRadius: 999,
                border: "1px solid",
                borderColor: filter === val ? "#062F28" : "var(--border)",
                fontSize: 12, fontWeight: filter === val ? 700 : 400, cursor: "pointer",
                background: filter === val ? "#062F28" : "transparent",
                color: filter === val ? "#FFFFFF" : T.muted,
                fontFamily: "inherit", transition: "all .15s",
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 24px", color: T.muted, fontSize: 14 }}>
              No hay suscripciones. Agrega la primera.
            </div>
          )}
          {filtered.map((r, idx) => {
            const ivaAmt = getIVA(r)
            const base   = getBase(r)
            const monthlyEq = Number(r.amount) * freqMult(r.freq)
            const expCount = expenses.filter(e => e.recurringId === r.id || (e.obs && e.obs.includes(r.id))).length
            const isLast = idx === filtered.length - 1

            return (
              <div
                key={r.id}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px 24px",
                  borderBottom: isLast ? "none" : "1px solid var(--border)",
                  opacity: r.active ? 1 : 0.6,
                  transition: "background .2s",
                  background: "transparent",
                  position: "relative",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--surf2)"}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; setOpenMenu(null) }}
              >
                {/* Left: icon + name */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
                  <ServiceIcon icon={r.icon} name={r.name} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                      {r.cat}
                      {expCount > 0 && <span style={{ marginLeft: 8, color: T.green, fontWeight: 600 }}>· {expCount} egreso{expCount > 1 ? "s" : ""}</span>}
                    </div>
                  </div>
                </div>

                {/* Right: amount + freq + next day + status + actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                  {/* Amount */}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text, fontFamily: "'DM Mono',monospace" }}>{fmtS(r.amount)}</div>
                    <div style={{ fontSize: 11, color: T.muted }}>
                      {r.freq}
                      {r.freq !== "Mensual" && <span style={{ color: T.subtle }}> · ≈{fmtS(monthlyEq)}/mes</span>}
                    </div>
                  </div>

                  {/* Next payment */}
                  <div className="col-hide-mobile" style={{ textAlign: "right", width: 110 }}>
                    <div style={{ fontSize: 14, color: T.text }}>Día {r.day}</div>
                    <div style={{ fontSize: 11, color: T.muted }}>Próximo pago</div>
                  </div>

                  {/* Status */}
                  <div style={{ width: 80, display: "flex", justifyContent: "flex-end" }}>
                    <StatusBadge active={r.active} />
                  </div>

                  {/* Context menu */}
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => setOpenMenu(openMenu === r.id ? null : r.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex", padding: 4, borderRadius: 8 }}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openMenu === r.id && (
                      <div style={{
                        position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 50,
                        background: "var(--surf)", border: "1px solid var(--border)", borderRadius: 12,
                        padding: "6px", minWidth: 160,
                        boxShadow: "0 8px 24px rgba(0,0,0,.1)",
                      }}>
                        <button onClick={() => { onToggle(r.id); setOpenMenu(null) }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", border: "none", background: "none", cursor: "pointer", fontSize: 13, color: T.text, borderRadius: 8, fontFamily: "inherit", textAlign: "left" }}>
                          {r.active ? <PauseCircle size={14} color={T.amber} /> : <PlayCircle size={14} color={T.green} />}
                          {r.active ? "Pausar" : "Activar"}
                        </button>
                        <button onClick={() => { onEdit(r); setOpenMenu(null) }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", border: "none", background: "none", cursor: "pointer", fontSize: 13, color: T.text, borderRadius: 8, fontFamily: "inherit", textAlign: "left" }}>
                          <Edit2 size={14} color={T.blue} />
                          Editar
                        </button>
                        <button onClick={() => { onDelete(r.id); setOpenMenu(null) }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", border: "none", background: "none", cursor: "pointer", fontSize: 13, color: T.red, borderRadius: 8, fontFamily: "inherit", textAlign: "left" }}>
                          <Trash2 size={14} color={T.red} />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom row: upcoming + breakdown */}
      {(upcoming.length > 0 || catBreakdown.length > 0) && (
        <div className="g2">
          {/* Upcoming */}
          <div style={{ ...card }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Zap size={14} color={T.amber} />
              <span style={{ fontSize: 12, fontWeight: 700, color: T.text, textTransform: "uppercase", letterSpacing: ".06em" }}>Próximos cobros este mes</span>
            </div>
            {upcoming.length === 0 ? (
              <div style={{ color: T.muted, fontSize: 13, textAlign: "center", padding: "16px 0" }}>Sin cobros pendientes</div>
            ) : upcoming.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < upcoming.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: T.surf2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: T.amber, fontFamily: "'DM Mono',monospace" }}>{r.day}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{r.freq}</div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.red, fontFamily: "'DM Mono',monospace" }}>{fmtS(r.amount)}</span>
              </div>
            ))}
          </div>

          {/* Category breakdown */}
          <div style={{ ...card }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 16 }}>Gasto por categoría</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {catBreakdown.map(([cat, val]) => {
                const pct = monthlyTotal > 0 ? Math.round((val / monthlyTotal) * 100) : 0
                return (
                  <div key={cat}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: T.text2 }}>{cat}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: T.muted }}>{pct}%</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.red, fontFamily: "'DM Mono',monospace" }}>{fmtS(val)}</span>
                      </div>
                    </div>
                    <div style={{ height: 3, background: "var(--surf3)", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#062F28", borderRadius: 999, transition: "width .4s" }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
