import { T } from './constants.js'
import { fmtS } from './constants.js'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

export const card = {
  background: T.surf, borderRadius: 16,
  border: `1px solid ${T.border}`, padding: "22px 24px",
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
export const btnGreen = {
  background:"#101010", color:"#fff", border:"none", borderRadius:10,
  padding:"9px 18px", fontSize:13, fontWeight:600, cursor:"pointer",
  display:"flex", alignItems:"center", gap:6,
  fontFamily:"inherit", transition:"opacity .15s",
}
export const btnRed = {
  ...btnGreen, background:"#fff", color:"#D72B20", border:"1px solid #FECACA",
}
export const btnGhost = {
  ...btnGreen, background:"transparent", color:T.text2, border:`1px solid ${T.border}`,
}

const THEME = {
  green:   { bg:"rgba(68,178,107,.06)",  accent:"#44B26B", light:"#D1FAE5", bar:"#44B26B" },
  red:     { bg:"rgba(215,43,32,.06)",   accent:"#D72B20", light:"#FEE2E2", bar:"#D72B20" },
  amber:   { bg:"rgba(217,119,6,.06)",   accent:"#D97706", light:"#FEF3C7", bar:"#D97706" },
  blue:    { bg:"rgba(37,99,235,.06)",   accent:"#2563EB", light:"#DBEAFE", bar:"#2563EB" },
  violet:  { bg:"rgba(90,62,231,.06)",   accent:"#5A3EE7", light:"#EDE9FE", bar:"#5A3EE7" },
  default: { bg:T.surf2, accent:T.muted, light:T.surf3, bar:T.muted },
}

function getTheme(color) {
  if (!color) return THEME.default
  const c = color.toString()
  if (c.includes("44B26B")||c.includes("38955A")) return THEME.green
  if (c.includes("D72B20")||c.includes("B52319")) return THEME.red
  if (c.includes("D97706"))                       return THEME.amber
  if (c.includes("2563EB"))                       return THEME.blue
  if (c.includes("5A3EE7"))                       return THEME.violet
  return THEME.default
}

export function KPI({ title, value, sub, icon: Icon, color, badge, spark }) {
  const th = getTheme(color)
  return (
    <div style={{ background: T.surf, borderRadius: 16, border: `1px solid ${T.border}`, padding: "20px 22px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: ".08em", lineHeight: 1.3, maxWidth: 130 }}>{title}</span>
        {badge ? (
          <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: badge.bg || th.light, color: badge.color || th.accent, whiteSpace: "nowrap" }}>{badge.label}</span>
        ) : Icon ? (
          <div style={{ width: 32, height: 32, borderRadius: 9, background: th.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={15} color={th.accent} />
          </div>
        ) : null}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: T.text, letterSpacing: "-.5px", fontFamily: "'DM Mono',monospace", lineHeight: 1.1 }}>{value}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 14 }}>
        {sub && <div style={{ fontSize: 12, color: T.muted }}>{sub}</div>}
        {spark && (
          <div style={{ width: 70, height: 30, flexShrink: 0 }}>
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
  const m = { Pagado:{bg:"#D1FAE5",c:"#38955A"}, Pendiente:{bg:"#FEF3C7",c:"#B45309"}, Parcial:{bg:"#DBEAFE",c:"#1D4ED8"} }
  const st = m[s]||m.Pendiente
  return <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, background:st.bg, color:st.c }}>{s}</span>
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
