/* ─── PAGOS A TERCEROS — servicio local ──────────────────────────────────
   Prestadores de servicios + liquidación de pagos con retenciones
   colombianas (Retefuente · ReteIVA · ReteICA). localStorage-backed,
   siguiendo el patrón de src/dataService.js.
   ─────────────────────────────────────────────────────────────────────── */
import { UVT, RETEFUENTE, RETEIVA_RATE, RETEICA_TARIFAS } from './constants.js'

/* ── localStorage helpers ─────────────────────────────── */
const ls = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} },
}

const K_PRESTADORES = 'ts_prestadores'
const K_PAGOS       = 'ts_pagos_terceros'

/* ── Prestadores (proveedores de servicios / terceros) ───
   { id, nombre, nit, tipoPersona:"Natural"|"Jurídica", declarante:bool,
     regimen:"Responsable de IVA"|"No responsable de IVA"|"Régimen simple",
     email, telefono, ciudad, actividad, conceptoDefault, notas } */
export const prestadorService = {
  getAll() {
    return ls.get(K_PRESTADORES, [])
  },
  upsert(item) {
    const all  = ls.get(K_PRESTADORES, [])
    const next = all.find(p => p.id === item.id)
      ? all.map(p => p.id === item.id ? item : p)
      : [item, ...all]
    ls.set(K_PRESTADORES, next)
    return next
  },
  remove(id) {
    const next = ls.get(K_PRESTADORES, []).filter(p => p.id !== id)
    ls.set(K_PRESTADORES, next)
    return next
  },
}

/* ── Pagos a terceros (liquidaciones registradas) ────────
   { id, fecha, prestadorId, prestadorNombre, nit, concepto, conceptoId,
     bruto, iva, base, retefuente, reteiva, reteica, otras,
     totalRetenido, neto, metodo, soporte, folio, notas } */
export const pagoTerceroService = {
  getAll() {
    return ls.get(K_PAGOS, [])
  },
  add(item) {
    const next = [item, ...ls.get(K_PAGOS, [])]
    ls.set(K_PAGOS, next)
    return next
  },
  remove(id) {
    const next = ls.get(K_PAGOS, []).filter(p => p.id !== id)
    ls.set(K_PAGOS, next)
    return next
  },
}

/* ── Folio consecutivo "PT-2026-001" (reinicia cada año) ─ */
export function nextFolio(pagos = []) {
  const year = new Date().getFullYear()
  const re   = new RegExp(`^PT-${year}-(\\d+)$`)
  const max  = pagos.reduce((m, p) => {
    const hit = re.exec(p.folio || '')
    return hit ? Math.max(m, parseInt(hit[1], 10)) : m
  }, 0)
  return `PT-${year}-${String(max + 1).padStart(3, '0')}`
}

/* ── Motor de liquidación (función pura) ─────────────────
   Reglas:
   · base = bruto (el IVA se suma encima: total factura = bruto + iva)
   · iva  = aplicaIVA ? bruto × ivaP%
   · Retefuente: si el concepto tiene baseUVT > 0 solo aplica cuando
     base ≥ baseUVT × UVT; con baseUVT = 0 aplica siempre.
   · ReteIVA  = 15% sobre el IVA facturado (si aplica y hay IVA)
   · ReteICA  = base × (perMil / 1000) según tarifa municipal
   · neto = bruto + iva − (retefuente + reteiva + reteica + otras)
   Todos los valores redondeados a pesos (Math.round). */
export function calcRetenciones({
  bruto = 0, aplicaIVA = false, ivaP = 19, conceptoId,
  declarante = true, responsableIVA = false,
  aplicaReteIVA = false, aplicaReteICA = false, icaTarifaId,
  otras = 0,
} = {}) {
  const b        = Number(bruto) || 0
  const concepto = RETEFUENTE.find(c => c.id === conceptoId) || null
  const tarifa   = RETEICA_TARIFAS.find(t => t.id === icaTarifaId) || null

  const base = Math.round(b)
  const iva  = aplicaIVA ? Math.round(b * (Number(ivaP) || 0) / 100) : 0

  /* Retefuente — umbral de base mínima en UVT */
  const baseMinimaCOP   = concepto && concepto.baseUVT > 0 ? Math.round(concepto.baseUVT * UVT) : 0
  const superaUmbral    = !concepto ? false : (concepto.baseUVT > 0 ? base >= baseMinimaCOP : true)
  const aplicaBaseMinima = Boolean(concepto && concepto.baseUVT > 0 && base > 0 && base < baseMinimaCOP)
  const retefuente = concepto && superaUmbral ? Math.round(base * concepto.rate / 100) : 0

  /* ReteIVA — 15% del IVA facturado */
  const reteiva = aplicaReteIVA && iva > 0 ? Math.round(iva * RETEIVA_RATE / 100) : 0

  /* ReteICA — por mil sobre la base */
  const reteica = aplicaReteICA && tarifa ? Math.round(base * tarifa.perMil / 1000) : 0

  const otrasR        = Math.round(Number(otras) || 0)
  const totalRetenido = retefuente + reteiva + reteica + otrasR
  const neto          = base + iva - totalRetenido

  const breakdown = []
  if (concepto && retefuente > 0)
    breakdown.push({ label: `Retefuente — ${concepto.label}`, rate: `${concepto.rate}%`, base, value: retefuente })
  if (reteiva > 0)
    breakdown.push({ label: 'ReteIVA', rate: `${RETEIVA_RATE}% del IVA`, base: iva, value: reteiva })
  if (reteica > 0 && tarifa)
    breakdown.push({ label: `ReteICA — ${tarifa.label}`, rate: `${tarifa.perMil}×mil`, base, value: reteica })
  if (otrasR > 0)
    breakdown.push({ label: 'Otras deducciones', rate: '—', base, value: otrasR })

  return { base, iva, retefuente, reteiva, reteica, otras: otrasR, totalRetenido, neto, aplicaBaseMinima, baseMinimaCOP, breakdown }
}
