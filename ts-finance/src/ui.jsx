import { T } from './constants.js'
import { fmtS } from './constants.js'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

/* ── Card styles ── */
export const card = {
  background: T.surf, borderRadius: 12,
  border: `0.5px solid ${T.border}`, padding: "24px",
  boxShadow: "none",
}
export const cardFlat = {
  background: T.surf2, borderRadius: 10,
  border: `0.5px solid ${T.border}`, padding: "14px 16px",
  boxShadow: "none",
}

/* ── Form primitives ── */
export const inp = {
  width:"100%", padding:"10px 14px", borderRadius:10,
  border:`0.5px solid ${T.border}`, fontSize:13, color:T.text,
  outline:"none", background:T.surf, boxSizing:"border-box",
  fontFamily:"inherit", transition:"border-color .15s",
}
export const lbl = {
  display:"block", fontSize:10, fontWeight:700, color:T.subtle,
  marginBottom:5, textTransform:"uppercase", letterSpacing:".07em",
}

/* ── Buttons ── */
export const btnPrimary = {
  background: T.text, color:"#fff", border:"none", borderRadius:8,
  padding:"9px 16px", fontSize:13, fontWeight:600, cursor:"pointer",
  display:"flex", alignItems:"center", gap:7,
  fontFamily:"inherit", transition:"opacity .15s", letterSpacing:"-.1px",
  boxShadow: "none",
}
export const btnGreen  = btnPrimary
export const btnRed    = { ...btnPrimary, background:"#fff", color:T.red, border:`0.5px solid ${T.border}`, boxShadow:"none" }
export const btnGhost  = { ...btnPrimary, background:"#fff", color:T.text2, border:`0.5px solid ${T.border}`, boxShadow:"none" }
export const btnSmall  = { ...btnPrimary, padding:"5px 12px", fontSize:12, borderRadius:7, boxShadow:"none" }

/* ── Semantic color themes ── */
const THEME = {
  green:   { bg:T.greenBg,   accent:T.green,   light:"rgba(22,120,74,.12)"  },
  red:     { bg:T.redBg,     accent:T.red,     light:"rgba(196,30,30,.12)"  },
  amber:   { bg:T.amberBg,   accent:T.amber,   light:"rgba(184,115,8,.12)"  },
  blue:    { bg:T.blueBg,    accent:T.blue,    light:"rgba(26,79,191,.12)"  },
  violet:  { bg:T.violetBg,  accent:T.violet,  light:"rgba(104,48,204,.12)" },
  default: { bg:T.surf2, accent:T.muted, light:T.surf3 },
}
function getTheme(color) {
  if (!color) return THEME.default
  const c = color.toString()
  if (c.includes("16784A")||c.includes("16A34A")||c.includes("44B26B")||c.includes("059669")) return THEME.green
  if (c.includes("C41E1E")||c.includes("DC2626")||c.includes("D72B20")||c.includes("B91C1C")) return THEME.red
  if (c.includes("B87308")||c.includes("D97706")) return THEME.amber
  if (c.includes("1A4FBF")||c.includes("2563EB")||c.includes("3B82F6")) return THEME.blue
  if (c.includes("6830CC")||c.includes("7C3AED")||c.includes("8B5CF6")||c.includes("5A3EE7")) return THEME.violet
  return THEME.default
}

