import { T } from './constants.js'
import { fmtS } from './constants.js'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

export const card = {
  background: T.surf, borderRadius: 14,
  border: `1px solid ${T.border}`, padding: "20px 22px",
}

export const cardFlat = {
  background: T.surf2, borderRadius: 12,
  border: `1px solid ${T.border}`, padding: "16px 18px",
}

export const inp = {
  width:"100%", padding:"10px 14px", borderRadius:10,
  border:`1px solid ${T.border}`, fontSize:13, color:T.text,
  outline:"none", background:T.surf, boxSizing:"border-box",
  fontFamily:"inherit", transition:"border-color .15s",
}
export const lbl = {
  display:"block", fontSize:11, fontWeight:600, color:T.muted,
  marginBottom:6, textTransform:"uppercase", letterSpacing:".08em",
}
export const btnPrimary = {
  background: T.text, color:"#fff", border:"none", borderRadius:9,
  padding:"9px 18px", fontSize:13, fontWeight:600, cursor:"pointer",
  display:"flex", alignItems:"center", gap:6,
  fontFamily:"inherit", transition:"opacity .15s",
}
export const btnGreen = btnPrimary
export const btnRed = {
  ...btnPrimary, background:"#fff", color:"#D72B20", border:"1px solid #FECACA",
}
export const btnGhost = {
  ...btnPrimary, background:"transparent", color:T.text2, border:`1px solid ${T.border}`,
}
export const btnSmall = {
  ...btnPrimary, padding:"6px 12px", fontSize:12, borderRadius:8,
}

const THEME = {
  green:   { bg:"rgba(68,178,107,.07)",  accent:"#44B26B", light:"#D1FAE5", bar:"#44B26B" },
  red:     { bg:"rgba(215,43,32,.07)",   accent:"#D72B20", light:"#FEE2E2", bar:"#D72B20" },
  amber:   { bg:"rgba(217,119,6,.07)",   accent:"#D97706", light:"#FEF3C7", bar:"#D97706" },
  blue:    { bg:"rgba(37,99,235,.07)",   accent:"#2563EB", light:"#DBEAFE", bar:"#2563EB" },
  violet:  { bg:"rgba(90,62,231,.07)",   accent:"#5A3EE7", light:"#EDE9FE", bar:"#5A3EE7" },
  default: { bg:T.surf2, accent:T.muted, light:T.surf3, bar:T.muted },
}

function getTheme(color) {
  if (!color) return THEME.default
  const c = color.toString()
  if (c.includes("44B26B")||c.includes("38955A")) return THEME.green
  if (c.includes("D72B20")||c.includes("B52319")) return THEME.red
  if (c.includes("D97706"))                        return THEME.amber
  if (c.includes("2563EB"))                        return THEME.blue
  if (c.includes("5A3EE7"))                        return THEME.violet
  return THEME.default
}

