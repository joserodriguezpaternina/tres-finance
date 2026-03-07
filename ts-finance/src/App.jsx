import { useState, useEffect, useMemo } from 'react'
import {
  LayoutDashboard, TrendingUp, TrendingDown, BarChart2,
  Wallet, RefreshCw, Plus, ChevronLeft, ChevronRight,
  Bell, Menu, X, FileSpreadsheet, FileText, Users
} from 'lucide-react'
import { T, MONTHS, calcFin, filterM, uid } from './constants.js'
import { hasSupabase } from './supabase.js'
import { incomeService, expenseService, recurringService } from './dataService.js'
import { btnGreen, btnRed, btnGhost } from './ui.jsx'
import { exportExcel, exportPDF } from './exportService.js'
import ClientsView from './views/Clients.jsx'
import { clientService, syncClientsFromIncomes } from './clientService.js'
import { computeMissingExpenses } from './recurringSync.js'
import Dashboard from './views/Dashboard.jsx'
import { IncomesView, ExpensesView } from './views/IncExp.jsx'
import RecurringView from './views/Recurring.jsx'
import { ReportsView, CashFlowView } from './views/ReportsCashflow.jsx'
import { IncomeModal, ExpenseModal, RecurringModal, ClientModalWrapper } from './Modals.jsx'

const NAV = [
  { id: "dashboard",   label: "Dashboard",     icon: LayoutDashboard },
  { id: "ingresos",    label: "Ingresos",       icon: TrendingUp },
  { id: "egresos",     label: "Egresos",        icon: TrendingDown },
  { id: "recurrentes", label: "Recurrentes",    icon: RefreshCw },
  { id: "clientes",    label: "Clientes",       icon: Users },
  { id: "reportes",    label: "Reportes",       icon: BarChart2 },
  { id: "flujo",       label: "Flujo de caja",  icon: Wallet },
]

