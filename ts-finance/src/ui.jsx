import { T } from './constants.js'
import { fmtS } from './constants.js'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

/* ── Card styles ──────────────────────────────────────────────────────── */
export const card = {
  background: "var(--surf)",
  borderRadius: 14,
  border: "1px solid var(--border)",
  padding: "20px 22px",
}
export const cardFlat = {
  background: T.surf2,
  borderRadius: 10,
  border: `1px solid ${T.border}`,
  padding: "12px 16px",
}

/* ── Form primitives ─────────────────────────────────────────────────── */
export const inp = {
  width:"100%", padding:"10px 13px", borderRadius:10,
  border:`1px solid ${T.border}`, fontSize:13, color:T.text,
  outline:"none", background:"var(--surf)", boxSizing:"border-box",
  fontFamily:"inherit", transition:"border-color .15s, box-shadow .15s",
}
export const lbl = {
  display:"block", fontSize:10, fontWeight:600, color:T.muted,
  marginBottom:5, textTransform:"uppercase", letterSpacing:".07em",
}

/* ── Buttons ─────────────────────────────────────────────────────────── */
export const btnPrimary = {
  background: T.accent, color: "#FFFFFF", border: "none",
  borderRadius: 9, padding: "9px 18px", fontSize: 12,
  fontWeight: 600, cursor: "pointer", display: "flex",
  alignItems: "center", gap: 6, fontFamily: "inherit",
}
export const btnGreen  = { ...btnPrimary }
export const btnLime   = { ...btnPrimary, background: T.lime, color: T.limeText }
export const btnRed    = { ...btnPrimary, background: "var(--surf)", color: T.red, border: `1px solid ${T.border}` }
export const btnGhost  = { ...btnPrimary, background: "var(--surf)", color: T.subtle, border: `1px solid ${T.border}` }
export const btnSmall  = { ...btnPrimary, padding: "6px 12px", fontSize: 11 }

/* ── Semantic theme map ──────────────────────────────────────────────── */
const THEME = {
  green:   { bg:T.greenBg,   accent:T.green,   light:T.greenBg2  },
  red:     { bg:T.redBg,     accent:T.red,     light:T.redBg2    },
  amber:   { bg:T.amberBg,   accent:T.amber,   light:"rgba(217,119,6,.20)"  },
  blue:    { bg:T.blueBg,    accent:T.blue,    light:"rgba(37,99,235,.18)"  },
  violet:  { bg:T.violetBg,  accent:T.violet,  light:"rgba(124,92,252,.18)" },
  default: { bg:T.surf2,     accent:T.muted,   light:T.surf3 },
}
function getTheme(color) {
  if (!color) return THEME.default
  const c = color.toString().toUpperCase()
  if (c.includes("1E9E5A")||c.includes("157A45")||c.includes("10B981")||c.includes("16A34A")) return THEME.green
  if (c.includes("E5484D")||c.includes("C53438")||c.includes("BA1A1A")||c.includes("DC2626")) return THEME.red
  if (c.includes("D97706")||c.includes("E0A030")||c.includes("F59E0B")) return THEME.amber
  if (c.includes("2563EB")||c.includes("3B82F6")) return THEME.blue
  if (c.includes("7C5CFC")||c.includes("7C3AED")) return THEME.violet
  return THEME.default
}

