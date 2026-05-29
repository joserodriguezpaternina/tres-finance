import { T } from './constants.js'
import { fmtS } from './constants.js'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

/* ── Card styles ── */
export const card = {
  background: "#FFFFFF",
  borderRadius: 16,
  border: "1px solid #E5E2E1",
  padding: "20px 24px",
  boxShadow: "none",
}
export const cardFlat = {
  background: "#F3F3F3",
  borderRadius: 12,
  border: "1px solid #E5E2E1",
  padding: "12px 16px",
}

/* ── Form primitives ── */
export const inp = {
  width:"100%", padding:"10px 14px", borderRadius:12,
  border:`1px solid ${T.border}`, fontSize:14, color:T.text,
  outline:"none", background:"#FFFFFF", boxSizing:"border-box",
  fontFamily:"inherit", transition:"border-color .15s, box-shadow .15s",
}
export const lbl = {
  display:"block", fontSize:11, fontWeight:600, color:T.subtle,
  marginBottom:6, textTransform:"uppercase", letterSpacing:".07em",
}

/* ── Buttons ── */
export const btnPrimary = {
  background: "#000000", color: "#FFFFFF", border: "none",
  borderRadius: 999, padding: "8px 20px", fontSize: 13,
  fontWeight: 600, cursor: "pointer", display: "flex",
  alignItems: "center", gap: 6, fontFamily: "inherit",
}
export const btnGreen = { ...btnPrimary, background: "#10B981" }
export const btnRed = {
  ...btnPrimary, background: "#FFFFFF", color: "#BA1A1A",
  border: "1px solid #E5E2E1",
}
export const btnGhost = {
  ...btnPrimary, background: "#FFFFFF", color: "#4C4546",
  border: "1px solid #E5E2E1",
}
export const btnSmall = { ...btnPrimary, padding: "5px 14px", fontSize: 12 }

/* ── Semantic color themes ── */
const THEME = {
  green:   { bg:T.greenBg,   accent:T.green,   light:"rgba(16,185,129,.18)"  },
  red:     { bg:T.redBg,     accent:T.red,     light:"rgba(186,26,26,.18)"   },
  amber:   { bg:T.amberBg,   accent:T.amber,   light:"rgba(245,158,11,.18)"  },
  blue:    { bg:T.blueBg,    accent:T.blue,    light:"rgba(37,99,235,.18)"   },
  violet:  { bg:T.violetBg,  accent:T.violet,  light:"rgba(124,58,237,.18)"  },
  default: { bg:T.surf2, accent:T.muted, light:T.surf3 },
}
function getTheme(color) {
  if (!color) return THEME.default
  const c = color.toString()
  if (c.includes("10B981")||c.includes("059669")||c.includes("16A34A")||c.includes("15803D")) return THEME.green
  if (c.includes("BA1A1A")||c.includes("C2410C")||c.includes("EA580C")||c.includes("DC2626")) return THEME.red
  if (c.includes("F59E0B")||c.includes("D97706")) return THEME.amber
  if (c.includes("2563EB")||c.includes("3B82F6")) return THEME.blue
  if (c.includes("7C3AED")||c.includes("8B5CF6")) return THEME.violet
  return THEME.default
}

