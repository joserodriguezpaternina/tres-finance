import { useMemo, useState } from 'react'
import {
  ShieldCheck, Plus, Edit2, Trash2, CheckCircle2, Settings, Upload,
  Search, FileDown,
} from 'lucide-react'
import { T, MONTHS_SHORT } from '../constants.js'
import { card, inp, btnGhost, btnSmall, EmptyState } from '../ui.jsx'
import { getAudit, clearAudit } from '../audit.js'

/* ── Config por acción ──────────────────────────────────────────────────── */

const ACTION_META = {
  crear:    { icon: Plus,         color: T.green,  bg: T.greenBg  },
  editar:   { icon: Edit2,        color: T.blue,   bg: T.blueBg   },
  eliminar: { icon: Trash2,       color: T.red,    bg: T.redBg    },
  pagar:    { icon: CheckCircle2, color: T.green,  bg: T.greenBg  },
  config:   { icon: Settings,     color: T.muted,  bg: T.surf2    },
  importar: { icon: Upload,       color: T.violet, bg: T.violetBg },
}
const DEFAULT_META = { icon: Settings, color: T.muted, bg: T.surf2 }
const ACTION_CHIPS = ["Todas", "crear", "editar", "eliminar", "pagar", "config", "importar"]

/* ── Helpers de tiempo ──────────────────────────────────────────────────── */

const dayKey = d => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

