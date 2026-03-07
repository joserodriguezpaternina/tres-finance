import { useState, useEffect, useMemo } from 'react'
import {
  LayoutDashboard, TrendingUp, TrendingDown, BarChart2,
  Wallet, RefreshCw, Plus, ChevronLeft, ChevronRight, Bell, Database
} from 'lucide-react'
import { T, MONTHS, calcFin, filterM, uid } from './constants.js'
import { hasSupabase } from './supabase.js'
import { incomeService, expenseService, recurringService } from './dataService.js'
import { btnGreen, btnRed } from './ui.jsx'
import Dashboard from './views/Dashboard.jsx'
import { IncomesView, ExpensesView } from './views/IncExp.jsx'
import RecurringView from './views/Recurring.jsx'
import { ReportsView, CashFlowView } from './views/ReportsCashflow.jsx'
import { IncomeModal, ExpenseModal, RecurringModal } from './Modals.jsx'

const NAV = [
  { id: "dashboard",  label: "Dashboard",       icon: LayoutDashboard },
  { id: "ingresos",   label: "Ingresos",         icon: TrendingUp },
  { id: "egresos",    label: "Egresos",          icon: TrendingDown },
  { id: "recurrentes",label: "Recurrentes",      icon: RefreshCw },
  { id: "reportes",   label: "Reportes",         icon: BarChart2 },
  { id: "flujo",      label: "Flujo de caja",    icon: Wallet },
]

