import { useState, useEffect, useMemo } from 'react'
import {
  LayoutDashboard, TrendingUp, TrendingDown, BarChart2,
  RefreshCw, Plus, ChevronLeft, ChevronRight,
  Bell, Menu, FileSpreadsheet, FileText, Users, BookOpen
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
import AccountingView from './views/AccountingView.jsx'

const NAV_GROUPS = [
  {
    label: "Principal",
    items: [
      { id: "dashboard",   label: "Inicio",            icon: LayoutDashboard },
      { id: "contabilidad",label: "Contabilidad",      icon: BookOpen },
      { id: "ingresos",    label: "Ingresos",          icon: TrendingUp },
      { id: "egresos",     label: "Egresos",           icon: TrendingDown },
    ]
  },
  {
    label: "Gestión",
    items: [
      { id: "recurrentes", label: "Recurrentes",       icon: RefreshCw },
      { id: "clientes",    label: "Clientes",          icon: Users },
      { id: "reportes",    label: "Reportes",          icon: BarChart2 },
      { id: "importar",    label: "Importar",          icon: FileSpreadsheet },
    ]
  },
]

const NAV = NAV_GROUPS.flatMap(g => g.items)

const TresLogo = () => (
  <svg viewBox="0 0 1675 1675" style={{ width: 28, height: 28, flexShrink: 0 }} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M837.607 363.741C1048.32 363.741 1240.76 414.671 1381.48 498.375C1521.56 581.706 1615 700.811 1615 837.721C1615 974.626 1521.57 1093.73 1381.49 1177.06C1241.25 1260.49 1049.62 1311.36 839.728 1311.7C839.013 1311.75 838.293 1311.78 837.566 1311.78C626.861 1311.77 434.429 1260.82 293.723 1177.1C153.644 1093.75 60.2149 974.624 60.2148 837.721C60.2148 700.811 153.652 581.706 293.739 498.375C434.454 414.671 626.895 363.741 837.607 363.741ZM837.607 420.623C635.381 420.623 453.345 469.618 322.819 547.262C191.666 625.278 117.098 728.942 117.098 837.721C117.098 946.497 191.663 1050.18 322.81 1128.21C452.89 1205.61 634.13 1254.56 835.531 1254.9C836.23 1254.84 836.936 1254.82 837.646 1254.82C1039.86 1254.81 1221.89 1205.81 1352.41 1128.17C1483.55 1050.16 1558.12 946.495 1558.12 837.721C1558.12 728.942 1483.55 625.278 1352.39 547.262C1221.87 469.619 1039.83 420.623 837.607 420.623ZM601.944 696.784H772.853V587.68H852.841V696.784H1023.75V587.68H1103.74V696.784H1212.08V766.598H1103.74V984.806C1103.74 1011.76 1120.41 1027.02 1144.43 1027.02H1212.08V1096.83H1137.18C1063.04 1096.83 1023.75 1064.79 1023.75 989.894V766.598H852.841V984.806C852.841 1011.76 869.509 1027.02 893.538 1027.02H961.188V1096.83H886.286C812.143 1096.83 772.853 1064.79 772.853 989.894V766.598H601.944V984.806C601.944 1011.76 618.614 1027.02 642.643 1027.02H710.291V1096.83H635.391C561.247 1096.83 521.956 1064.79 521.956 989.894V766.598H456.473V696.784H521.956V587.68H601.944V696.784Z" fill="#101011"/>
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
  const year = 2026

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

  return (
    <>
      <style>{`
        @font-face{font-family:'AcidGrotesk';src:url('/fonts/AcidGrotesk-Light.otf') format('opentype');font-weight:300;font-display:swap}
@font-face{font-family:'AcidGrotesk';src:url('/fonts/AcidGrotesk-Regular.otf') format('opentype');font-weight:400;font-display:swap}
@font-face{font-family:'AcidGrotesk';src:url('/fonts/AcidGrotesk-Medium.otf') format('opentype');font-weight:500;font-display:swap}
@font-face{font-family:'AcidGrotesk';src:url('/fonts/AcidGrotesk-Bold.otf') format('opentype');font-weight:700;font-display:swap}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{height:100%;font-family:'Inter',sans-serif;background:${T.bg};color:${T.text}}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${T.border2};border-radius:10px}
        input,select{background:${T.surf};color:${T.text};font-family:'AcidGrotesk',sans-serif;border:1px solid ${T.border}}
        input:focus,select:focus{border-color:#101011!important;outline:none;box-shadow:0 0 0 3px rgba(16,16,17,.06)!important}
        button{transition:opacity .15s;font-family:'AcidGrotesk',sans-serif}
        button:hover{opacity:.8}
        ::placeholder{color:${T.muted}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}
        .app-layout{display:flex;height:100vh;overflow:hidden}
        .sidebar{width:216px;background:${T.surf};border-right:1px solid ${T.border};display:flex;flex-direction:column;flex-shrink:0;z-index:100;transition:transform .25s ease}
        .overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:99;backdrop-filter:blur(2px)}
        .main-area{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
        .topbar{background:${T.surf};border-bottom:1px solid ${T.border};padding:10px 20px;display:flex;align-items:center;gap:8px;flex-shrink:0}
        .hactions{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
        .menuBtn{display:none!important}
        .topbar-row2{display:none}
        .btnText{}
        .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
        .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
        .gc{display:grid;grid-template-columns:2fr 1fr;gap:14px}
        .rg{display:grid;grid-template-columns:1fr 280px;gap:14px}
        @media(max-width:900px){
          .g4{grid-template-columns:repeat(2,1fr)}
          .g3{grid-template-columns:repeat(2,1fr)}
          .gc{grid-template-columns:1fr}
          .rg{grid-template-columns:1fr}
        }
        @media(max-width:768px){
          .sidebar{position:fixed;top:0;left:0;height:100vh;transform:translateX(-100%)}
          .sidebar.open{transform:translateX(0);animation:slideIn .25s ease}
          .overlay.open{display:block}
          .menuBtn{display:flex!important}
          .topbar{padding:0;flex-direction:column;align-items:stretch;gap:0}
          .topbar-row1{display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid ${T.border}}
          .topbar-row2{display:flex!important;align-items:center;justify-content:space-between;padding:8px 14px;gap:8px}
          .hactions{display:none!important}
          .g4{grid-template-columns:1fr;gap:10px}
          .g3{grid-template-columns:1fr 1fr;gap:10px}
          main.content{padding:12px!important}
          .btnText{display:none}
        }
        @media(max-width:480px){
          .g4{grid-template-columns:1fr;gap:8px}
          .g3{grid-template-columns:1fr;gap:8px}
          .monthLabel{display:none}
        }
      `}</style>

      <div className="app-layout">
        <div className={`overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
          {/* Logo */}
          <div style={{ padding: "18px 16px 14px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
              <TresLogo />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#101011", letterSpacing: "-.3px" }}>tres Studio</div>
                <div style={{ fontSize: 10, color: T.muted, letterSpacing: ".02em" }}>Finanzas {year}</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "8px 8px", display: "flex", flexDirection: "column", gap: 0, overflowY: "auto" }}>
            {NAV_GROUPS.map(group => (
              <div key={group.label} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".1em", padding: "8px 10px 4px" }}>{group.label}</div>
                {group.items.map(v => {
                  const active = view === v.id
                  return (
                    <button key={v.id} onClick={() => navTo(v.id)} style={{
                      display: "flex", alignItems: "center", gap: 9, padding: "8px 10px",
                      borderRadius: 8, border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                      background: active ? T.text : "transparent",
                      color: active ? "#fff" : T.text2,
                      fontSize: 13, fontWeight: active ? 600 : 400,
                      transition: "background .12s, color .12s",
                    }}>
                      <v.icon size={14} color={active ? "#fff" : T.muted} />
                      {v.label}
                      {v.id === "ingresos" && pending > 0 && (
                        <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, background: active ? "rgba(255,255,255,.2)" : "#FEF3C7", color: active ? "#fff" : "#92400E", padding: "2px 6px", borderRadius: 10 }}>{pending}</span>
                      )}
                      {v.id === "recurrentes" && (
                        <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 600, background: active ? "rgba(255,255,255,.2)" : T.surf2, color: active ? "#fff" : T.muted, padding: "2px 6px", borderRadius: 10 }}>{recurring.filter(r => r.active).length}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </nav>

          {/* Status */}
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: hasSupabase ? "#166534" : "#92400E" }} />
              <span style={{ fontSize: 11, color: T.muted }}>{hasSupabase ? "Supabase sync" : "Modo local"}</span>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main-area">
          <header className="topbar">
            <div className="topbar-row1" style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
              <button className="menuBtn" onClick={() => setSidebarOpen(true)} style={{ background: T.surf2, border: `1px solid ${T.border}`, borderRadius: 8, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                <Menu size={15} color={T.text2} />
              </button>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, color: T.muted }}>Dashboard</span>
                <span style={{ fontSize: 12, color: T.muted }}>›</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#101011" }}>
                  {NAV.find(v => v.id === view)?.label}
                </span>
              </div>
              <div className="hactions">
                <div style={{ display: "flex", alignItems: "center", gap: 5, background: T.bg, borderRadius: 8, padding: "6px 10px", border: `1px solid ${T.border}` }}>
                  <button onClick={() => setMonth(m => (m - 1 + 12) % 12)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex", padding: 1 }}>
                    <ChevronLeft size={13} />
                  </button>
                  <span className="monthLabel" style={{ fontSize: 12, fontWeight: 600, color: T.text, minWidth: 96, textAlign: "center" }}>
                    {MONTHS[month]} {year}
                  </span>
                  <button onClick={() => setMonth(m => (m + 1) % 12)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex", padding: 1 }}>
                    <ChevronRight size={13} />
                  </button>
                </div>
                <button onClick={() => exportExcel({ incomes: monthInc, expenses: monthExp, month, year })} style={{ ...btnGhost, padding: "6px 11px", fontSize: 12, gap: 5 }}>
                  <FileSpreadsheet size={13} color={T.muted} />
                  <span className="btnText">Excel</span>
                </button>
                <button onClick={() => exportPDF({ incomes: monthInc, expenses: monthExp, month, year })} style={{ ...btnGhost, padding: "6px 11px", fontSize: 12, gap: 5 }}>
                  <FileText size={13} color={T.muted} />
                  <span className="btnText">PDF</span>
                </button>
                <button onClick={() => setModal({ type: "income" })} style={{ ...btnGreen, padding: "6px 14px", fontSize: 12, gap: 5 }}>
                  <Plus size={13} />
                  <span className="btnText">Ingreso</span>
                </button>
                <button onClick={() => setModal({ type: "expense" })} style={{ ...btnRed, padding: "6px 14px", fontSize: 12, gap: 5 }}>
                  <Plus size={13} />
                  <span className="btnText">Egreso</span>
                </button>
                <div style={{ position: "relative", width: 34, height: 34, borderRadius: 8, background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                  <Bell size={14} color={T.muted} />
                  {pending > 0 && <span style={{ position: "absolute", top: 7, right: 7, width: 6, height: 6, borderRadius: "50%", background: "#9B1C1C", border: `2px solid ${T.surf}` }} />}
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
                <button onClick={() => setModal({ type: "income" })} style={{ ...btnGreen, padding: "0 12px", height: 36, fontSize: 12, gap: 5, borderRadius: 8 }}><Plus size={14} />Ingreso</button>
                <button onClick={() => setModal({ type: "expense" })} style={{ ...btnRed, padding: "0 12px", height: 36, fontSize: 12, gap: 5, borderRadius: 8 }}><Plus size={14} />Egreso</button>
              </div>
            </div>
          </header>

          <main className="content" style={{ flex: 1, overflowY: "auto", padding: 20, background: T.bg }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 12 }}>
                <div style={{ width: 28, height: 28, border: `2px solid ${T.border}`, borderTopColor: "#101011", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <span style={{ color: T.muted, fontSize: 13 }}>Cargando datos...</span>
              </div>
            ) : (
              <>
                {view === "dashboard"      && <Dashboard fin={fin} incomes={monthInc} expenses={monthExp} allInc={incomes} allExp={expenses} month={month} year={year} onNavigate={navTo} />}
                {view === "contabilidad"   && <AccountingView allInc={incomes} allExp={expenses} year={year} month={month} />}
                {view === "ingresos"    && <IncomesView incomes={monthInc} onAdd={() => setModal({ type: "income" })} onEdit={d => setModal({ type: "income", data: d })} onDelete={deleteItem} />}
                {view === "egresos"     && <ExpensesView expenses={monthExp} onAdd={() => setModal({ type: "expense" })} onEdit={d => setModal({ type: "expense", data: d })} onDelete={deleteItem} />}
                {view === "recurrentes" && <RecurringView recurring={recurring} expenses={expenses} onAdd={() => setModal({ type: "recurring" })} onEdit={d => setModal({ type: "recurring", data: d })} onDelete={deleteRecurring} onToggle={toggleRecurring} />}
                {view === "clientes"    && <ClientsView clients={clients} incomes={incomes} onAdd={() => setModal({ type: "client" })} onEdit={d => setModal({ type: "client", data: d })} onDelete={deleteClient} />}
                {view === "reportes"    && <ReportsView allInc={incomes} allExp={expenses} year={year} />}
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
    </>
  )
}
