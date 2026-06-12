/* ─── Auditoría y trazabilidad ────────────────────────────────────────────
   Registro local append-only de cada operación del sistema.
   API: logAudit(action, entity, detail, meta) · getAudit() · clearAudit()
   Acciones: crear | editar | eliminar | pagar | activar | pausar | importar | config
   ─────────────────────────────────────────────────────────────────────── */
const KEY = "tf_audit"
const MAX = 600   /* conserva los últimos N eventos */

const read  = () => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }
const write = v  => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }

export function logAudit(action, entity, detail = "", meta = {}) {
  const rec = {
    id: Math.random().toString(36).slice(2, 10),
    ts: new Date().toISOString(),
    user: "José Studio",
    action, entity, detail, meta,
  }
  write([rec, ...read()].slice(0, MAX))
  return rec
}

export const getAudit   = () => read()
export const clearAudit = () => write([])
