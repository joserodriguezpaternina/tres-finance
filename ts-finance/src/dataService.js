import { supabase, hasSupabase } from './supabase.js'
import { DEMO_INC, DEMO_EXP, DEMO_RECUR } from './constants.js'

/* ── localStorage helpers ─────────────────────────────── */
const ls = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} },
}

/* ── Normalize row from Supabase snake_case → camelCase ── */
const normInc = r => ({
  id: r.id, client: r.client, project: r.project, date: r.date,
  amount: Number(r.amount), hasIVA: r.has_iva, ivaP: Number(r.iva_p),
  status: r.status, method: r.method, notes: r.notes,
})
const normExp = r => ({
  id: r.id, date: r.date, cat: r.cat, sub: r.sub, desc: r.description,
  provider: r.provider, amount: Number(r.amount), hasIVA: r.has_iva,
  ivaP: Number(r.iva_p), method: r.method, obs: r.obs,
})
const normRec = r => ({
  id: r.id, name: r.name, cat: r.cat, amount: Number(r.amount),
  hasIVA: r.has_iva, ivaP: Number(r.iva_p), freq: r.freq,
  day: r.day_of_month, method: r.method, active: r.active,
  icon: r.icon_name, notes: r.notes,
})

/* ── Income service ───────────────────────────────────── */
export const incomeService = {
  async getAll() {
    if (!hasSupabase) return ls.get('ts_incomes', DEMO_INC)
    const { data } = await supabase.from('incomes').select('*').order('date', { ascending: false })
    return (data || []).map(normInc)
  },
  async upsert(item) {
    if (!hasSupabase) {
      const all = ls.get('ts_incomes', DEMO_INC)
      const next = all.find(i => i.id === item.id)
        ? all.map(i => i.id === item.id ? item : i)
        : [item, ...all]
      ls.set('ts_incomes', next)
      return next
    }
    await supabase.from('incomes').upsert({
      id: item.id, client: item.client, project: item.project, date: item.date,
      amount: item.amount, has_iva: item.hasIVA, iva_p: item.ivaP,
      status: item.status, method: item.method, notes: item.notes,
    })
    return incomeService.getAll()
  },
  async remove(id) {
    if (!hasSupabase) {
      const next = ls.get('ts_incomes', DEMO_INC).filter(i => i.id !== id)
      ls.set('ts_incomes', next)
      return next
    }
    await supabase.from('incomes').delete().eq('id', id)
    return incomeService.getAll()
  },
}

/* ── Expense service ──────────────────────────────────── */
export const expenseService = {
  async getAll() {
    if (!hasSupabase) return ls.get('ts_expenses', DEMO_EXP)
    const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false })
    return (data || []).map(normExp)
  },
  async upsert(item) {
    if (!hasSupabase) {
      const all = ls.get('ts_expenses', DEMO_EXP)
      const next = all.find(e => e.id === item.id)
        ? all.map(e => e.id === item.id ? item : e)
        : [item, ...all]
      ls.set('ts_expenses', next)
      return next
    }
    await supabase.from('expenses').upsert({
      id: item.id, date: item.date, cat: item.cat, sub: item.sub,
      description: item.desc, provider: item.provider, amount: item.amount,
      has_iva: item.hasIVA, iva_p: item.ivaP, method: item.method, obs: item.obs,
    })
    return expenseService.getAll()
  },
  async remove(id) {
    if (!hasSupabase) {
      const next = ls.get('ts_expenses', DEMO_EXP).filter(e => e.id !== id)
      ls.set('ts_expenses', next)
      return next
    }
    await supabase.from('expenses').delete().eq('id', id)
    return expenseService.getAll()
  },
}

/* ── Recurring service ────────────────────────────────── */
export const recurringService = {
  async getAll() {
    if (!hasSupabase) return ls.get('ts_recur', DEMO_RECUR)
    const { data } = await supabase.from('recurring').select('*').order('created_at')
    return (data || []).map(normRec)
  },
  async upsert(item) {
    if (!hasSupabase) {
      const all = ls.get('ts_recur', DEMO_RECUR)
      const next = all.find(r => r.id === item.id)
        ? all.map(r => r.id === item.id ? item : r)
        : [...all, item]
      ls.set('ts_recur', next)
      return next
    }
    await supabase.from('recurring').upsert({
      id: item.id, name: item.name, cat: item.cat, amount: item.amount,
      has_iva: item.hasIVA, iva_p: item.ivaP, freq: item.freq,
      day_of_month: item.day, method: item.method, active: item.active,
      icon_name: item.icon, notes: item.notes,
    })
    return recurringService.getAll()
  },
  async remove(id) {
    if (!hasSupabase) {
      const next = ls.get('ts_recur', DEMO_RECUR).filter(r => r.id !== id)
      ls.set('ts_recur', next)
      return next
    }
    await supabase.from('recurring').delete().eq('id', id)
    return recurringService.getAll()
  },
}