/* ── KPI Card ────────────────────────────────────────────────────────── */
export function KPI({ title, value, sub, icon:Icon, color, badge, spark, trend, hero }) {
  const th = getTheme(color)
  if (hero) {
    return (
      <div style={{ background:"var(--surf)", borderRadius:14, padding:"20px 22px", border:"1px solid var(--border)", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, gap:8 }}>
          <span style={{ fontSize:10, fontWeight:600, color:T.muted, textTransform:"uppercase", letterSpacing:".09em", lineHeight:1.4, minWidth:0 }}>{title}</span>
          {Icon && (
            <div style={{ width:28, height:28, borderRadius:8, background:th.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Icon size={13} color={th.accent} />
            </div>
          )}
        </div>
        <div style={{ fontSize:32, fontWeight:700, color:T.text, letterSpacing:"-.5px", fontFamily:"'DM Mono',monospace", lineHeight:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{value}</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginTop:14 }}>
          <div>
            {sub && <div style={{ fontSize:11, color:T.muted }}>{sub}</div>}
            {trend !== undefined && trend !== null && (
              <div style={{ fontSize:10, fontWeight:600, color:trend>=0?T.green:T.red, marginTop:sub?3:0 }}>
                {trend>=0?"↑":"↓"} {Math.abs(trend)}% vs mes ant.
              </div>
            )}
          </div>
          {spark && (
            <div style={{ width:60, height:26, flexShrink:0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spark}><Line type="monotone" dataKey="v" stroke={th.accent} strokeWidth={1.5} dot={false} /></LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    )
  }
  return (
    <div style={{ ...card, display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12, gap:8 }}>
        <span style={{ fontSize:10, fontWeight:600, color:T.muted, textTransform:"uppercase", letterSpacing:".07em", lineHeight:1.4, minWidth:0 }}>{title}</span>
        {badge ? (
          <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:20, background:badge.bg||th.light, color:badge.color||th.accent, whiteSpace:"nowrap", flexShrink:0 }}>{badge.label}</span>
        ) : Icon ? (
          <div style={{ width:28, height:28, borderRadius:8, background:th.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Icon size={13} color={th.accent} />
          </div>
        ) : null}
      </div>
      <div style={{ fontSize:24, fontWeight:700, color:T.text, letterSpacing:"-.4px", fontFamily:"'DM Mono',monospace", lineHeight:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{value}</div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginTop:10 }}>
        <div>
          {sub && <div style={{ fontSize:11, color:T.muted }}>{sub}</div>}
          {trend !== undefined && trend !== null && (
            <div style={{ fontSize:10, fontWeight:600, color:trend>=0?T.green:T.red, marginTop:sub?3:0 }}>
              {trend>=0?"↑":"↓"} {Math.abs(trend)}% vs mes ant.
            </div>
          )}
        </div>
        {spark && (
          <div style={{ width:56, height:24, flexShrink:0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spark}><Line type="monotone" dataKey="v" stroke={th.accent} strokeWidth={1.5} dot={false} /></LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Pill (status badge) ─────────────────────────────────────────────── */
export function Pill({ s }) {
  const m = {
    Pagado:    { bg:T.greenBg,  c:T.green },
    Pendiente: { bg:T.amberBg,  c:T.amber },
    Parcial:   { bg:T.blueBg,   c:T.blue  },
    Vencida:   { bg:T.redBg,    c:T.red   },
  }
  const st = m[s]||m.Pendiente
  return (
    <span style={{ fontSize:10, fontWeight:600, padding:"2px 9px", borderRadius:999, background:st.bg, color:st.c, whiteSpace:"nowrap", display:"inline-flex", alignItems:"center", gap:4 }}>
      <span style={{ width:4, height:4, borderRadius:"50%", background:st.c, display:"inline-block", flexShrink:0 }} />
      {s}
    </span>
  )
}

/* ── Status bar ─────────────────────────────────────────────────────── */
export function StatusBar({ items }) {
  return (
    <div style={{ display:"flex", background:"var(--surf)", border:`1px solid ${T.border}`, borderRadius:14, overflow:"hidden" }}>
      {items.map(({ label, value, color, bg }, i) => (
        <div key={label} style={{ flex:1, padding:"16px 20px", borderRight:i<items.length-1?`1px solid ${T.border}`:"none", background:bg||"#FFFFFF" }}>
          <div style={{ fontSize:10, fontWeight:600, color:T.muted, textTransform:"uppercase", letterSpacing:".07em", marginBottom:6 }}>{label}</div>
          <div style={{ fontSize:18, fontWeight:700, color:color||T.text, fontFamily:"'DM Mono',monospace", letterSpacing:"-.4px" }}>{value}</div>
        </div>
      ))}
    </div>
  )
}

/* ── Alert banner ───────────────────────────────────────────────────── */
export function AlertBanner({ icon, title, sub, color, bg, border, action, onAction }) {
  return (
    <div style={{ background:bg||"rgba(217,119,6,.06)", border:`1px solid ${border||"rgba(217,119,6,.25)"}`, borderRadius:10, padding:"11px 14px", display:"flex", alignItems:"center", gap:10 }}>
      {icon && <div style={{ flexShrink:0 }}>{icon}</div>}
      <div style={{ flex:1, minWidth:0 }}>
        <span style={{ fontSize:12, fontWeight:600, color:color||T.amber }}>{title}</span>
        {sub && <span style={{ fontSize:12, color:T.text2 }}> — {sub}</span>}
      </div>
      {action && (
        <button onClick={onAction} style={{ fontSize:11, fontWeight:600, color:color||T.amber, background:"none", border:"none", cursor:"pointer", padding:"4px 8px", borderRadius:7, whiteSpace:"nowrap", flexShrink:0 }}>{action}</button>
      )}
    </div>
  )
}

/* ── Empty state ────────────────────────────────────────────────────── */
export function EmptyState({ icon:Icon, title, sub, action, onAction }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"52px 24px", gap:10 }}>
      {Icon && (
        <div style={{ width:44, height:44, borderRadius:14, background:T.surf2, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:4 }}>
          <Icon size={20} color={T.muted} />
        </div>
      )}
      <div style={{ fontSize:14, fontWeight:600, color:T.text2, textAlign:"center" }}>{title}</div>
      {sub && <div style={{ fontSize:12, color:T.muted, textAlign:"center", maxWidth:260 }}>{sub}</div>}
      {action && (
        <button onClick={onAction} style={{ ...btnPrimary, marginTop:4, fontSize:12, padding:"8px 16px" }}>{action}</button>
      )}
    </div>
  )
}

/* ── Icon map (service icons for Recurring) ─────────────────────────── */
export const ICON_MAP = {
  adobe:   { label:"Ae", color:"#EF4444", bg:"rgba(239,68,68,.08)"  },
  figma:   { label:"Fi", color:"#A855F7", bg:"rgba(168,85,247,.08)" },
  slack:   { label:"Sl", color:"#EC4899", bg:"rgba(236,72,153,.08)" },
  google:  { label:"G",  color:"#2563EB", bg:"rgba(37,99,235,.08)"  },
  notion:  { label:"No", color:T.text,    bg:T.surf2                },
  loom:    { label:"Lo", color:"#6366F1", bg:"rgba(99,102,241,.08)" },
  office:  { label:"Of", color:"#F59E0B", bg:"rgba(245,158,11,.08)" },
  wifi:    { label:"Wi", color:"#2563EB", bg:"rgba(37,99,235,.08)"  },
  globe:   { label:"Gl", color:T.green,   bg:T.greenBg              },
  spotify: { label:"Sp", color:T.green,   bg:T.greenBg              },
  default: { label:"·",  color:T.muted,   bg:T.surf2                },
}

/* ── Tooltip (recharts) ─────────────────────────────────────────────── */
export function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:"#111", borderRadius:10, padding:"8px 13px", border:"1px solid rgba(255,255,255,.1)" }}>
      {label && <div style={{ color:"rgba(255,255,255,.45)", fontSize:10, marginBottom:5 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:7, marginBottom: i < payload.length-1 ? 3 : 0 }}>
          <span style={{ width:6, height:6, borderRadius:2, background:p.color, display:"inline-block", flexShrink:0 }} />
          <span style={{ color:"rgba(255,255,255,.6)", fontSize:10 }}>{p.name}:</span>
          <span style={{ color:"#fff", fontSize:11, fontWeight:600, fontFamily:"'DM Mono',monospace" }}>{fmtS(p.value)}</span>
        </div>
      ))}
    </div>
  )
}