/* ── KPI component ── */
export function KPI({ title, value, sub, icon:Icon, color, badge, spark, trend, hero }) {
  const th = getTheme(color)
  if (hero) {
    const th = getTheme(color || T.green)
    return (
      <div style={{
        background: "#FFFFFF", borderRadius: 16, padding: "22px 24px",
        border: "1px solid #E5E2E1",
        display:"flex", flexDirection:"column",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, gap:8 }}>
          <span style={{ fontSize:11, fontWeight:600, color:T.muted, textTransform:"uppercase", letterSpacing:".09em", lineHeight:1.4, minWidth:0 }}>{title}</span>
          {Icon && (
            <div style={{ width:30, height:30, borderRadius:10, background:th.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Icon size={14} color={th.accent} />
            </div>
          )}
        </div>
        <div style={{ fontSize:36, fontWeight:700, color:T.text, letterSpacing:"-.5px", fontFamily:"'DM Mono',monospace", lineHeight:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{value}</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginTop:16 }}>
          <div>
            {sub && <div style={{ fontSize:12, color:T.muted }}>{sub}</div>}
            {trend !== undefined && trend !== null && (
              <div style={{ fontSize:11, fontWeight:600, color:trend>=0?T.green:T.red, marginTop:sub?3:0 }}>
                {trend>=0?"↑":"↓"} {Math.abs(trend)}% vs mes ant.
              </div>
            )}
          </div>
          {spark && (
            <div style={{ width:64, height:28, flexShrink:0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spark}>
                  <Line type="monotone" dataKey="v" stroke={th.accent} strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    )
  }
  return (
    <div style={{ ...card, display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, gap:8 }}>
        <span style={{ fontSize:11, fontWeight:600, color:T.muted, textTransform:"uppercase", letterSpacing:".07em", lineHeight:1.4, minWidth:0 }}>{title}</span>
        {badge ? (
          <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:20, background:badge.bg||th.light, color:badge.color||th.accent, whiteSpace:"nowrap", flexShrink:0 }}>{badge.label}</span>
        ) : Icon ? (
          <div style={{ width:30, height:30, borderRadius:10, background:th.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Icon size={14} color={th.accent} />
          </div>
        ) : null}
      </div>
      <div style={{ fontSize:28, fontWeight:700, color:T.text, letterSpacing:"-.5px", fontFamily:"'DM Mono',monospace", lineHeight:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{value}</div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginTop:12 }}>
        <div>
          {sub && <div style={{ fontSize:12, color:T.muted }}>{sub}</div>}
          {trend !== undefined && trend !== null && (
            <div style={{ fontSize:11, fontWeight:600, color:trend>=0?T.green:T.red, marginTop:sub?3:0 }}>
              {trend>=0?"↑":"↓"} {Math.abs(trend)}% vs mes ant.
            </div>
          )}
        </div>
        {spark && (
          <div style={{ width:60, height:26, flexShrink:0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spark}>
                <Line type="monotone" dataKey="v" stroke={th.accent} strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Pill status component ── */
export function Pill({ s }) {
  const m = {
    Pagado:    { bg:"rgba(16,185,129,.1)",  c:"#10B981" },
    Pendiente: { bg:"rgba(245,158,11,.1)",  c:"#F59E0B" },
    Parcial:   { bg:"rgba(37,99,235,.1)",   c:"#2563EB" },
    Vencida:   { bg:"rgba(186,26,26,.1)",   c:"#BA1A1A" },
  }
  const st = m[s]||m.Pendiente
  return (
    <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:999, background:st.bg, color:st.c, whiteSpace:"nowrap", display:"inline-flex", alignItems:"center", gap:5 }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:st.c, display:"inline-block", flexShrink:0 }} />
      {s}
    </span>
  )
}

/* ── Status bar ── */
export function StatusBar({ items }) {
  return (
    <div style={{ display:"flex", background:"#FFFFFF", border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden" }}>
      {items.map(({ label, value, color, bg }, i) => (
        <div key={label} style={{ flex:1, padding:"18px 24px", borderRight:i<items.length-1?`1px solid ${T.border}`:"none", background:bg||"#FFFFFF" }}>
          <div style={{ fontSize:11, fontWeight:600, color:T.muted, textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>{label}</div>
          <div style={{ fontSize:20, fontWeight:700, color:color||T.text, fontFamily:"'DM Mono',monospace", letterSpacing:"-.5px" }}>{value}</div>
        </div>
      ))}
    </div>
  )
}

/* ── Alert banner ── */
export function AlertBanner({ icon, title, sub, color, bg, border, action, onAction }) {
  return (
    <div style={{ background:bg||"rgba(245,158,11,.06)", border:`1px solid ${border||"rgba(245,158,11,.25)"}`, borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
      {icon && <div style={{ flexShrink:0 }}>{icon}</div>}
      <div style={{ flex:1, minWidth:0 }}>
        <span style={{ fontSize:13, fontWeight:600, color:color||T.amber }}>{title}</span>
        {sub && <span style={{ fontSize:13, color:T.text2 }}> — {sub}</span>}
      </div>
      {action && (
        <button onClick={onAction} style={{ fontSize:12, fontWeight:600, color:color||T.amber, background:"none", border:"none", cursor:"pointer", padding:"4px 8px", borderRadius:8, whiteSpace:"nowrap", flexShrink:0 }}>{action}</button>
      )}
    </div>
  )
}

/* ── Empty state ── */
export function EmptyState({ icon:Icon, title, sub, action, onAction }) {
  return (
    <div style={{ textAlign:"center", padding:"64px 24px", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
      {Icon && (
        <div style={{ width:52, height:52, borderRadius:16, background:T.surf2, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:4 }}>
          <Icon size={22} color={T.muted} />
        </div>
      )}
      <div style={{ fontSize:15, fontWeight:700, color:T.text }}>{title}</div>
      {sub && <div style={{ fontSize:13, color:T.muted, maxWidth:300, lineHeight:1.65 }}>{sub}</div>}
      {action && <button onClick={onAction} style={{ ...btnPrimary, marginTop:12 }}>{action}</button>}
    </div>
  )
}

/* ── Chart tooltip ── */
export function Tip({ active, payload, label }) {
  if (!active||!payload?.length) return null
  return (
    <div style={{ background:T.text, borderRadius:12, padding:"10px 14px", border:"none" }}>
      <div style={{ color:"rgba(255,255,255,.5)", fontSize:10, marginBottom:8, fontWeight:600, textTransform:"uppercase", letterSpacing:".07em" }}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{ color:"#fff", fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:8, marginBottom:i<payload.length-1?5:0, fontFamily:"'DM Mono',monospace" }}>
          <span style={{ width:7, height:7, borderRadius:2, background:p.color, display:"inline-block", flexShrink:0 }}/>
          <span style={{ color:"rgba(255,255,255,.4)", minWidth:60 }}>{p.name}</span>
          {fmtS(p.value)}
        </div>
      ))}
    </div>
  )
}

/* ── Divider ── */
export const Div = () => <div style={{ height:"1px", background:T.border, margin:"2px 0" }}/>

/* ── Icon map for recurring ── */
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

/* ── Section title ── */
export function SectionTitle({ title, sub, action, onAction }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:16 }}>
      <div>
        <div style={{ fontSize:14, fontWeight:700, color:T.text, letterSpacing:"-.2px" }}>{title}</div>
        {sub && <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>{sub}</div>}
      </div>
      {action && (
        <button onClick={onAction} style={{ fontSize:12, fontWeight:600, color:T.subtle, background:"none", border:"none", cursor:"pointer", padding:0 }}>{action}</button>
      )}
    </div>
  )
}

/* ── Tab bar ── */
export function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${T.border}`, marginBottom:20 }}>
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)} style={{
          background:"none", border:"none", cursor:"pointer", fontFamily:"inherit",
          fontSize:13, fontWeight:active===t?600:400,
          color:active===t?T.text:T.muted,
          padding:"0 16px 12px", marginBottom:-1,
          borderBottom:active===t?`2px solid ${T.text}`:"2px solid transparent",
          transition:"color .15s, border-color .15s",
          whiteSpace:"nowrap",
        }}>{t}</button>
      ))}
    </div>
  )
}
