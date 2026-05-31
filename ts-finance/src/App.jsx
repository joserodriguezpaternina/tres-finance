import { useState, useEffect, useMemo } from 'react'
import {
  LayoutDashboard, TrendingUp, TrendingDown, BarChart2,
  RefreshCw, Plus, ChevronLeft, ChevronRight,
  Bell, Menu, FileSpreadsheet, FileText, Users, X,
  ChevronDown, Settings, HelpCircle, Search, LogOut,
  Receipt, Zap, Wifi
} from 'lucide-react'
import { T, MONTHS, calcFin, filterM, uid } from './constants.js'
import { hasSupabase } from './supabase.js'
import { incomeService, expenseService, recurringService } from './dataService.js'
import { btnGreen, btnRed, btnGhost } from './ui.jsx'
import { exportExcel, exportPDF } from './exportService.js'
import ClientsView from './views/Clients.jsx'
import ImportView from './views/Import.jsx'
import { clientService, syncClientsFromIncomes } from './clientService.js'
import { computeMissingExpenses } from './recurringSync.js'
import Dashboard from './views/Dashboard.jsx'
import { IncomesView, ExpensesView } from './views/IncExp.jsx'
import RecurringView from './views/Recurring.jsx'
import { ReportsView } from './views/ReportsCashflow.jsx'
import { IncomeModal, ExpenseModal, RecurringModal, ClientModalWrapper } from './Modals.jsx'

const NAV_GROUPS = [
  {
    label: "Principal",
    items: [
      { id: "dashboard",   label: "Dashboard",    icon: LayoutDashboard },
      { id: "ingresos",    label: "Ingresos",     icon: TrendingUp },
      { id: "egresos",     label: "Egresos",      icon: TrendingDown },
      { id: "reportes",    label: "Reportes",     icon: BarChart2 },
    ]
  },
  {
    label: "Gestión",
    items: [
      { id: "recurrentes", label: "Recurrentes",  icon: RefreshCw },
      { id: "clientes",    label: "Clientes",     icon: Users },
      { id: "importar",    label: "Importar",     icon: FileSpreadsheet },
    ]
  },
]

const NAV = NAV_GROUPS.flatMap(g => g.items)

/* ── tres Studio Logo mark ─────────────────────────────────────────── */
const TresLogo = () => (
  <svg viewBox="0 0 32 32" style={{ width: 20, height: 20 }} fill="none">
    <rect width="32" height="32" rx="8" fill="#9FE870"/>
    <text x="16" y="22" textAnchor="middle" fontSize="13" fontWeight="800" fill="#062F28" fontFamily="system-ui,sans-serif">tf</text>
  </svg>
)

/* ── Page titles map ───────────────────────────────────────────────── */
const PAGE_META = {
  dashboard:   { title: "Dashboard",           sub: "Sistema operativo financiero" },
  ingresos:    { title: "Ingresos",            sub: "Registro y control de facturación" },
  egresos:     { title: "Egresos",             sub: "Gestión de gastos y costos" },
  reportes:    { title: "Reportes & Finanzas", sub: "Análisis financiero y flujo de caja" },
  recurrentes: { title: "Recurrentes",         sub: "Suscripciones y compromisos fijos" },
  clientes:    { title: "Clientes",            sub: "Directorio y cuentas por cobrar" },
  importar:    { title: "Importar",            sub: "Carga masiva de movimientos" },
}