export default function App() {
  const [view, setView]         = useState("dashboard")
  const [incomes, setIncomes]   = useState([])
  const [expenses, setExpenses] = useState([])
  const [recurring, setRecurr] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)
  const [month, setMonth]       = useState(new Date().getMonth())
  const year = 2026

  /* Load data */
  useEffect(() => {
    Promise.all([
      incomeService.getAll(),
      expenseService.getAll(),
      recurringService.getAll(),
    ]).then(([inc, exp, rec]) => {
      setIncomes(inc); setExpenses(exp); setRecurr(rec)
    }).finally(() => setLoading(false))
  }, [])

  const monthInc = useMemo(() => filterM(incomes, month, year), [incomes, month, year])
  const monthExp = useMemo(() => filterM(expenses, month, year), [expenses, month, year])
  const fin      = useMemo(() => calcFin(monthInc, monthExp), [monthInc, monthExp])
  const pending  = monthInc.filter(i => i.status === "Pendiente").length

  /* CRUD handlers */
  const saveIncome = async data => {
    const next = await incomeService.upsert(data)
    setIncomes(next); setModal(null)
  }
  const saveExpense = async data => {
    const next = await expenseService.upsert(data)
    setExpenses(next); setModal(null)
  }
  const saveRecurring = async data => {
    const next = await recurringService.upsert(data)
    setRecurr(next); setModal(null)
  }
  const deleteItem = async (id, tipo) => {
    if (!window.confirm(`¿Eliminar este ${tipo}?`)) return
    if (tipo === "ingreso")  setIncomes(await incomeService.remove(id))
    else                     setExpenses(await expenseService.remove(id))
  }
  const deleteRecurring = async id => {
    if (!window.confirm("¿Eliminar este gasto recurrente?")) return
    setRecurr(await recurringService.remove(id))
  }
  const toggleRecurring = async id => {
    const r = recurring.find(x => x.id === id)
    if (!r) return
    setRecurr(await recurringService.upsert({ ...r, active: !r.active }))
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; font-family: 'Syne', sans-serif; background: ${T.bg}; color: ${T.text}; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border2}; border-radius: 10px; }
        input, select { background: ${T.surf2}; color: ${T.text}; }
        input:focus, select:focus { border-color: ${T.green} !important; outline: none; box-shadow: 0 0 0 3px ${T.greenBg} !important; }
        button { transition: opacity .15s; }
        button:hover { opacity: .82; }
        ::placeholder { color: ${T.muted}; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        {/* ── SIDEBAR ── */}
        <aside style={{ width: 210, background: T.surf, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          {/* Logo */}
          <div style={{ padding: "22px 18px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: T.surf2, border: `1.5px solid ${T.green}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: T.green, letterSpacing: "-0.5px" }}>T3</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.white, lineHeight: 1.2 }}>Tres Studio</div>
                <div style={{ fontSize: 10, color: T.muted, lineHeight: 1.2 }}>Finanzas {year}</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV.map(v => {
              const active = view === v.id
              return (
                <button key={v.id} onClick={() => setView(v.id)} style={{
                  display: "flex", alignItems: "center", gap: 9,
                  padding: "9px 10px", borderRadius: 9, border: "none",
                  cursor: "pointer", textAlign: "left", width: "100%",
                  background: active ? T.surf2 : "transparent",
                  color: active ? T.white : T.muted,
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  fontFamily: "'Syne',sans-serif",
                  borderLeft: active ? `2px solid ${T.green}` : "2px solid transparent",
                }}>
                  <v.icon size={15} color={active ? T.green : T.muted} />
                  {v.label}
                  {v.id === "ingresos" && pending > 0 && (
                    <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, background: T.amberBg, color: T.amber, padding: "2px 6px", borderRadius: 10 }}>{pending}</span>
                  )}
                  {v.id === "recurrentes" && (
                    <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, background: T.redBg, color: T.red, padding: "2px 6px", borderRadius: 10 }}>{recurring.filter(r=>r.active).length}</span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* DB status */}
          <div style={{ padding: "14px 16px", borderTop: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: hasSupabase ? T.green : T.amber, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: T.muted }}>{hasSupabase ? "Supabase conectado" : "Modo local"}</span>
            </div>
            {!hasSupabase && <div style={{ fontSize: 10, color: T.subtle, marginTop: 3 }}>Datos en este navegador</div>}
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: T.bg }}>
          {/* Header */}
          <header style={{ background: T.surf, borderBottom: `1px solid ${T.border}`, padding: "11px 24px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 14, fontWeight: 700, color: T.white, margin: 0 }}>
                {NAV.find(v => v.id === view)?.label}
              </h1>
            </div>

            {/* Month picker */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.surf2, borderRadius: 9, padding: "7px 12px", border: `1px solid ${T.border}` }}>
              <button onClick={() => setMonth(m => (m - 1 + 12) % 12)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: T.muted, padding: 2 }}>
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.text, minWidth: 110, textAlign: "center" }}>
                {MONTHS[month]} {year}
              </span>
              <button onClick={() => setMonth(m => (m + 1) % 12)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: T.muted, padding: 2 }}>
                <ChevronRight size={14} />
              </button>
            </div>

            <button onClick={() => setModal({ type: "income" })} style={{ ...btnGreen, padding: "8px 14px", fontSize: 12 }}>
              <Plus size={13} />Ingreso
            </button>
            <button onClick={() => setModal({ type: "expense" })} style={{ ...btnRed, padding: "8px 14px", fontSize: 12 }}>
              <Plus size={13} />Egreso
            </button>
            <div style={{ position: "relative", width: 34, height: 34, borderRadius: 9, background: T.surf2, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <Bell size={15} color={T.muted} />
              {pending > 0 && <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: T.red, border: `2px solid ${T.surf}` }} />}
            </div>
          </header>

          {/* Content */}
          <main style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 12 }}>
                <div style={{ width: 32, height: 32, border: `3px solid ${T.border}`, borderTopColor: T.green, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <span style={{ color: T.muted, fontSize: 13 }}>Cargando datos...</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              </div>
            ) : (
              <>
                {view === "dashboard"   && <Dashboard fin={fin} incomes={monthInc} expenses={monthExp} allInc={incomes} allExp={expenses} month={month} year={year} />}
                {view === "ingresos"    && <IncomesView incomes={monthInc} onAdd={() => setModal({ type: "income" })} onEdit={d => setModal({ type: "income", data: d })} onDelete={deleteItem} />}
                {view === "egresos"     && <ExpensesView expenses={monthExp} onAdd={() => setModal({ type: "expense" })} onEdit={d => setModal({ type: "expense", data: d })} onDelete={deleteItem} />}
                {view === "recurrentes" && <RecurringView recurring={recurring} onAdd={() => setModal({ type: "recurring" })} onEdit={d => setModal({ type: "recurring", data: d })} onDelete={deleteRecurring} onToggle={toggleRecurring} />}
                {view === "reportes"    && <ReportsView allInc={incomes} allExp={expenses} year={year} />}
                {view === "flujo"       && <CashFlowView allInc={incomes} allExp={expenses} year={year} />}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      {modal?.type === "income"    && <IncomeModal    initial={modal.data} onSave={saveIncome}    onClose={() => setModal(null)} />}
      {modal?.type === "expense"   && <ExpenseModal   initial={modal.data} onSave={saveExpense}   onClose={() => setModal(null)} />}
      {modal?.type === "recurring" && <RecurringModal initial={modal.data} onSave={saveRecurring} onClose={() => setModal(null)} />}
    </>
  )
}