/* ── KPI component ── */
export function KPI({ title, value, sub, icon:Icon, color, badge, spark, trend, hero }) {
  const th = getTheme(color)
  if (hero) {
    return (
      <div style={{
        background: T.surf, borderRadius: 12, padding: "26px 28px",
        border: `0.5px solid ${T.border}`,
        display:"flex", flexDirection:"column",
        boxShadow: "none",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, gap:8 }}>
          <span style={{ fontSize:10, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:".09em", lineHeight:1.4, minWidth:0 }}>{title}</span>
          {Icon && (
            <div style={{ width:28, height:28, borderRadius:8, background:T.surf2, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Icon size={13} color={T.muted} />
            </div>
          )}
        </div>
        <div style={{ fontSize:72, fontWeight:700, color:T.text, letterSpacing:"-3px", fontFamily:"'DM Mono',monospace", lineHeight:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{value}</div>
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
                  <Line type="monotone" dataKey="v" stroke={T.green} strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    )
  }
  return (
    <div style={{ ...card, padding:"20px 22px", display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12, gap:8 }}>
        <span style={{ fontSize:10, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:".1em", lineHeight:1.4, minWidth:0 }}>{title}</span>
        {badge ? (
          <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:20, background:badge.bg||th.light, color:badge.color||th.accent, whiteSpace:"nowrap", flexShrink:0 }}>{badge.label}</span>
        ) : Icon ? (
          <div style={{ width:28, height:28, borderRadius:8, background:th.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Icon size={13} color={th.accent} />
          </div>
        ) : null}
      </div>
      <div style={{ fontSize:36, fontWeight:700, color:T.text, letterSpacing:"-1.5px", fontFamily:"'DM Mono',monospace", lineHeight:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{value}</div>
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
    Pagado:    { bg:"rgba(22,120,74,.08)",   c:"#16784A", dot:"#16784A" },
    Pendiente: { bg:"rgba(184,115,8,.08)",   c:"#B87308", dot:"#B87308" },
    Parcial:   { bg:"rgba(26,79,191,.08)",   c:"#1A4FBF", dot:"#1A4FBF" },
    Vencida:   { bg:"rgba(196,30,30,.08)",   c:"#C41E1E", dot:"#C41E1E" },
  }
  const st = m[s]||m.Pendiente
  return (
    <span style={{ fontSize:11, fontWeight:600, padding:"3px 9px 3px 7px", borderRadius:20, background:st.bg, color:st.c, whiteSpace:"nowrap", display:"inline-flex", alignItems:"center", gap:5 }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:st.dot, display:"inline-block", flexShrink:0 }} />
      {s}
    </span>
  )
}

/* ── Status bar ── */
export function StatusBar({ items }) {
  return (
    <div style={{ display:"flex", background:T.surf, border:`0.5px solid ${T.border}`, borderRadius:12, overflow:"hidden" }}>
      {items.map(({ label, value, color, bg }, i) => (
        <div key={label} style={{ flex:1, padding:"18px 22px", borderRight:i<items.length-1?`0.5px solid ${T.border}`:"none", background:bg||T.surf }}>
          <div style={{ fontSize:10, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:".1em", marginBottom:7 }}>{label}</div>
          <div style={{ fontSize:20, fontWeight:700, color:color||T.text, fontFamily:"'DM Mono',monospace", letterSpacing:"-.5px" }}>{value}</div>
        </div>
      ))}
    </div>
  )
}

/* ── Alert banner ── */
export function AlertBanner({ icon, title, sub, color, bg, border, action, onAction }) {
  return (
    <div style={{ background:bg||"rgba(184,115,8,.06)", border:`0.5px solid ${border||"rgba(184,115,8,.25)"}`, borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
      {icon && <div style={{ flexShrink:0 }}>{icon}</div>}
      <div style={{ flex:1, minWidth:0 }}>
        <span style={{ fontSize:13, fontWeight:600, color:color||T.amber }}>{title}</span>
        {sub && <span style={{ fontSize:13, color:T.text2 }}> — {sub}</span>}
      </div>
      {action && (
        <button onClick={onAction} style={{ fontSize:12, fontWeight:600, color:color||T.amber, background:"none", border:"none", cursor:"pointer", padding:"4px 8px", borderRadius:6, whiteSpace:"nowrap", flexShrink:0 }}>{action}</button>
      )}
    </div>
  )
}

/* ── Empty state ── */
export function EmptyState({ icon:Icon, title, sub, action, onAction }) {
  return (
    <div style={{ textAlign:"center", padding:"64px 24px", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
      {Icon && (
        <div style={{ width:52, height:52, borderRadius:14, background:T.surf2, border:`0.5px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:4 }}>
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
    <div style={{ background:T.text, borderRadius:10, padding:"10px 14px", border:`0.5px solid rgba(255,255,255,.06)` }}>
      <div style={{ color:"rgba(255,255,255,.38)", fontSize:10, marginBottom:8, fontWeight:700, textTransform:"uppercase", letterSpacing:".07em" }}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{ color:"#fff", fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:8, marginBottom:i<payload.length-1?5:0, fontFamily:"'DM Mono',monospace" }}>
          <span style={{ width:7, height:7, borderRadius:2, background:p.color, display:"inline-block", flexShrink:0 }}/>
          <span style={{ color:"rgba(255,255,255,.38)", minWidth:60 }}>{p.name}</span>
          {fmtS(p.value)}
        </div>
      ))}
    </div>
  )
}

/* ── Divider ── */
export const Div = () => <div style={{ height:"0.5px", background:T.border, margin:"2px 0" }}/>

/* ── Icon map for recurring ── */
export const ICON_MAP = {
  adobe:   { label:"Ae", color:"#EF4444", bg:"rgba(239,68,68,.08)"  },
  figma:   { label:"Fi", color:"#A855F7", bg:"rgba(168,85,247,.08)" },
  slack:   { label:"Sl", color:"#EC4899", bg:"rgba(236,72,153,.08)" },
  google:  { label:"G",  color:"#1A4FBF", bg:"rgba(26,79,191,.08)"  },
  notion:  { label:"No", color:T.text,    bg:T.surf2                },
  loom:    { label:"Lo", color:"#6366F1", bg:"rgba(99,102,241,.08)" },
  office:  { label:"Of", color:"#B87308", bg:"rgba(184,115,8,.08)"  },
  wifi:    { label:"Wi", color:"#1A4FBF", bg:"rgba(26,79,191,.08)"  },
  globe:   { label:"Gl", color:T.green,   bg:T.greenBg              },
  spotify: { label:"Sp", color:T.green,   bg:T.greenBg              },
  default: { label:"·",  color:T.muted,   bg:T.surf2                },
}

/* ── Section title ── */
export function SectionTitle({ title, sub, action, onAction }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:16 }}>
      <div>
        <div style={{ fontSize:13, fontWeight:600, color:T.text, letterSpacing:"-.2px" }}>{title}</div>
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
    <div style={{ display:"flex", gap:0, borderBottom:`0.5px solid ${T.border}`, marginBottom:20 }}>
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
