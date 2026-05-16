import { T } from './constants.js'
import { fmtS } from './constants.js'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

export const card = {
  background: T.surf, borderRadius: 12,
  border: `1px solid ${T.border}`, padding: "24px",
  boxShadow: "0 1px 2px rgba(0,0,0,.04)",
}
export const cardFlat = {
  background: T.surf2, borderRadius: 10,
  border: `1px solid ${T.border}`, padding: "14px 16px",
}
export const inp = {
  width:"100%", padding:"9px 13px", borderRadius:9,
  border:`1px solid ${T.border}`, fontSize:13, color:T.text,
  outline:"none", background:T.surf, boxSizing:"border-box",
  fontFamily:"inherit", transition:"border-color .15s, box-shadow .15s",
}
export const lbl = {
  display:"block", fontSize:11, fontWeight:600, color:T.subtle,
  marginBottom:5, textTransform:"uppercase", letterSpacing:".06em",
}
export const btnPrimary = {
  background:T.text, color:"#fff", border:"none", borderRadius:9,
  padding:"9px 18px", fontSize:13, fontWeight:600, cursor:"pointer",
  display:"flex", alignItems:"center", gap:7,
  fontFamily:"inherit", transition:"opacity .15s", letterSpacing:"-.1px",
}
export const btnGreen  = btnPrimary
export const btnRed    = { ...btnPrimary, background:"#fff", color:T.red,   border:`1px solid ${T.border}` }
export const btnGhost  = { ...btnPrimary, background:"#fff", color:T.text2, border:`1px solid ${T.border}` }
export const btnSmall  = { ...btnPrimary, padding:"5px 12px", fontSize:12, borderRadius:8 }

const THEME = {
  green:   { bg:T.greenBg,   accent:T.green,   light:"#DCFCE7" },
  red:     { bg:T.redBg,     accent:T.red,     light:"#FEE2E2" },
  amber:   { bg:T.amberBg,   accent:T.amber,   light:"#FEF3C7" },
  blue:    { bg:T.blueBg,    accent:T.blue,    light:"#DBEAFE" },
  violet:  { bg:T.violetBg,  accent:T.violet,  light:"#EDE9FE" },
  default: { bg:T.surf2, accent:T.muted, light:T.surf3 },
}
function getTheme(color) {
  if (!color) return THEME.default
  const c = color.toString()
  if (c.includes("16A34A")||c.includes("44B26B")||c.includes("059669")) return THEME.green
  if (c.includes("DC2626")||c.includes("D72B20")||c.includes("B91C1C")) return THEME.red
  if (c.includes("D97706")) return THEME.amber
  if (c.includes("2563EB")||c.includes("3B82F6")) return THEME.blue
  if (c.includes("7C3AED")||c.includes("8B5CF6")||c.includes("5A3EE7")) return THEME.violet
  return THEME.default
}

