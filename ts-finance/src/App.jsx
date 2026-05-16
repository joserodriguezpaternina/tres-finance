import { useState, useEffect, useMemo } from 'react'
import {
  LayoutDashboard, TrendingUp, TrendingDown, BarChart2,
  RefreshCw, Plus, ChevronLeft, ChevronRight,
  Bell, Menu, FileSpreadsheet, FileText, Users, X
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
      { id: "dashboard",   label: "Inicio",            icon: LayoutDashboard },
      { id: "ingresos",    label: "Ingresos",          icon: TrendingUp },
      { id: "egresos",     label: "Egresos",           icon: TrendingDown },
      { id: "reportes",    label: "Reportes & Finanzas", icon: BarChart2 },
    ]
  },
  {
    label: "Gestión",
    items: [
      { id: "recurrentes", label: "Recurrentes",       icon: RefreshCw },
      { id: "clientes",    label: "Clientes",          icon: Users },
      { id: "importar",    label: "Importar",          icon: FileSpreadsheet },
    ]
  },
]

const NAV = NAV_GROUPS.flatMap(g => g.items)

const TresLogo = () => (
  <svg viewBox="0 0 1675 1675" style={{ width: 18, height: 18, flexShrink: 0 }} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M837.607 363.741C1048.32 363.741 1240.76 414.671 1381.48 498.375C1521.56 581.706 1615 700.811 1615 837.721C1615 974.626 1521.57 1093.73 1381.49 1177.06C1241.25 1260.49 1049.62 1311.36 839.728 1311.7C839.013 1311.75 838.293 1311.78 837.566 1311.78C626.861 1311.77 434.429 1260.82 293.723 1177.1C153.644 1093.75 60.2149 974.624 60.2148 837.721C60.2148 700.811 153.652 581.706 293.739 498.375C434.454 414.671 626.895 363.741 837.607 363.741ZM837.607 420.623C635.381 420.623 453.345 469.618 322.819 547.262C191.666 625.278 117.098 728.942 117.098 837.721C117.098 946.497 191.663 1050.18 322.81 1128.21C452.89 1205.61 634.13 1254.56 835.531 1254.9C836.23 1254.84 836.936 1254.82 837.646 1254.82C1039.86 1254.81 1221.89 1205.81 1352.41 1128.17C1483.55 1050.16 1558.12 946.495 1558.12 837.721C1558.12 728.942 1483.55 625.278 1352.39 547.262C1221.87 469.619 1039.83 420.623 837.607 420.623ZM601.944 696.784H772.853V587.68H852.841V696.784H1023.75V587.68H1103.74V696.784H1212.08V766.598H1103.74V984.806C1103.74 1011.76 1120.41 1027.02 1144.43 1027.02H1212.08V1096.83H1137.18C1063.04 1096.83 1023.75 1064.79 1023.75 989.894V766.598H852.841V984.806C852.841 1011.76 869.509 1027.02 893.538 1027.02H961.188V1096.83H886.286C812.143 1096.83 772.853 1064.79 772.853 989.894V766.598H601.944V984.806C601.944 1011.76 618.614 1027.02 642.643 1027.02H710.291V1096.83H635.391C561.247 1096.83 521.956 1064.79 521.956 989.894V766.598H456.473V696.784H521.956V587.68H601.944V696.784Z" fill={T.accent} />
  </svg>
)

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

  // Bottom nav: 5 most-used items
  const BOTTOM_NAV = [
    { id: "dashboard",   label: "Inicio",    icon: LayoutDashboard },
    { id: "ingresos",    label: "Ingresos",  icon: TrendingUp },
    { id: "egresos",     label: "Egresos",   icon: TrendingDown },
    { id: "reportes",    label: "Reportes",  icon: BarChart2 },
    { id: "clientes",    label: "Clientes",  icon: Users },
  ]

  useEffect(() => {
    Promise.all([
      incomeService.getAll(),
      expenseService.getAll(),
      recurringService.getAll(),
      clientService.getAll(),
    ]).then(async ([inc, exp, rec, cli]) => {
      setIncomes(inc); setRecurr(rec)
      const syncedExp = await syncRecurring(rec, exp)
      setExpenses(syncedExp)
      const merged = syncClientsFromIncomes(inc, cli)
      if (merged.length > cli.length) {
        merged.filter(m => !cli.find(x => x.id === m.id)).forEach(nc => clientService.upsert(nc))
      }
      setClients(merged)
    }).finally(() => setLoading(false))
  }, [])

  const monthInc = useMemo(() => filterM(incomes, month, year),  [incomes,  month, year])
  const monthExp = useMemo(() => filterM(expenses, month, year), [expenses, month, year])
  const fin      = useMemo(() => calcFin(monthInc, monthExp),    [monthInc, monthExp])
  const pending  = monthInc.filter(i => i.status === "Pendiente").length

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
    if (!r.active) {
      const synced = await syncRecurring(updated, expenses)
      setExpenses(synced)
    }
  }

  const syncRecurring = async (rec, exp) => {
    const now = new Date()
    const missing = computeMissingExpenses(rec, exp, now.getFullYear(), now.getMonth())
    if (missing.length === 0) return exp
    let current = [...exp]
    for (const item of missing) { current = await expenseService.upsert(item) }
    return current
  }

  const navTo = id => { setView(id); setSidebarOpen(false) }

  const markPaid = async id => {
    const inc = incomes.find(i => i.id === id)
    if (!inc) return
    setIncomes(await incomeService.upsert({ ...inc, status: "Pagado" }))
  }

  /* Pending count for all-time (not just month) */
  const allPending = incomes.filter(i => i.status === "Pendiente" || i.status === "Parcial").length

  return (
    <>
      <style>{`
        @font-face{font-family:'AcidGrotesk';src:url('/fonts/AcidGrotesk-Light.otf') format('opentype');font-weight:300;font-display:swap}
        @font-face{font-family:'AcidGrotesk';src:url('/fonts/AcidGrotesk-Regular.otf') format('opentype');font-weight:400;font-display:swap}
        @font-face{font-family:'AcidGrotesk';src:url('/fonts/AcidGrotesk-Medium.otf') format('opentype');font-weight:500;font-display:swap}
        @font-face{font-family:'AcidGrotesk';src:url('/fonts/AcidGrotesk-Bold.otf') format('opentype');font-weight:700;font-display:swap}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{height:100%;font-family:'AcidGrotesk','Inter',sans-serif;background:${T.bg};color:${T.text};-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${T.border2};border-radius:10px}
        input,select{background:${T.surf};color:${T.text};font-family:'AcidGrotesk',sans-serif;border:1px solid ${T.border};border-radius:10px}
        input:focus,select:focus{border-color:${T.accent}!important;outline:none;box-shadow:0 0 0 3px ${T.accentBg}!important}
        button{transition:opacity .15s;font-family:'AcidGrotesk',sans-serif}
        button:hover{opacity:.8}
        ::placeholder{color:${T.muted}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        /* ─── Layout ─── */
        .app-layout{display:flex;height:100vh;overflow:hidden}
        .sidebar{width:232px;background:${T.surf};border-right:1px solid ${T.border};display:flex;flex-direction:column;flex-shrink:0;z-index:100;transition:transform .28s cubic-bezier(.4,0,.2,1)}
        .overlay{display:none;position:fixed;inset:0;background:rgba(15,23,42,.4);z-index:99;backdrop-filter:blur(4px)}
        .main-area{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;max-width:100%}
        .topbar{background:${T.surf};border-bottom:1px solid ${T.border};padding:0 28px;height:58px;display:flex;align-items:center;gap:10px;flex-shrink:0;box-shadow:0 1px 0 ${T.border}}
        .hactions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .menuBtn{display:none!important}
        .topbar-row2{display:none}
        .btnText{}
        /* ─── Nav interactions ─── */
        .nav-item:hover{background:${T.sideHov}!important;color:${T.text2}!important}
        .nav-item:hover svg{color:${T.subtle}!important}
        /* ─── Grid utilities ─── */
        .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        .g2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .g2-1{display:grid;grid-template-columns:2fr 1fr;gap:16px}
        .g3-2{display:grid;grid-template-columns:3fr 2fr;gap:16px}
        .gc{display:grid;grid-template-columns:2fr 1fr;gap:16px}
        .rg{display:grid;grid-template-columns:1fr 280px;gap:16px}
        .g4>*,.g3>*,.g2>*,.g2-1>*,.g3-2>*,.gc>*,.rg>*{min-width:0}
        /* ─── Scrollable chips ─── */
        .chip-scroll{display:flex;gap:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;flex-shrink:0;padding-bottom:2px}
        .chip-scroll::-webkit-scrollbar{display:none}
        /* ─── Table scroll ─── */
        .tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%}
        main.content{overflow-x:clip}
        /* ─── Responsive 900px ─── */
        @media(max-width:900px){
          .g4{grid-template-columns:repeat(2,1fr)}
          .g3{grid-template-columns:repeat(2,1fr)}
          .g3-2{grid-template-columns:1fr}
          .g2-1{grid-template-columns:1fr}
          .gc{grid-template-columns:1fr}
          .rg{grid-template-columns:1fr}
        }
        /* ─── Responsive 768px (mobile) ─── */
        @media(max-width:768px){
          .sidebar{position:fixed;top:0;left:0;height:100vh;transform:translateX(-100%);box-shadow:none}
          .sidebar.open{transform:translateX(0);animation:slideIn .28s cubic-bezier(.4,0,.2,1);box-shadow:16px 0 48px rgba(15,23,42,.12)}
          .overlay.open{display:block}
          .menuBtn{display:flex!important}
          .topbar{padding:0;flex-direction:column;align-items:stretch;height:auto;gap:0;box-shadow:none}
          .topbar-row1{display:flex;align-items:center;gap:8px;padding:10px 16px;border-bottom:1px solid ${T.border}}
          .topbar-row2{display:flex!important;align-items:center;justify-content:space-between;padding:8px 16px;gap:8px;background:${T.bg}}
          .hactions{display:none!important}
          .g4{grid-template-columns:1fr 1fr;gap:12px}
          .g3{grid-template-columns:1fr 1fr;gap:12px}
          .g2{grid-template-columns:1fr}
          main.content{padding:16px!important;padding-bottom:76px!important}
          .btnText{display:none}
          .bottom-nav{display:flex!important}
          .col-hide-mobile{display:none!important}
        }
        @media(max-width:480px){
          .g4{grid-template-columns:1fr;gap:12px}
          .g3{grid-template-columns:1fr;gap:12px}
          .monthLabel{display:none}
        }
        @media(max-width:360px){
          .g4,.g3{grid-template-columns:1fr;gap:10px}
        }
        /* ─── Bottom nav ─── */
        .bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:200;background:${T.surf};border-top:1px solid ${T.border};height:62px;align-items:stretch;box-shadow:0 -1px 12px rgba(15,23,42,.06)}
        .bnav-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;background:none;border:none;cursor:pointer;padding:6px 2px;font-family:inherit;transition:background .15s;min-width:0;position:relative}
        .bnav-item:hover{background:${T.surf2}}
        .bnav-item.active{background:${T.accentBg}}
        .bnav-item.active::before{content:'';position:absolute;top:0;left:20%;right:20%;height:2px;background:${T.accent};border-radius:0 0 2px 2px}
        /* ─── FAB ─── */
        .quick-fab{display:none;position:fixed;bottom:70px;right:16px;z-index:201}
        @media(max-width:768px){.quick-fab{display:block}}
      `}</style>

      <div className="app-layout">
        <div className={`overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
          {/* Brand */}
          <div style={{ padding: "20px 18px 16px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <TresLogo />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: "-.3px" }}>tres Studio</div>
                <div style={{ fontSize: 11, color: T.muted }}>Finanzas · {year}</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", overflowY: "auto", gap: 2 }}>
            {NAV_GROUPS.map((group, gi) => (
              <div key={group.label} style={{ marginBottom: gi < NAV_GROUPS.length - 1 ? 20 : 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".1em", padding: "0 10px 6px" }}>{group.label}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {group.items.map(v => {
                    const active = view === v.id
                    return (
                      <button
                        key={v.id}
                        onClick={() => navTo(v.id)}
                        className={active ? undefined : "nav-item"}
                        style={{
                          display: "flex", alignItems: "center", gap: 9, padding: "9px 12px",
                          borderRadius: 10, border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                          background: active ? T.sideAct : "transparent",
                          color: active ? "#FFFFFF" : T.text2,
                          fontSize: 13, fontWeight: active ? 600 : 400,
                          transition: "background .15s, color .15s",
                        }}
                      >
                        <v.icon size={15} color={active ? "#FFFFFF" : T.subtle} strokeWidth={active ? 2.2 : 1.75} />
                        <span style={{ flex: 1 }}>{v.label}</span>
                        {v.id === "ingresos" && allPending > 0 && (
                          <span style={{ fontSize: 10, fontWeight: 700, background: active ? "rgba(255,255,255,.15)" : "#FEF3C7", color: active ? "#FFFFFF" : "#92400E", padding: "2px 7px", borderRadius: 10, minWidth: 20, textAlign: "center" }}>{allPending}</span>
                        )}
                        {v.id === "recurrentes" && recurring.filter(r => r.active).length > 0 && (
                          <span style={{ fontSize: 10, fontWeight: 600, background: T.surf2, color: T.muted, padding: "2px 7px", borderRadius: 10 }}>{recurring.filter(r => r.active).length}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer status */}
          <div style={{ padding: "14px 18px", borderTop: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: hasSupabase ? T.green : T.amber, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: T.muted }}>{hasSupabase ? "Sincronizado · Supabase" : "Guardado localmente"}</span>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main-area">
          <header className="topbar">
            <div className="topbar-row1" style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, height: "100%" }}>
              <button className="menuBtn" onClick={() => setSidebarOpen(true)} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 9, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                <Menu size={16} color={T.subtle} />
              </button>

              {/* Breadcrumb */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, color: T.muted }}>tres Studio</span>
                <span style={{ fontSize: 14, color: T.border2, fontWeight: 300, lineHeight: 1 }}>/</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: T.text, letterSpacing: "-.2px" }}>
                  {NAV.find(v => v.id === view)?.label}
                </span>
              </div>

              <div className="hactions">
                {/* Month selector */}
                <div style={{ display: "flex", alignItems: "center", gap: 4, background: T.bg, borderRadius: 8, padding: "5px 10px", border: `1px solid ${T.border}` }}>
                  <button onClick={() => setMonth(m => (m - 1 + 12) % 12)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex", padding: 2 }}>
                    <ChevronLeft size={12} />
                  </button>
                  <span className="monthLabel" style={{ fontSize: 12, fontWeight: 600, color: T.text, minWidth: 92, textAlign: "center" }}>
                    {MONTHS[month]} {year}
                  </span>
                  <button onClick={() => setMonth(m => (m + 1) % 12)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex", padding: 2 }}>
                    <ChevronRight size={12} />
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
                <button onClick={() => setModal({ type: "expense" })} style={{ ...btnRed, padding: "6px 14px", fontSize: 12, gap: 5 }}>
                  <Plus size={13} />
                  <span className="btnText">Egreso</span>
                </button>

                {/* Bell */}
                <div style={{ position: "relative", width: 34, height: 34, borderRadius: 8, background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                  <Bell size={14} color={T.muted} />
                  {allPending > 0 && (
                    <span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: T.amber, border: `2px solid ${T.surf}` }} />
                  )}
                </div>
              </div>
            </div>

            {/* Mobile row 2 */}
            <div className="topbar-row2">
              <div style={{ display: "flex", alignItems: "center", gap: 4, background: T.bg, borderRadius: 8, padding: "7px 10px", border: `1px solid ${T.border}`, flex: 1 }}>
                <button onClick={() => setMonth(m => (m - 1 + 12) % 12)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex", padding: 2 }}><ChevronLeft size={14} /></button>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.text, flex: 1, textAlign: "center" }}>{MONTHS[month]} {year}</span>
                <button onClick={() => setMonth(m => (m + 1) % 12)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex", padding: 2 }}><ChevronRight size={14} /></button>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setModal({ type: "income" })} style={{ ...btnGreen, padding: "0 12px", height: 36, fontSize: 12, gap: 4, borderRadius: 8 }}><Plus size={14} />Ingreso</button>
                <button onClick={() => setModal({ type: "expense" })} style={{ ...btnRed, padding: "0 12px", height: 36, fontSize: 12, gap: 4, borderRadius: 8 }}><Plus size={14} />Egreso</button>
              </div>
            </div>
          </header>

          <main className="content" style={{ flex: 1, overflowY: "auto", padding: "24px 28px", background: T.bg }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 12 }}>
                <div style={{ width: 28, height: 28, border: `2px solid ${T.border}`, borderTopColor: T.text, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
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
            <button
              key={v.id}
              className={`bnav-item${active ? " active" : ""}`}
              onClick={() => navTo(v.id)}
              style={{ position: 'relative' }}
            >
              <v.icon size={20} color={active ? T.accent : T.muted} strokeWidth={active ? 2.2 : 1.75} />
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, color: active ? T.accentText : T.muted, letterSpacing: '-.1px' }}>
                {v.label}
              </span>
              {v.id === "ingresos" && allPending > 0 && (
                <span style={{
                  position: 'absolute', top: 6, right: '18%', fontSize: 9, fontWeight: 700,
                  background: T.amber, color: '#fff', borderRadius: 8,
                  padding: '1px 5px', lineHeight: 1.4,
                }}>{allPending}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* ── MOBILE QUICK ACTION FAB ── */}
      <div className="quick-fab">
        {fabOpen && (
          <div style={{
            position: 'absolute', bottom: 56, right: 0,
            background: T.surf, border: `1px solid ${T.border}`,
            borderRadius: 14, padding: '6px', minWidth: 185,
            boxShadow: '0 8px 32px rgba(15,23,42,.14), 0 2px 8px rgba(15,23,42,.08)',
            display: 'flex', flexDirection: 'column', gap: 2,
            animation: 'fadeUp .15s ease',
          }}>
            <button
              onClick={() => { setModal({ type: "income" }); setFabOpen(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 9, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', width: '100%' }}
            >
              <div style={{ width: 30, height: 30, borderRadius: 8, background: T.greenBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={14} color={T.green} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>+ Ingreso</span>
            </button>
            <button
              onClick={() => { setModal({ type: "expense" }); setFabOpen(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 9, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', width: '100%' }}
            >
              <div style={{ width: 30, height: 30, borderRadius: 8, background: T.redBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingDown size={14} color={T.red} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>+ Egreso</span>
            </button>
          </div>
        )}
        <button
          onClick={() => setFabOpen(o => !o)}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: T.text, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,.18)',
            transition: 'transform .15s',
            transform: fabOpen ? 'rotate(45deg)' : 'none',
          }}
        >
          <Plus size={20} color="#fff" />
        </button>
      </div>
    </>
  )
}
