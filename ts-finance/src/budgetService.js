/* ─── Presupuestos — servicio local ──────────────────────────────────────
   Shape en localStorage ('ts_budgets'):
   { [year]: { metaIngresos:Number, cats: { [cat]: monthlyBudget:Number } } }
   API: getBudget(year) · setCatBudget(year, cat, value) · setMetaIngresos(year, value)
   ─────────────────────────────────────────────────────────────────────── */
const KEY = "ts_budgets"

const ls = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} },
}

const EMPTY = () => ({ metaIngresos: 0, cats: {} })

const readAll = () => {
  const all = ls.get(KEY, {})
  return all && typeof all === "object" ? all : {}
}

/* Devuelve el presupuesto del año (con defaults en cero, sin mutar storage) */
export function getBudget(year) {
  const b = readAll()[year]
  if (!b || typeof b !== "object") return EMPTY()
  return {
    metaIngresos: Number(b.metaIngresos) || 0,
    cats: b.cats && typeof b.cats === "object" ? { ...b.cats } : {},
  }
}

/* Fija el presupuesto mensual de una categoría → persiste y retorna el budget actualizado */
export function setCatBudget(year, cat, value) {
  const all = readAll()
  const b = getBudget(year)
  b.cats = { ...b.cats, [cat]: Math.max(0, Number(value) || 0) }
  all[year] = b
  ls.set(KEY, all)
  return b
}

/* Fija la meta anual de ingresos → persiste y retorna el budget actualizado */
export function setMetaIngresos(year, value) {
  const all = readAll()
  const b = getBudget(year)
  b.metaIngresos = Math.max(0, Number(value) || 0)
  all[year] = b
  ls.set(KEY, all)
  return b
}