export function KPI({ title, value, sub, icon:Icon, color, badge, spark, trend }) {
  const th = getTheme(color)
  return (
    <div style={{ ...card, padding:"20px 22px", display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, gap:8 }}>
        <span style={{ fontSize:11, fontWeight:600, color:T.subtle, textTransform:"uppercase", letterSpacing:".07em", lineHeight:1.4, minWidth:0 }}>{title}</span>
        {badge ? (
          <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:20, background:badge.bg||th.light, color:badge.color||th.accent, whiteSpace:"nowrap", flexShrink:0 }}>{badge.label}</span>
        ) : Icon ? (
          <div style={{ width:30, height:30, borderRadius:8, background:th.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Icon size={14} color={th.accent} />
          </div>
        ) : null}
      </div>
      <div style={{ fontSize:26, fontWeight:700, color:T.text, letterSpacing:"-1px", fontFamily:"'DM Mono',monospace", lineHeight:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{value}</div>
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

export function Pill({ s }) {
  const m = {
    Pagado:    { bg:"#DCFCE7", c:"#15803D" },
    Pendiente: { bg:"#FEF3C7", c:"#92400E" },
    Parcial:   { bg:"#DBEAFE", c:"#1D4ED8" },
    Vencida:   { bg:"#FEE2E2", c:"#B91C1C" },
  }
  const st = m[s]||m.Pendiente
  return <span style={{ fontSize:11, fontWeight:600, padding:"2px 9px", borderRadius:20, background:st.bg, color:st.c, whiteSpace:"nowrap", display:"inline-block" }}>{s}</span>
}

export function StatusBar({ items }) {
  return (
    <div style={{ display:"flex", background:T.surf, border:`1px solid ${T.border}`, borderRadius:12, overflow:"hidden" }}>
      {items.map(({ label, value, color, bg }, i) => (
        <div key={label} style={{ flex:1, padding:"16px 20px", borderRight:i<items.length-1?`1px solid ${T.border}`:"none", background:bg||T.surf }}>
          <div style={{ fontSize:10, fontWeight:700, color:T.subtle, textTransform:"uppercase", letterSpacing:".07em", marginBottom:6 }}>{label}</div>
          <div style={{ fontSize:19, fontWeight:700, color:color||T.text, fontFamily:"'DM Mono',monospace", letterSpacing:"-.5px" }}>{value}</div>
        </div>
      ))}
    </div>
  )
}

export function AlertBanner({ icon, title, sub, color, bg, border, action, onAction }) {
  return (
    <div style={{ background:bg||"#FFFBEB", border:`1px solid ${border||"#FDE68A"}`, borderRadius:10, padding:"11px 16px", display:"flex", alignItems:"center", gap:10 }}>
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

export function EmptyState({ icon:Icon, title, sub, action, onAction }) {
  return (
    <div style={{ textAlign:"center", padding:"56px 24px", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
      {Icon && (
        <div style={{ width:52, height:52, borderRadius:14, background:T.surf2, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:4 }}>
          <Icon size={22} color={T.muted} />
        </div>
      )}
      <div style={{ fontSize:14, fontWeight:700, color:T.text }}>{title}</div>
      {sub && <div style={{ fontSize:13, color:T.muted, maxWidth:300, lineHeight:1.6 }}>{sub}</div>}
      {action && <button onClick={onAction} style={{ ...btnPrimary, marginTop:8 }}>{action}</button>}
    </div>
  )
}

export function Tip({ active, payload, label }) {
  if (!active||!payload?.length) return null
  return (
    <div style={{ background:T.text, borderRadius:10, padding:"9px 14px", boxShadow:"0 8px 24px rgba(0,0,0,.18)" }}>
      <div style={{ color:"rgba(255,255,255,.4)", fontSize:10, marginBottom:7, fontWeight:600, textTransform:"uppercase", letterSpacing:".07em" }}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{ color:"#fff", fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:8, marginBottom:i<payload.length-1?4:0, fontFamily:"'DM Mono',monospace" }}>
          <span style={{ width:7, height:7, borderRadius:2, background:p.color, display:"inline-block", flexShrink:0 }}/>
          <span style={{ color:"rgba(255,255,255,.4)", minWidth:60 }}>{p.name}</span>
          {fmtS(p.value)}
        </div>
      ))}
    </div>
  )
}

export const Div = () => <div style={{ height:"1px", background:T.border, margin:"2px 0" }}/>

export const ICON_MAP = {
  adobe:   { label:"Ae", color:"#EF4444", bg:"#FEE2E2" },
  figma:   { label:"Fi", color:"#A855F7", bg:"#F3E8FF" },
  slack:   { label:"Sl", color:"#EC4899", bg:"#FCE7F3" },
  google:  { label:"G",  color:"#3B82F6", bg:"#DBEAFE" },
  notion:  { label:"No", color:T.text,    bg:T.surf2   },
  loom:    { label:"Lo", color:"#6366F1", bg:"#E0E7FF" },
  office:  { label:"Of", color:"#D97706", bg:"#FEF3C7" },
  wifi:    { label:"Wi", color:"#2563EB", bg:"#DBEAFE" },
  globe:   { label:"Gl", color:T.green,   bg:"#DCFCE7" },
  spotify: { label:"Sp", color:T.green,   bg:"#DCFCE7" },
  default: { label:"·",  color:T.muted,   bg:T.surf2   },
}