export default function App() {
  const [view, setView]           = useState("dashboard")
  const [incomes, setIncomes]     = useState([])
  const [expenses, setExpenses]   = useState([])
  const [recurring, setRecurr]    = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(null)
  const [month, setMonth]         = useState(new Date().getMonth())
  const [clients, setClients]     = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [fabOpen, setFabOpen]         = useState(false)
  const year = 2026

  const BOTTOM_NAV = [
    { id: "dashboard",   label: "Inicio",    icon: LayoutDashboard },
    { id: "ingresos",    label: "Ingresos",  icon: TrendingUp },
    { id: "egresos",     label: "Egresos",   icon: TrendingDown },
    { id: "reportes",    label: "Reportes",  icon: BarChart2 },
    { id: "clientes",    label: "Clientes",  icon: Users },
  ]

  useEffect(() => {
    const load = async () => {
      try {
        const [inc, exp, rec, cli] = await Promise.all([
          incomeService.getAll().catch(() => []),
          expenseService.getAll().catch(() => []),
          recurringService.getAll().catch(() => []),
          clientService.getAll().catch(() => []),
        ])
        setIncomes(inc)
        setRecurr(rec)
        try {
          const syncedExp = await syncRecurring(rec, exp)
          setExpenses(syncedExp)
        } catch { setExpenses(exp) }
        try {
          const merged = syncClientsFromIncomes(inc, cli)
          if (merged.length > cli.length) {
            merged.filter(m => !cli.find(x => x.id === m.id)).forEach(nc => clientService.upsert(nc))
          }
          setClients(merged)
        } catch { setClients(cli) }
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const monthInc = useMemo(() => filterM(incomes, month, year),  [incomes,  month, year])
  const monthExp = useMemo(() => filterM(expenses, month, year), [expenses, month, year])
  const fin      = useMemo(() => calcFin(monthInc, monthExp),    [monthInc, monthExp])

  const saveIncome = async d => {
    const next = await incomeService.upsert(d)
    setIncomes(next)
    const exists = clients.find(c => c.name.toLowerCase() === d.client.toLowerCase())
    if (!exists && d.client.trim()) {
      const nc = { id: uid(), name: d.client, email: "", phone: "", nit: "", contacto: "", notas: "" }
      setClients(await clientService.upsert(nc))
    }
    setModal(null)
  }
  const saveExpense   = async d => { setExpenses(await expenseService.upsert(d)); setModal(null) }
  const saveRecurring = async d => {
    const updated = await recurringService.upsert(d)
    setRecurr(updated)
    const synced = await syncRecurring(updated, expenses)
    setExpenses(synced)
    setModal(null)
  }
  const deleteItem = async (id, tipo) => {
    if (!window.confirm(`¿Eliminar este ${tipo}?`)) return
    if (tipo === "ingreso") setIncomes(await incomeService.remove(id))
    else setExpenses(await expenseService.remove(id))
  }
  const saveClient = async d => { setClients(await clientService.upsert(d)); setModal(null) }
  const deleteClient = async id => {
    if (!window.confirm("¿Eliminar este cliente?")) return
    setClients(await clientService.remove(id))
  }
  const deleteRecurring = async id => {
    if (!window.confirm("¿Eliminar este gasto recurrente?")) return
    setRecurr(await recurringService.remove(id))
  }
  const toggleRecurring = async id => {
    const r = recurring.find(x => x.id === id)
    if (!r) return
    const updated = await recurringService.upsert({ ...r, active: !r.active })
    setRecurr(updated)
    if (!r.active) { const synced = await syncRecurring(updated, expenses); setExpenses(synced) }
  }
  const syncRecurring = async (rec, exp) => {
    const now = new Date()
    const missing = computeMissingExpenses(rec, exp, now.getFullYear(), now.getMonth())
    if (missing.length === 0) return exp
    let current = [...exp]
    for (const item of missing) { current = await expenseService.upsert(item) }
    return current
  }
  const navTo  = id => { setView(id); setSidebarOpen(false) }
  const markPaid = async id => {
    const inc = incomes.find(i => i.id === id)
    if (!inc) return
    setIncomes(await incomeService.upsert({ ...inc, status: "Pagado" }))
  }
  const allPending = incomes.filter(i => i.status === "Pendiente" || i.status === "Parcial").length
  const pageMeta = PAGE_META[view] || PAGE_META.dashboard

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{height:100%;font-family:'Plus Jakarta Sans','Inter',sans-serif;background:#EEECEA;color:#1A1A18;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#D0D0CC;border-radius:10px}
        input,select{background:#FFFFFF;color:#1A1A18;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid #E6E6E3;border-radius:10px}
        input:focus,select:focus{border-color:#062F28!important;outline:none;box-shadow:0 0 0 3px rgba(6,47,40,.08)!important}
        button{transition:opacity .15s;font-family:'Plus Jakarta Sans',sans-serif}
        button:hover{opacity:.88}
        ::placeholder{color:#8A8A86}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        /* ── Layout ── */
        .app-layout{display:flex;height:100vh;overflow:hidden;background:#EEECEA}
        /* ── Sidebar ── */
        .sidebar{width:220px;background:#062F28;display:flex;flex-direction:column;flex-shrink:0;z-index:100;transition:transform .28s cubic-bezier(.4,0,.2,1);border-radius:0 16px 16px 0}
        .overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:99}
        .main-area{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
        /* ── Topbar ── */
        .topbar{background:rgba(238,236,234,.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid #E6E6E3;padding:0 24px;height:60px;display:flex;align-items:center;gap:10px;flex-shrink:0}
        .hactions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .menuBtn{display:none!important}
        .topbar-row2{display:none}
        /* ── Sidebar nav item ── */
        .nav-item{border-radius:10px;color:rgba(255,255,255,.5);transition:background .12s,color .12s}
        .nav-item:hover{background:rgba(255,255,255,.06)!important;color:rgba(255,255,255,.9)!important}
        .nav-item-active{background:rgba(159,232,112,.14)!important;color:#9FE870!important;font-weight:700!important;border-radius:10px!important;border:none!important}
        /* ── Grid utilities ── */
        .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
        .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
        .g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .g2-1{display:grid;grid-template-columns:2fr 1fr;gap:14px}
        .g3-2{display:grid;grid-template-columns:3fr 2fr;gap:14px}
        .gc{display:grid;grid-template-columns:2fr 1fr;gap:14px}
        .rg{display:grid;grid-template-columns:1fr 280px;gap:14px}
        .g4>*,.g3>*,.g2>*,.g2-1>*,.g3-2>*,.gc>*,.rg>*{min-width:0}
        .chip-scroll{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none}
        .chip-scroll::-webkit-scrollbar{display:none}
        .tbl-wrap{overflow-x:auto}
        main.content{overflow-x:clip}
        /* ── Page header ── */
        .page-hdr{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:22px;gap:12px}
        .page-title{font-size:24px;font-weight:800;color:#1A1A18;letter-spacing:-.5px;line-height:1.15}
        .page-sub{font-size:13px;color:#8A8A86;margin-top:3px}
        /* ── Responsive 900px ── */
        @media(max-width:900px){
          .g4{grid-template-columns:repeat(2,1fr)}
          .g3{grid-template-columns:repeat(2,1fr)}
          .g3-2{grid-template-columns:1fr}
          .g2-1{grid-template-columns:1fr}
          .gc{grid-template-columns:1fr}
          .rg{grid-template-columns:1fr}
        }
        /* ── Responsive 768px ── */
        @media(max-width:768px){
          .sidebar{position:fixed;top:0;left:0;height:100vh;transform:translateX(-100%);box-shadow:none;border-radius:0 16px 16px 0}
          .sidebar.open{transform:translateX(0);box-shadow:24px 0 60px rgba(0,0,0,.2)}
          .overlay.open{display:block}
          .menuBtn{display:flex!important}
          .topbar{padding:0;flex-direction:column;height:auto}
          .topbar-row1{display:flex;align-items:center;gap:8px;padding:10px 16px;border-bottom:1px solid #E6E6E3;width:100%}
          .topbar-row2{display:flex!important;padding:8px 16px;gap:8px;background:#F5F5F3;width:100%}
          .hactions{display:none!important}
          .g4{grid-template-columns:1fr 1fr;gap:10px}
          .g3{grid-template-columns:1fr 1fr;gap:10px}
          .g2{grid-template-columns:1fr}
          main.content{padding:14px!important;padding-bottom:74px!important}
          .btnText{display:none}
          .bottom-nav{display:flex!important}
          .col-hide-mobile{display:none!important}
          .page-hdr{margin-bottom:16px}
          .page-title{font-size:19px}
          .quick-fab{display:block}
        }
        @media(max-width:480px){
          .g4{grid-template-columns:1fr;gap:10px}
          .g3{grid-template-columns:1fr;gap:10px}
          .monthLabel{display:none}
        }
        /* ── Bottom nav ── */
        .bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:200;background:#FFFFFF;border-top:1px solid #E6E6E3;height:62px;align-items:stretch}
        .bnav-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;background:none;border:none;cursor:pointer;padding:6px 2px;font-family:inherit;min-width:0;position:relative}
        .bnav-item:hover{background:#F5F5F3}
        .bnav-item.active::before{content:'';position:absolute;top:0;left:25%;right:25%;height:2px;background:#9FE870;border-radius:0 0 3px 3px}
        /* ── FAB ── */
        .quick-fab{display:none;position:fixed;bottom:70px;right:14px;z-index:201}
      `}</style>

      <div className="app-layout">
        <div className={`overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>

          {/* Brand */}
          <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", gap: 10 }}>
            <TresLogo />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-.2px", lineHeight: 1 }}>
                tres <span style={{ color: "#9FE870" }}>Finance®</span>
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)", marginTop: 2, letterSpacing: ".03em" }}>tres Studio® S.A.S.</div>
            </div>
          </div>

          {/* User card */}
          <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, background: "rgba(255,255,255,.06)", borderRadius: 10, padding: "9px 10px" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#9FE870", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#062F28", flexShrink: 0 }}>JS</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>José Studio</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>Fundador · Rep. Legal</div>
              </div>
              <ChevronDown size={13} color="rgba(255,255,255,.35)" style={{ flexShrink: 0 }} />
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "10px 10px", display: "flex", flexDirection: "column", overflowY: "auto", gap: 0 }}>
            {NAV_GROUPS.map((group, gi) => (
              <div key={group.label} style={{ marginTop: gi === 0 ? 0 : 18, marginBottom: 4 }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,.28)", textTransform: "uppercase", letterSpacing: ".09em", padding: "0 10px 7px" }}>{group.label}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {group.items.map(v => {
                    const active = view === v.id
                    return (
                      <button
                        key={v.id}
                        onClick={() => navTo(v.id)}
                        className={active ? "nav-item-active" : "nav-item"}
                        style={{
                          display: "flex", alignItems: "center", gap: 9,
                          padding: "8px 12px", border: "none", cursor: "pointer",
                          width: "100%", textAlign: "left", fontSize: 13,
                          fontFamily: "inherit", background: "transparent",
                          color: active ? "#9FE870" : "rgba(255,255,255,.52)",
                          fontWeight: active ? 700 : 400,
                        }}
                      >
                        <v.icon size={15} color={active ? "#9FE870" : "rgba(255,255,255,.4)"} strokeWidth={active ? 2.2 : 1.75} />
                        <span style={{ flex: 1 }}>{v.label}</span>
                        {v.id === "ingresos" && allPending > 0 && (
                          <span style={{ fontSize: 9, fontWeight: 700, background: active ? "rgba(159,232,112,.25)" : "#D97706", color: active ? "#9FE870" : "#fff", padding: "2px 6px", borderRadius: 7, minWidth: 16, textAlign: "center" }}>{allPending}</span>
                        )}
                        {v.id === "recurrentes" && recurring.filter(r => r.active).length > 0 && (
                          <span style={{ fontSize: 9, fontWeight: 600, background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.45)", padding: "2px 6px", borderRadius: 7 }}>{recurring.filter(r => r.active).length}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div style={{ padding: "10px 14px 16px", borderTop: "1px solid rgba(255,255,255,.08)" }}>
            {/* Status indicator */}
            <div style={{ background: "rgba(255,255,255,.05)", borderRadius: 10, padding: "11px 12px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: hasSupabase ? "#9FE870" : "#D97706", flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,.6)" }}>{hasSupabase ? "Supabase conectado" : "Modo local"}</span>
              </div>
              {!loading && (
                <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "'DM Mono',monospace" }}>
                  {incomes.length + expenses.length} <span style={{ fontWeight: 400, color: "rgba(255,255,255,.4)", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 10 }}>movimientos</span>
                </div>
              )}
            </div>
            {/* System links */}
            {[
              { icon: Settings, label: "Configuración" },
              { icon: HelpCircle, label: "Soporte" },
              { icon: LogOut, label: "Cerrar sesión" },
            ].map(({ icon: Ic, label }) => (
              <button key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: "transparent", border: "none", cursor: "pointer", width: "100%", fontFamily: "inherit", fontSize: 12, color: "rgba(255,255,255,.35)", borderRadius: 8 }}>
                <Ic size={13} color="rgba(255,255,255,.3)" strokeWidth={1.75} />
                {label}
              </button>
            ))}
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main-area">
          <header className="topbar">
            <div className="topbar-row1" style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, height: "100%", width: "100%" }}>
              <button className="menuBtn" onClick={() => setSidebarOpen(true)} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 8, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                <Menu size={15} color={T.muted} />
              </button>

              {/* Page title in topbar */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pageMeta.title}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{pageMeta.sub} · {MONTHS[month]} {year}</div>
              </div>

              <div className="hactions">
                {/* Month selector */}
                <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#FFFFFF", border: `1px solid ${T.border}`, borderRadius: 999, padding: "5px 12px" }}>
                  <button onClick={() => setMonth(m => (m - 1 + 12) % 12)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex", padding: 2 }}>
                    <ChevronLeft size={11} />
                  </button>
                  <span className="monthLabel" style={{ fontSize: 12, fontWeight: 600, color: T.text, minWidth: 94, textAlign: "center" }}>
                    {MONTHS[month]} {year}
                  </span>
                  <button onClick={() => setMonth(m => (m + 1) % 12)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex", padding: 2 }}>
                    <ChevronRight size={11} />
                  </button>
                </div>

                {/* Export */}
                <button onClick={() => exportExcel({ incomes: monthInc, expenses: monthExp, month, year })} style={{ ...btnGhost, padding: "5px 10px", fontSize: 12, gap: 4 }}>
                  <FileSpreadsheet size={13} color={T.muted} />
                  <span className="btnText">Excel</span>
                </button>
                <button onClick={() => exportPDF({ incomes: monthInc, expenses: monthExp, month, year })} style={{ ...btnGhost, padding: "5px 10px", fontSize: 12, gap: 4 }}>
                  <FileText size={13} color={T.muted} />
                  <span className="btnText">PDF</span>
                </button>

                {/* Quick create */}
                <button onClick={() => setModal({ type: "income" })} style={{ ...btnGreen, padding: "6px 14px", fontSize: 12, gap: 5 }}>
                  <Plus size={13} />
                  <span className="btnText">Ingreso</span>
                </button>
                <button onClick={() => setModal({ type: "expense" })} style={{ ...btnGhost, padding: "6px 14px", fontSize: 12, gap: 5, color: T.red }}>
                  <Plus size={13} />
                  <span className="btnText">Egreso</span>
                </button>

                {/* Bell + Avatar */}
                <button style={{ position: "relative", width: 34, height: 34, borderRadius: 999, background: "#FFFFFF", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                  <Bell size={14} color={T.muted} />
                  {allPending > 0 && (
                    <span style={{ position: "absolute", top: 7, right: 7, width: 6, height: 6, borderRadius: "50%", background: T.red, border: "2px solid #FFFFFF" }} />
                  )}
                </button>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#9FE870", flexShrink: 0 }}>JS</div>
              </div>
            </div>

            {/* Mobile row 2 */}
            <div className="topbar-row2">
              <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#FFFFFF", borderRadius: 8, padding: "6px 10px", border: `1px solid ${T.border}`, flex: 1 }}>
                <button onClick={() => setMonth(m => (m - 1 + 12) % 12)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex", padding: 2 }}><ChevronLeft size={13} /></button>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.text, flex: 1, textAlign: "center" }}>{MONTHS[month]} {year}</span>
                <button onClick={() => setMonth(m => (m + 1) % 12)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex", padding: 2 }}><ChevronRight size={13} /></button>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setModal({ type: "income" })} style={{ ...btnGreen, padding: "0 12px", height: 34, fontSize: 12, gap: 4, borderRadius: 8 }}><Plus size={13} />Ingreso</button>
                <button onClick={() => setModal({ type: "expense" })} style={{ ...btnRed, padding: "0 12px", height: 34, fontSize: 12, gap: 4, borderRadius: 8 }}><Plus size={13} />Egreso</button>
              </div>
            </div>
          </header>

          <main className="content" style={{ flex: 1, overflowY: "auto", padding: "28px", background: "#EEECEA", scrollbarWidth: "thin", scrollbarColor: "#D0D0CC transparent" }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 12 }}>
                <div style={{ width: 26, height: 26, border: `2px solid ${T.border}`, borderTopColor: T.accent, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <span style={{ color: T.muted, fontSize: 13 }}>Cargando datos...</span>
              </div>
            ) : (
              <>
                {view === "dashboard"   && <Dashboard fin={fin} incomes={monthInc} expenses={monthExp} allInc={incomes} allExp={expenses} month={month} year={year} onNavigate={navTo} />}
                {view === "ingresos"    && <IncomesView incomes={monthInc} allIncomes={incomes} onAdd={d => setModal({ type: "income", data: (d && typeof d === 'object') ? d : undefined })} onEdit={d => setModal({ type: "income", data: d })} onDelete={deleteItem} onMarkPaid={markPaid} />}
                {view === "egresos"     && <ExpensesView expenses={monthExp} allExpenses={expenses} onAdd={d => setModal({ type: "expense", data: (d && typeof d === 'object') ? d : undefined })} onEdit={d => setModal({ type: "expense", data: d })} onDelete={deleteItem} />}
                {view === "recurrentes" && <RecurringView recurring={recurring} expenses={expenses} onAdd={() => setModal({ type: "recurring" })} onEdit={d => setModal({ type: "recurring", data: d })} onDelete={deleteRecurring} onToggle={toggleRecurring} />}
                {view === "clientes"    && <ClientsView clients={clients} incomes={incomes} onAdd={() => setModal({ type: "client" })} onEdit={d => setModal({ type: "client", data: d })} onDelete={deleteClient} />}
                {view === "reportes"    && <ReportsView allInc={incomes} allExp={expenses} year={year} month={month} />}
                {view === "importar"    && <ImportView onImported={() => window.location.reload()} />}
              </>
            )}
          </main>
        </div>
      </div>

      {modal?.type === "income"    && <IncomeModal    initial={modal.data} onSave={saveIncome}    onClose={() => setModal(null)} clients={clients} incomes={incomes} />}
      {modal?.type === "expense"   && <ExpenseModal   initial={modal.data} onSave={saveExpense}   onClose={() => setModal(null)} expenses={expenses} />}
      {modal?.type === "recurring" && <RecurringModal initial={modal.data} onSave={saveRecurring} onClose={() => setModal(null)} />}
      {modal?.type === "client"    && <ClientModalWrapper initial={modal.data} onSave={saveClient} onClose={() => setModal(null)} />}

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="bottom-nav">
        {BOTTOM_NAV.map(v => {
          const active = view === v.id
          return (
            <button key={v.id} className={`bnav-item${active ? " active" : ""}`} onClick={() => navTo(v.id)} style={{ position: 'relative' }}>
              <v.icon size={19} color={active ? T.accent : T.muted} strokeWidth={active ? 2.2 : 1.75} />
              <span style={{ fontSize: 9, fontWeight: active ? 700 : 400, color: active ? T.accent : T.muted, letterSpacing: '-.1px' }}>{v.label}</span>
              {v.id === "ingresos" && allPending > 0 && (
                <span style={{ position: 'absolute', top: 6, right: '16%', fontSize: 8, fontWeight: 700, background: T.amber, color: '#fff', borderRadius: 7, padding: '1px 5px', lineHeight: 1.4 }}>{allPending}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* ── MOBILE FAB ── */}
      <div className="quick-fab">
        {fabOpen && (
          <div style={{ position: 'absolute', bottom: 52, right: 0, background: T.surf, border: `1px solid ${T.border}`, borderRadius: 12, padding: '6px', minWidth: 175, boxShadow: '0 8px 32px rgba(0,0,0,.14)', display: 'flex', flexDirection: 'column', gap: 2, animation: 'fadeUp .15s ease' }}>
            <button onClick={() => { setModal({ type: "income" }); setFabOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', width: '100%' }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: T.greenBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={13} color={T.green} /></div>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>+ Ingreso</span>
            </button>
            <button onClick={() => { setModal({ type: "expense" }); setFabOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', width: '100%' }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: T.redBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingDown size={13} color={T.red} /></div>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>+ Egreso</span>
            </button>
          </div>
        )}
        <button onClick={() => setFabOpen(o => !o)} style={{ width: 42, height: 42, borderRadius: '50%', background: T.accent, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,.2)', transition: 'transform .15s', transform: fabOpen ? 'rotate(45deg)' : 'none' }}>
          <Plus size={19} color="#9FE870" />
        </button>
      </div>
    </>
  )
}
