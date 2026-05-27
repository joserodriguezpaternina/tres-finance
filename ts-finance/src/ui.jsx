import { T } from './constants.js'
import { fmtS } from './constants.js'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

export const card = {
  background: T.surf,
  borderRadius: 12,
  border: `1px solid ${T.border}`,
  padding: "28px",
  boxShadow: "none",
}
export const cardFlat = {
  background: T.surf2,
  borderRadius: 10,
  border: `1px solid ${T.border}`,
  padding: "14px 16px",
}
export const inp = {
  width:"100%", padding:"10px 14px", borderRadius:8,
  border:`1px solid ${T.border}`, fontSize:13, color:T.text,
  outline:"none", background:T.surf, boxSizing:"border-box",
  fontFamily:"inherit", transition:"border-color .15s, box-shadow .15s",
}
export const lbl = {
  display:"block", fontSize:10, fontWeight:600, color:T.muted,
  marginBottom:6, textTransform:"uppercase", letterSpacing:".08em",
}
export const btnPrimary = {
  background:T.text, color:"#fff", border:"none", borderRadius:8,
  padding:"9px 18px", fontSize:13, fontWeight:600, cursor:"pointer",
  display:"flex", alignItems:"center", gap:7,
  fontFamily:"inherit", transition:"opacity .15s", letterSpacing:"-.1px",
}
export const btnGreen  = btnPrimary
export const btnRed    = { ...btnPrimary, background:"#fff", color:T.red,   border:`1px solid ${T.border}` }
export const btnGhost  = { ...btnPrimary, background:"#fff", color:T.text2, border:`1px solid ${T.border}` }
export const btnSmall  = { ...btnPrimary, padding:"5px 12px", fontSize:12, borderRadius:7 }

const THEME = {
  green:   { bg:T.greenBg,   accent:T.green,   light:"rgba(26,122,74,.12)" },
  red:     { bg:T.redBg,     accent:T.red,     light:"rgba(201,32,32,.10)" },
  amber:   { bg:T.amberBg,   accent:T.amber,   light:"rgba(196,123,10,.10)" },
  blue:    { bg:T.blueBg,    accent:T.blue,    light:"rgba(29,82,196,.10)" },
  violet:  { bg:T.violetBg,  accent:T.violet,  light:"rgba(107,51,212,.10)" },
  default: { bg:T.surf2, accent:T.muted, light:T.surf3 },
}
function getTheme(color) {
  if (!color) return THEME.default
  const c = color.toString()
  if (c.includes("1A7A4A")||c.includes("16A34A")||c.includes("059669")) return THEME.green
  if (c.includes("C92020")||c.includes("DC2626")||c.includes("B91C1C")) return THEME.red
  if (c.includes("C47B0A")||c.includes("D97706")) return THEME.amber
  if (c.includes("1D52C4")||c.includes("2563EB")||c.includes("3B82F6")) return THEME.blue
  if (c.includes("6B33D4")||c.includes("7C3AED")||c.includes("8B5CF6")) return THEME.violet
  return THEME.default
}