export default function App() {
  const [view, setView]               = useState("dashboard")
  const [incomes, setIncomes]         = useState([])
  const [expenses, setExpenses]       = useState([])
  const [recurring, setRecurr]        = useState([])
  const [loading, setLoading]         = useState(true)
  const [modal, setModal]             = useState(null)
  const [month, setMonth]             = useState(new Date().getMonth())
  const [clients, setClients] = useState([])
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
      // Auto-sync recurring → expenses
      const syncedExp = await syncRecurring(rec, exp)
      setExpenses(syncedExp)
      // Auto-sync clients from incomes
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
    // Auto-add client if new
    const exists = clients.find(c => c.name.toLowerCase() === d.client.toLowerCase())
    if (!exists && d.client.trim()) {
      const nc = { id: uid(), name: d.client, email: "", phone: "", nit: "", contacto: "", notas: "" }
      setClients(await clientService.upsert(nc))
    }
    setModal(null)
  }
  const saveExpense   = async d => { setExpenses(await expenseService.upsert(d));   setModal(null) }
  const saveRecurring = async d => {
    const updated = await recurringService.upsert(d)
    setRecurr(updated)
    // Re-sync: may need to add or skip expenses
    const now = new Date()
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
      // Was paused, now active → sync missing expenses
      const now = new Date()
      const synced = await syncRecurring(updated, expenses)
      setExpenses(synced)
    }
  }

  // ── Sync recurring → expenses ──────────────────────────
  const syncRecurring = async (rec, exp) => {
    const now = new Date()
    const upToYear  = now.getFullYear()
    const upToMonth = now.getMonth() // 0-indexed
    const missing = computeMissingExpenses(rec, exp, upToYear, upToMonth)
    if (missing.length === 0) return exp
    let current = [...exp]
    for (const item of missing) {
      current = await expenseService.upsert(item)
    }
    return current
  }

  const navTo = id => { setView(id); setSidebarOpen(false) }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{height:100%;font-family:'Inter',sans-serif;background:${T.bg};color:${T.text}}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${T.border2};border-radius:10px}
        input,select{background:${T.surf2};color:${T.text};font-family:'Inter',sans-serif}
        input:focus,select:focus{border-color:${T.green}!important;outline:none;box-shadow:0 0 0 3px ${T.greenBg}!important}
        button{transition:opacity .15s;font-family:'Inter',sans-serif}
        button:hover{opacity:.82}
        ::placeholder{color:${T.muted}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}

        .app-layout{display:flex;height:100vh;overflow:hidden}
        .sidebar{width:210px;background:${T.surf};border-right:1px solid ${T.border};display:flex;flex-direction:column;flex-shrink:0;z-index:100;transition:transform .25s ease}
        .overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:99;backdrop-filter:blur(2px)}
        .main-area{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
        .topbar{background:${T.surf};border-bottom:1px solid ${T.border};padding:10px 20px;display:flex;align-items:center;gap:8px;flex-shrink:0}
        .hactions{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
        .menuBtn{display:none!important}
        .mobile-right{display:none!important}
        .btnText{}

        /* KPI grids */
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
          .mobile-right{display:flex!important}
          .topbar{padding:0;flex-direction:column;align-items:stretch;gap:0}
          .topbar-row1{display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid ${T.border}}
          .topbar-row2{display:flex!important;align-items:center;justify-content:space-between;padding:8px 14px;gap:8px;background:${T.surf}}
          .hactions{display:none!important}
          .g4{grid-template-columns:1fr 1fr;gap:10px}
          .g3{grid-template-columns:1fr 1fr;gap:10px}
          main.content{padding:12px!important}
          .btnText{display:none}
        }
        @media(max-width:480px){
          .g4{grid-template-columns:1fr 1fr;gap:8px}
          .g3{grid-template-columns:1fr;gap:8px}
          .monthLabel{display:none}
          .mobile-right{display:none!important}
        }
      `}</style>

      <div className="app-layout">
        {/* Mobile overlay */}
        <div className={`overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
          <div style={{ padding: "16px 14px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: T.surf2, border: `1.5px solid ${T.green}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: T.green }}>T3</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.white }}>Tres Studio</div>
              <div style={{ fontSize: 10, color: T.muted }}>Finanzas {year}</div>
            </div>
          </div>

          <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
            {NAV.map(v => {
              const active = view === v.id
              return (
                <button key={v.id} onClick={() => navTo(v.id)} style={{
                  display: "flex", alignItems: "center", gap: 9, padding: "9px 10px",
                  borderRadius: 9, border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                  background: active ? T.surf2 : "transparent",
                  color: active ? T.white : T.muted, fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  borderLeft: active ? `2px solid ${T.green}` : "2px solid transparent",
                }}>
                  <v.icon size={15} color={active ? T.green : T.muted} />
                  {v.label}
                  {v.id === "ingresos" && pending > 0 && (
                    <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, background: T.amberBg, color: T.amber, padding: "2px 6px", borderRadius: 10 }}>{pending}</span>
                  )}
                  {v.id === "recurrentes" && (
                    <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, background: T.redBg, color: T.red, padding: "2px 6px", borderRadius: 10 }}>{recurring.filter(r => r.active).length}</span>
                  )}
                </button>
              )
            })}
          </nav>

          <div style={{ padding: "12px 14px", borderTop: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: hasSupabase ? T.green : T.amber }} />
              <span style={{ fontSize: 11, color: T.muted }}>{hasSupabase ? "Supabase sync" : "Modo local"}</span>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main-area">
          <header className="topbar">
            {/* ROW 1 */}
            <div className="topbar-row1" style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
            <button className="menuBtn" onClick={() => setSidebarOpen(true)} style={{ background: T.surf2, border: `1px solid ${T.border}`, borderRadius: 8, width: 34, height: 34, alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <Menu size={15} color={T.text2} />
            </button>
            <h1 style={{ fontSize: 14, fontWeight: 600, color: T.white, flex: 1 }}>
              {NAV.find(v => v.id === view)?.label}
            </h1>
            <div className="hactions">
              {/* Month picker */}
              <div style={{ display: "flex", alignItems: "center", gap: 5, background: T.surf2, borderRadius: 8, padding: "6px 10px", border: `1px solid ${T.border}` }}>
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

              {/* Export Excel */}
              <button onClick={() => exportExcel({ incomes: monthInc, expenses: monthExp, month, year })}
                style={{ ...btnGhost, padding: "6px 11px", fontSize: 12, gap: 5 }} title="Exportar Excel">
                <FileSpreadsheet size={13} color={T.green} />
                <span className="btnText">Excel</span>
              </button>

              {/* Export PDF */}
              <button onClick={() => exportPDF({ incomes: monthInc, expenses: monthExp, month, year })}
                style={{ ...btnGhost, padding: "6px 11px", fontSize: 12, gap: 5 }} title="Exportar PDF">
                <FileText size={13} color={T.red} />
                <span className="btnText">PDF</span>
              </button>

              <button onClick={() => setModal({ type: "income" })} style={{ ...btnGreen, padding: "6px 11px", fontSize: 12, gap: 5 }}>
                <Plus size={13} />
                <span className="btnText">Ingreso</span>
              </button>
              <button onClick={() => setModal({ type: "expense" })} style={{ ...btnRed, padding: "6px 11px", fontSize: 12, gap: 5 }}>
                <Plus size={13} />
                <span className="btnText">Egreso</span>
              </button>

              <div style={{ position: "relative", width: 32, height: 32, borderRadius: 8, background: T.surf2, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                <Bell size={14} color={T.muted} />
                {pending > 0 && <span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: T.red, border: `2px solid ${T.surf}` }} />}
              </div>
            </div>
            </div>{/* end row1 */}

            {/* ROW 2: mobile only */}
            <div className="topbar-row2">
              <div style={{ display: "flex", alignItems: "center", gap: 4, background: T.surf2, borderRadius: 8, padding: "7px 10px", border: `1px solid ${T.border}`, flex: 1 }}>
                <button onClick={() => setMonth(m => (m - 1 + 12) % 12)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex", padding: 2 }}><ChevronLeft size={14} /></button>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.text, flex: 1, textAlign: "center" }}>{MONTHS[month]} {year}</span>
                <button onClick={() => setMonth(m => (m + 1) % 12)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex", padding: 2 }}><ChevronRight size={14} /></button>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => exportExcel({ incomes: monthInc, expenses: monthExp, month, year })} style={{ background: T.surf2, border: `1px solid ${T.border}`, borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><FileSpreadsheet size={14} color={T.green} /></button>
                <button onClick={() => exportPDF({ incomes: monthInc, expenses: monthExp, month, year })} style={{ background: T.surf2, border: `1px solid ${T.border}`, borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><FileText size={14} color={T.red} /></button>
                <button onClick={() => setModal({ type: "income" })} style={{ ...btnGreen, padding: "0 12px", height: 36, fontSize: 12, gap: 5, borderRadius: 8 }}><Plus size={14} />Ingreso</button>
                <button onClick={() => setModal({ type: "expense" })} style={{ ...btnRed, padding: "0 12px", height: 36, fontSize: 12, gap: 5, borderRadius: 8 }}><Plus size={14} />Egreso</button>
              </div>
            </div>
          </header>

          <main className="content" style={{ flex: 1, overflowY: "auto", padding: 20 }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 12 }}>
                <div style={{ width: 32, height: 32, border: `3px solid ${T.border}`, borderTopColor: T.green, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <span style={{ color: T.muted, fontSize: 13 }}>Cargando datos...</span>
              </div>
            ) : (
              <>
                {view === "dashboard"    && <Dashboard   fin={fin} incomes={monthInc} expenses={monthExp} allInc={incomes} allExp={expenses} month={month} year={year} />}
                {view === "ingresos"     && <IncomesView  incomes={monthInc}  onAdd={() => setModal({ type: "income" })}    onEdit={d => setModal({ type: "income",    data: d })} onDelete={deleteItem} />}
                {view === "egresos"      && <ExpensesView expenses={monthExp} onAdd={() => setModal({ type: "expense" })}   onEdit={d => setModal({ type: "expense",   data: d })} onDelete={deleteItem} />}
                {view === "recurrentes"  && <RecurringView recurring={recurring} expenses={expenses} onAdd={() => setModal({ type: "recurring" })} onEdit={d => setModal({ type: "recurring", data: d })} onDelete={deleteRecurring} onToggle={toggleRecurring} />}
                {view === "clientes"     && <ClientsView clients={clients} incomes={incomes} onAdd={() => setModal({ type: "client" })} onEdit={d => setModal({ type: "client", data: d })} onDelete={deleteClient} />}
                {view === "reportes"     && <ReportsView   allInc={incomes} allExp={expenses} year={year} />}
                {view === "flujo"        && <CashFlowView  allInc={incomes} allExp={expenses} year={year} />}
              </>
            )}
          </main>
        </div>
      </div>

      {modal?.type === "income"    && <IncomeModal    initial={modal.data} onSave={saveIncome}    onClose={() => setModal(null)} clients={clients} />}
      {modal?.type === "expense"   && <ExpenseModal   initial={modal.data} onSave={saveExpense}   onClose={() => setModal(null)} />}
      {modal?.type === "recurring" && <RecurringModal initial={modal.data} onSave={saveRecurring} onClose={() => setModal(null)} />}
      {modal?.type === "client"    && <ClientModalWrapper initial={modal.data} onSave={saveClient} onClose={() => setModal(null)} />}
    </>
  )
}