export function KPI({ title, value, sub, icon: Icon, color, badge, spark, trend }) {
  const th = getTheme(color)
  return (
    <div style={{ background: T.surf, borderRadius: 14, border: `1px solid ${T.border}`, padding: "18px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: ".08em", lineHeight: 1.3, minWidth: 0 }}>{title}</span>
        {badge ? (
          <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 6px", borderRadius: 20, background: badge.bg || th.light, color: badge.color || th.accent, whiteSpace: "nowrap", flexShrink: 0 }}>{badge.label}</span>
        ) : Icon ? (
          <div style={{ width: 30, height: 30, borderRadius: 8, background: th.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={14} color={th.accent} />
          </div>
        ) : null}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: T.text, letterSpacing: "-.5px", fontFamily: "'DM Mono',monospace", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 12 }}>
        <div>
          {sub && <div style={{ fontSize: 11, color: T.muted }}>{sub}</div>}
          {trend !== undefined && trend !== null && (
            <div style={{ fontSize: 11, fontWeight: 700, color: trend >= 0 ? T.green : T.red, marginTop: sub ? 2 : 0 }}>
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% vs mes anterior
            </div>
          )}
        </div>
        {spark && (
          <div style={{ width: 64, height: 28, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spark}>
                <Line type="monotone" dataKey="v" stroke={th.accent} strokeWidth={2} dot={false} />
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
    Pagado:    { bg:"#DCFCE7", c:"#16A34A" },
    Pendiente: { bg:"#FEF9C3", c:"#A16207" },
    Parcial:   { bg:"#DBEAFE", c:"#1D4ED8" },
    Vencida:   { bg:"#FEE2E2", c:"#B91C1C" },
  }
  const st = m[s] || m.Pendiente
  return <span style={{ fontSize:11, fontWeight:600, padding:"2px 9px", borderRadius:20, background:st.bg, color:st.c, whiteSpace:"nowrap" }}>{s}</span>
}

export function StatusBar({ items }) {
  return (
    <div style={{ display: "flex", gap: 0, background: T.surf, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
      {items.map(({ label, value, color, bg }, i) => (
        <div key={label} style={{
          flex: 1, padding: "12px 16px", borderRight: i < items.length - 1 ? `1px solid ${T.border}` : "none",
          background: bg || T.surf,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 }}>{label}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: color || T.text, fontFamily: "'DM Mono',monospace", letterSpacing: "-.3px" }}>{value}</div>
        </div>
      ))}
    </div>
  )
}

export function AlertBanner({ icon, title, sub, color, bg, border, action, onAction }) {
  return (
    <div style={{ background: bg || "#FFFBEB", border: `1px solid ${border || "#FDE68A"}`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
      {icon && <div style={{ flexShrink: 0 }}>{icon}</div>}
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: color || T.amber }}>{title}</span>
        {sub && <span style={{ fontSize: 13, color: T.text2 }}> — {sub}</span>}
      </div>
      {action && (
        <button onClick={onAction} style={{ fontSize: 12, fontWeight: 600, color: color || T.amber, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 6, whiteSpace: "nowrap" }}>
          {action}
        </button>
      )}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, sub, action, onAction }) {
  return (
    <div style={{ textAlign: "center", padding: "56px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      {Icon && (
        <div style={{ width: 52, height: 52, borderRadius: 14, background: T.surf2, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
          <Icon size={22} color={T.muted} />
        </div>
      )}
      <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{title}</div>
      {sub && <div style={{ fontSize: 13, color: T.muted, maxWidth: 300, lineHeight: 1.5 }}>{sub}</div>}
      {action && (
        <button onClick={onAction} style={{ ...btnPrimary, marginTop: 4 }}>{action}</button>
      )}
    </div>
  )
}

export function Tip({ active, payload, label }) {
  if (!active||!payload?.length) return null
  return (
    <div style={{ background:"#101010", borderRadius:12, padding:"10px 16px", boxShadow:"0 8px 32px rgba(0,0,0,.12)" }}>
      <div style={{ color:"rgba(255,255,255,.4)", fontSize:11, marginBottom:8, fontWeight:600, textTransform:"uppercase", letterSpacing:".06em" }}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{ color:"#fff", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:8, marginBottom:i<payload.length-1?4:0, fontFamily:"'DM Mono',monospace" }}>
          <span style={{ width:8, height:8, borderRadius:2, background:p.color, display:"inline-block", flexShrink:0 }}/>
          <span style={{ color:"rgba(255,255,255,.4)", minWidth:65 }}>{p.name}</span>
          {fmtS(p.value)}
        </div>
      ))}
    </div>
  )
}

export const Div = () => <div style={{ height:"1px", background:T.border, margin:"4px 0" }}/>

export const ICON_MAP = {
  adobe:   { label:"Ae", color:"#EF4444", bg:"#FEE2E2" },
  figma:   { label:"Fi", color:"#A855F7", bg:"#F3E8FF" },
  slack:   { label:"Sl", color:"#EC4899", bg:"#FCE7F3" },
  google:  { label:"G",  color:"#3B82F6", bg:"#DBEAFE" },
  notion:  { label:"No", color:T.text,    bg:T.surf2   },
  loom:    { label:"Lo", color:"#6366F1", bg:"#E0E7FF" },
  office:  { label:"Of", color:"#D97706", bg:"#FEF3C7" },
  wifi:    { label:"Wi", color:"#2563EB", bg:"#DBEAFE" },
  globe:   { label:"Gl", color:"#44B26B", bg:"#D1FAE5" },
  spotify: { label:"Sp", color:"#44B26B", bg:"#D1FAE5" },
  default: { label:"·",  color:T.muted,   bg:T.surf2   },
}
