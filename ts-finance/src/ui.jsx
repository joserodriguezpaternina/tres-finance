import { T } from './constants.js'
import { fmtS } from './constants.js'

/* ── Base styles ─────────────────────────────────────── */
export const card = {
  background: T.surf, borderRadius: 14,
  border: `1px solid ${T.border}`, padding: "20px 22px",
}
export const inp = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: `1.5px solid ${T.border}`, fontSize: 13, color: T.text,
  outline: "none", background: T.surf2, boxSizing: "border-box",
  fontFamily: "'Inter', sans-serif", transition: "border-color .15s",
}
export const lbl = {
  display: "block", fontSize: 11, fontWeight: 700, color: T.subtle,
  marginBottom: 6, textTransform: "uppercase", letterSpacing: ".7px",
}
export const btnGreen = {
  background: T.green, color: "#000", border: "none", borderRadius: 10,
  padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer",
  display: "flex", alignItems: "center", gap: 6, fontFamily: "'Inter',sans-serif",
  transition: "opacity .15s",
}
export const btnRed = { ...btnGreen, background: T.red, color: "#fff" }
export const btnGhost = {
  ...btnGreen, background: "transparent", color: T.text2,
  border: `1px solid ${T.border}`,
}

/* ── KPI Card ────────────────────────────────────────── */
export function KPI({ title, value, sub, icon: Icon, color, badge }) {
  return (
    <div style={{ ...card, position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: -20, right: -20, width: 90, height: 90,
        borderRadius: "50%", background: color + "10", pointerEvents: "none"
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: T.subtle, textTransform: "uppercase", letterSpacing: ".8px" }}>
          {title}
        </span>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={15} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: T.white, letterSpacing: "-1.5px", fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
        {sub && <span style={{ fontSize: 12, color: T.muted }}>{sub}</span>}
        {badge && (
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: badge.bg, color: badge.color }}>
            {badge.label}
          </span>
        )}
      </div>
    </div>
  )
}

/* ── Status pill ─────────────────────────────────────── */
export function Pill({ s }) {
  const styles = {
    Pagado:   { bg: T.greenBg,  c: T.green },
    Pendiente:{ bg: T.amberBg,  c: T.amber },
    Parcial:  { bg: T.blueBg,   c: T.blue  },
  }
  const st = styles[s] || styles.Pendiente
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: st.bg, color: st.c, letterSpacing: ".2px" }}>
      {s}
    </span>
  )
}

/* ── Chart tooltip ───────────────────────────────────── */
export function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: T.surf2, borderRadius: 10, padding: "10px 14px", border: `1px solid ${T.border}`, boxShadow: "0 12px 32px rgba(0,0,0,.5)" }}>
      <div style={{ color: T.subtle, fontSize: 11, marginBottom: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: T.white, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 7, fontFamily: "'DM Mono',monospace" }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: "inline-block" }} />
          {p.name}: {fmtS(p.value)}
        </div>
      ))}
    </div>
  )
}

/* ── Divider ─────────────────────────────────────────── */
export const Div = () => <div style={{ height: 1, background: T.border, margin: "4px 0" }} />

/* ── Icon map for recurring ──────────────────────────── */
export const ICON_MAP = {
  adobe:   { label: "Ae", color: "#FF0000", bg: "#1a0000" },
  figma:   { label: "Fi", color: "#A259FF", bg: "#1a0a2e" },
  slack:   { label: "Sl", color: "#E01E5A", bg: "#1a0010" },
  google:  { label: "G",  color: "#4285F4", bg: "#0a1020" },
  notion:  { label: "No", color: "#FFFFFF", bg: "#1a1a1a" },
  loom:    { label: "Lo", color: "#625DF5", bg: "#0a0a1a" },
  office:  { label: "Of", color: T.amber,   bg: T.amberBg },
  wifi:    { label: "Wi", color: T.blue,    bg: T.blueBg  },
  globe:   { label: "Gl", color: T.green,   bg: T.greenBg },
  spotify: { label: "Sp", color: "#1DB954", bg: "#0a1a0a" },
  default: { label: "⬡",  color: T.text2,   bg: T.surf3   },
}