/* ── KPI — tamaños monumentales, editorial ── */
export function KPI({ title, value, sub, icon:Icon, color, badge, spark, trend, hero }) {
  const th = getTheme(color)

  if (hero) {
    return (
      <div style={{
        background: T.text, borderRadius: 12,
        padding: "28px 32px",
        display: "flex", flexDirection: "column",
        position: "relative", overflow: "hidden",
      }}>
        {/* Texture overlay */}
        <div style={{
          position: "absolute", inset: 0, opacity: .04,
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,1) 1px, transparent 0)",
          backgroundSize: "20px 20px",
          pointerEvents: "none",
        }} />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: 20 }}>
          <span style={{ fontSize:10, fontWeight:600, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:".1em" }}>{title}</span>
          {Icon && (
            <div style={{ width:26, height:26, borderRadius:6, background:"rgba(255,255,255,.08)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Icon size={12} color="rgba(255,255,255,.5)" />
            </div>
          )}
        </div>
        <div style={{ fontSize:42, fontWeight:700, color:"#FFFFFF", letterSpacing:"-2px", fontFamily:"'DM Mono',monospace", lineHeight:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{value}</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginTop:16 }}>
          <div>
            {sub && <div style={{ fontSize:11, color:"rgba(255,255,255,.35)" }}>{sub}</div>}
            {trend !== undefined && trend !== null && (
              <div style={{ fontSize:11, fontWeight:600, color:trend>=0?"#4ade80":"#f87171", marginTop:4 }}>
                {trend>=0?"↑":"↓"} {Math.abs(trend)}% vs mes ant.
              </div>
            )}
          </div>
          {spark && (
            <div style={{ width:72, height:28, flexShrink:0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spark}>
                  <Line type="monotone" dataKey="v" stroke="rgba(255,255,255,.4)" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ ...card, padding:"22px 24px", display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, gap:8 }}>
        <span style={{ fontSize:10, fontWeight:600, color:T.muted, textTransform:"uppercase", letterSpacing:".09em", lineHeight:1.4, minWidth:0 }}>{title}</span>
        {badge ? (
          <span style={{ fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:20, background:badge.bg||th.light, color:badge.color||th.accent, whiteSpace:"nowrap", flexShrink:0, letterSpacing:".03em" }}>{badge.label}</span>
        ) : Icon ? (
          <div style={{ width:26, height:26, borderRadius:7, background:th.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Icon size={12} color={th.accent} />
          </div>
        ) : null}
      </div>
      <div style={{ fontSize:32, fontWeight:700, color:T.text, letterSpacing:"-1.5px", fontFamily:"'DM Mono',monospace", lineHeight:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{value}</div>
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

/* ── Pill de estado — con punto de color ── */
export function Pill({ s }) {
  const m = {
    Pagado:    { bg:"rgba(26,122,74,.08)",   c:"#1A7A4A", dot:"#1A7A4A" },
    Pendiente: { bg:"rgba(196,123,10,.08)",  c:"#C47B0A", dot:"#C47B0A" },
    Parcial:   { bg:"rgba(29,82,196,.08)",   c:"#1D52C4", dot:"#1D52C4" },
    Vencida:   { bg:"rgba(201,32,32,.08)",   c:"#C92020", dot:"#C92020" },
  }
  const st = m[s]||m.Pendiente
  return (
    <span style={{
      fontSize:10, fontWeight:600, padding:"3px 9px 3px 7px",
      borderRadius:20, background:st.bg, color:st.c,
      whiteSpace:"nowrap", display:"inline-flex", alignItems:"center", gap:5,
      letterSpacing:".02em",
    }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:st.dot, display:"inline-block", flexShrink:0 }} />
      {s}
    </span>
  )
}

export function StatusBar({ items }) {
  return (
    <div style={{ display:"flex", background:T.surf, border:`1px solid ${T.border}`, borderRadius:12, overflow:"hidden" }}>
      {items.map(({ label, value, color, bg }, i) => (
        <div key={label} style={{ flex:1, padding:"20px 24px", borderRight:i<items.length-1?`1px solid ${T.border}`:"none", background:bg||T.surf }}>
          <div style={{ fontSize:10, fontWeight:600, color:T.muted, textTransform:"uppercase", letterSpacing:".09em", marginBottom:8 }}>{label}</div>
          <div style={{ fontSize:22, fontWeight:700, color:color||T.text, fontFamily:"'DM Mono',monospace", letterSpacing:"-.5px" }}>{value}</div>
        </div>
      ))}
    </div>
  )
}

export function AlertBanner({ icon, title, sub, color, bg, border, action, onAction }) {
  return (
    <div style={{ background:bg||"rgba(196,123,10,.06)", border:`1px solid ${border||"rgba(196,123,10,.25)"}`, borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
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
    <div style={{ textAlign:"center", padding:"72px 24px", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
      {Icon && (
        <div style={{ width:52, height:52, borderRadius:12, background:T.surf2, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:8 }}>
          <Icon size={22} color={T.muted} />
        </div>
      )}
      <div style={{ fontSize:15, fontWeight:600, color:T.text, letterSpacing:"-.2px" }}>{title}</div>
      {sub && <div style={{ fontSize:13, color:T.muted, maxWidth:300, lineHeight:1.7 }}>{sub}</div>}
      {action && <button onClick={onAction} style={{ ...btnPrimary, marginTop:16 }}>{action}</button>}
    </div>
  )
}

export function Tip({ active, payload, label }) {
  if (!active||!payload?.length) return null
  return (
    <div style={{ background:T.text, borderRadius:10, padding:"10px 16px", boxShadow:"0 12px 40px rgba(0,0,0,.25)" }}>
      <div style={{ color:"rgba(255,255,255,.35)", fontSize:9, marginBottom:8, fontWeight:600, textTransform:"uppercase", letterSpacing:".1em" }}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{ color:"#fff", fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:10, marginBottom:i<payload.length-1?5:0, fontFamily:"'DM Mono',monospace" }}>
          <span style={{ width:6, height:6, borderRadius:2, background:p.color, display:"inline-block", flexShrink:0 }}/>
          <span style={{ color:"rgba(255,255,255,.35)", minWidth:56, fontSize:11 }}>{p.name}</span>
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
  office:  { label:"Of", color:"#C47B0A", bg:"rgba(196,123,10,.1)" },
  wifi:    { label:"Wi", color:"#1D52C4", bg:"rgba(29,82,196,.1)" },
  globe:   { label:"Gl", color:T.green,   bg:"rgba(26,122,74,.1)" },
  spotify: { label:"Sp", color:T.green,   bg:"rgba(26,122,74,.1)" },
  default: { label:"·",  color:T.muted,   bg:T.surf2   },
}

export function SectionTitle({ title, sub, action, onAction }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:18 }}>
      <div>
        <div style={{ fontSize:13, fontWeight:600, color:T.text, letterSpacing:"-.2px" }}>{title}</div>
        {sub && <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{sub}</div>}
      </div>
      {action && (
        <button onClick={onAction} style={{ fontSize:11, fontWeight:600, color:T.muted, background:"none", border:"none", cursor:"pointer", padding:0, letterSpacing:".02em" }}>{action} →</button>
      )}
    </div>
  )
}

export function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${T.border}`, marginBottom:24 }}>
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)} style={{
          background:"none", border:"none", cursor:"pointer", fontFamily:"inherit",
          fontSize:13, fontWeight:active===t?600:400,
          color:active===t?T.text:T.muted,
          padding:"0 18px 12px", marginBottom:-1,
          borderBottom:active===t?`2px solid ${T.text}`:"2px solid transparent",
          transition:"color .15s, border-color .15s",
          whiteSpace:"nowrap", letterSpacing:"-.1px",
        }}>{t}</button>
      ))}
    </div>
  )
}