function fmtDateShort(d) {
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()].toLowerCase()} ${d.getFullYear()}`
}

/* "hace 5 min" · "hace 2 h" · "ayer" · "12 jun 2026" */
function relTime(iso, now = new Date()) {
  const d = new Date(iso)
  const diff = now - d
  if (diff < 60_000) return "hace un momento"
  if (diff < 3_600_000) return `hace ${Math.floor(diff / 60_000)} min`
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today - 86_400_000)
  if (d >= today) return `hace ${Math.floor(diff / 3_600_000)} h`
  if (d >= yesterday) return "ayer"
  return fmtDateShort(d)
}

function dayLabel(d, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today - 86_400_000)
  if (dayKey(d) === dayKey(today)) return "Hoy"
  if (dayKey(d) === dayKey(yesterday)) return "Ayer"
  return fmtDateShort(d)
}

function fmtExact(iso) {
  const d = new Date(iso)
  return d.toLocaleString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

/* ── Sub-componentes ────────────────────────────────────────────────────── */

function MicroLabel({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".07em", color: T.muted }}>
      {children}
    </div>
  )
}

function HeaderStat({ label, value, sub }) {
  return (
    <div style={{ flex: "1 1 0", minWidth: 0, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 5 }}>
      <MicroLabel>{label}</MicroLabel>
      <div style={{ fontSize: 20, fontWeight: 700, color: T.text, fontFamily: "'DM Mono',monospace", letterSpacing: "-.3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: T.muted }}>{sub}</div>}
    </div>
  )
}

function EventRow({ ev, last, now }) {
  const meta = ACTION_META[ev.action] || DEFAULT_META
  const Icon = meta.icon
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 12,
      padding: "12px 0",
      borderBottom: last ? "none" : `1px solid ${T.border}`,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={14} color={meta.color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: T.text, lineHeight: 1.4 }}>
          <span style={{ fontWeight: 700, textTransform: "capitalize" }}>{ev.action}</span>
          <span style={{ fontWeight: 700, color: T.text2 }}> · {ev.entity}</span>
        </div>
        {ev.detail && (
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {ev.detail}
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
        <span title={fmtExact(ev.ts)} style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Mono',monospace", cursor: "default" }}>
          {relTime(ev.ts, now)}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
          background: T.surf2, color: T.subtle, whiteSpace: "nowrap",
        }}>
          {ev.user || "José Studio"}
        </span>
      </div>
    </div>
  )
}

/* ── Vista principal ────────────────────────────────────────────────────── */

export default function AuditoriaView() {
  const [events, setEvents] = useState(() => getAudit())
  const [actionF, setActionF] = useState("Todas")
  const [entityF, setEntityF] = useState("Todas")
  const [query, setQuery] = useState("")

  const now = new Date()

  /* Estadísticas de cabecera */
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(today - 6 * 86_400_000)
  const countToday = events.filter(e => new Date(e.ts) >= today).length
  const countWeek = events.filter(e => new Date(e.ts) >= weekStart).length
  const lastEvent = events[0]

  /* Entidades únicas para el filtro */
  const entities = useMemo(() =>
    [...new Set(events.map(e => e.entity).filter(Boolean))].sort(),
    [events])

  /* Filtrado */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return events.filter(e =>
      (actionF === "Todas" || e.action === actionF) &&
      (entityF === "Todas" || e.entity === entityF) &&
      (!q || `${e.detail || ""} ${e.entity || ""} ${e.action || ""}`.toLowerCase().includes(q))
    )
  }, [events, actionF, entityF, query])

  /* Agrupación por día (eventos ya vienen newest first) */
  const groups = useMemo(() => {
    const out = []
    let cur = null
    filtered.forEach(ev => {
      const d = new Date(ev.ts)
      const k = dayKey(d)
      if (!cur || cur.key !== k) { cur = { key: k, label: dayLabel(d, now), items: [] }; out.push(cur) }
      cur.items.push(ev)
    })
    return out
  }, [filtered]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Acciones */
  const exportCSV = () => {
    const head = "Fecha;Hora;Usuario;Acción;Entidad;Detalle"
    const lines = events.map(e => {
      const d = new Date(e.ts)
      const clean = s => String(s || "").replace(/;/g, ",").replace(/\r?\n/g, " ")
      return [
        d.toLocaleDateString("es-CO"), d.toLocaleTimeString("es-CO"),
        clean(e.user), clean(e.action), clean(e.entity), clean(e.detail),
      ].join(";")
    })
    const blob = new Blob(["﻿" + [head, ...lines].join("\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `auditoria_tres_${now.toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    if (window.confirm("¿Limpiar todo el registro de auditoría? Esta acción no se puede deshacer.")) {
      clearAudit()
      setEvents([])
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Cabecera de estadísticas ─────────────────────────────────── */}
      <div style={{ ...card, padding: 0, display: "flex", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        {[
          { label: "Total eventos", value: events.length, sub: "registro local" },
          { label: "Hoy", value: countToday, sub: dayLabel(today, now) === "Hoy" ? fmtDateShort(today) : undefined },
          { label: "Esta semana", value: countWeek, sub: "últimos 7 días" },
          { label: "Último evento", value: lastEvent ? relTime(lastEvent.ts, now) : "—", sub: lastEvent ? `${lastEvent.action} · ${lastEvent.entity}` : "sin actividad" },
        ].map((s, i, arr) => (
          <div key={s.label} style={{ display: "flex", flex: "1 1 0", minWidth: 150, borderRight: i < arr.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <HeaderStat {...s} />
          </div>
        ))}
      </div>

      {/* ── Filtros + acciones ───────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {ACTION_CHIPS.map(a => {
            const active = actionF === a
            const m = ACTION_META[a]
            return (
              <button
                key={a}
                onClick={() => setActionF(a)}
                style={{
                  padding: "6px 13px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                  fontFamily: "inherit", cursor: "pointer", textTransform: "capitalize",
                  border: `1px solid ${active ? (m ? m.color : T.text) : T.border}`,
                  background: active ? (m ? m.bg : T.surf2) : T.surf,
                  color: active ? (m ? m.color : T.text) : T.subtle,
                  transition: "all .12s",
                }}
              >
                {a}
              </button>
            )
          })}
        </div>

        <select
          value={entityF}
          onChange={e => setEntityF(e.target.value)}
          style={{ ...inp, width: "auto", padding: "7px 10px", fontSize: 12, color: T.text2 }}
        >
          <option value="Todas">Todas las entidades</option>
          {entities.map(e => <option key={e} value={e}>{e}</option>)}
        </select>

        <div style={{ position: "relative", flex: "1 1 180px", minWidth: 160, maxWidth: 280 }}>
          <Search size={13} color={T.muted} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar en el detalle…"
            style={{ ...inp, padding: "8px 12px 8px 32px", fontSize: 12, background: T.surf, color: T.text }}
          />
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={exportCSV} disabled={!events.length} style={{ ...btnGhost, ...btnSmall, background: T.surf, color: T.subtle, opacity: events.length ? 1 : .5 }}>
            <FileDown size={13} /> Exportar CSV
          </button>
          <button onClick={handleClear} disabled={!events.length} style={{ ...btnGhost, ...btnSmall, background: T.surf, color: T.red, opacity: events.length ? 1 : .5 }}>
            <Trash2 size={13} /> Limpiar registro
          </button>
        </div>
      </div>

      {/* ── Línea de tiempo ──────────────────────────────────────────── */}
      <div style={{ ...card, paddingTop: 8, paddingBottom: 8 }}>
        {groups.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="Sin actividad registrada"
            sub="Las operaciones del sistema aparecerán aquí."
          />
        ) : (
          groups.map(g => (
            <div key={g.key}>
              <div style={{
                position: "sticky", top: 0, zIndex: 2,
                background: T.surf, padding: "12px 0 8px",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".07em", color: T.muted, whiteSpace: "nowrap" }}>
                  {g.label}
                </span>
                <span style={{ fontSize: 10, fontWeight: 600, color: T.subtle, fontFamily: "'DM Mono',monospace" }}>
                  {g.items.length}
                </span>
                <div style={{ flex: 1, height: 1, background: T.border }} />
              </div>
              {g.items.map((ev, i) => (
                <EventRow key={ev.id || i} ev={ev} last={i === g.items.length - 1} now={now} />
              ))}
            </div>
          ))
        )}
      </div>

    </div>
  )
}
