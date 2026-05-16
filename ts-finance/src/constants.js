/* ── DESIGN TOKENS — tres Studio ────────────────────── */
export const T = {
  /* ── Backgrounds ── */
  bg:       "#F1F5F9",   /* Slate-100  — content area  */
  surf:     "#FFFFFF",   /* Card / panel — pure white  */
  surf2:    "#F8FAFC",   /* Slate-50   — secondary     */
  surf3:    "#F1F5F9",   /* Slate-100  — tertiary      */

  /* ── Borders ── */
  border:   "#E2E8F0",   /* Slate-200  */
  border2:  "#CBD5E1",   /* Slate-300  */

  /* ── Text ── */
  muted:    "#94A3B8",   /* Slate-400  */
  subtle:   "#64748B",   /* Slate-500  */
  text2:    "#475569",   /* Slate-600  */
  text:     "#0F172A",   /* Slate-900  */
  white:    "#0F172A",   /* backward-compat alias */

  /* ── Primary accent (Indigo) ── */
  accent:    "#6366F1",  /* Indigo-500 */
  accentD:   "#4F46E5",  /* Indigo-600 */
  accentBg:  "rgba(99,102,241,.07)",
  accentBg2: "rgba(99,102,241,.14)",
  accentText:"#4338CA",  /* Indigo-700 — text on light */

  /* ── Sidebar (light, premium) ── */
  side:    "#FFFFFF",
  sideB:   "#E2E8F0",
  sideT:   "#0F172A",
  sideM:   "#94A3B8",
  sideHov: "#F8FAFC",
  sideAct: "rgba(99,102,241,.08)",

  /* ── Semantic ── */
  green:    "#16A34A",   /* Green-600  */
  greenD:   "#15803D",
  greenBg:  "rgba(22,163,74,.07)",
  greenBg2: "rgba(22,163,74,.14)",
  red:      "#DC2626",   /* Red-600    */
  redD:     "#B91C1C",
  redBg:    "rgba(220,38,38,.07)",
  redBg2:   "rgba(220,38,38,.14)",
  amber:    "#D97706",
  amberBg:  "rgba(217,119,6,.07)",
  blue:     "#3B82F6",   /* Blue-500   */
  blueBg:   "rgba(59,130,246,.07)",
  violet:   "#8B5CF6",   /* Violet-500 */
  violetBg: "rgba(139,92,246,.07)",
}

export const MONTHS       = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
export const MONTHS_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
export const PAY_METHODS  = ["Transferencia","Efectivo","Tarjeta crédito","Tarjeta débito","Nequi","Daviplata"]
export const STATUS_LIST  = ["Pagado","Pendiente","Parcial"]
export const EXP_CATS     = ["Nómina","Honorarios","Proveedores","Arriendo","Servicios","Internet","Software y suscripciones","Publicidad","Producción","Casino","Transporte","Imprevistos","Impuestos","Otros"]
export const RECUR_FREQ   = ["Mensual","Bimestral","Trimestral","Semestral","Anual"]

/* ── Reglas de deducibilidad DIAN ── */
export const DIAN_DEDUCIBLES = {
  "Nómina":                   { si: true,  label: "Deducible",   color: "#16A34A", nota: "Salarios, prestaciones y aportes parafiscales" },
  "Honorarios":               { si: true,  label: "Deducible",   color: "#16A34A", nota: "Requiere documento soporte DIAN o factura electrónica" },
  "Proveedores":              { si: true,  label: "Deducible",   color: "#16A34A", nota: "Con factura electrónica de venta del proveedor" },
  "Arriendo":                 { si: true,  label: "Deducible",   color: "#16A34A", nota: "Arrendamiento de inmuebles para actividad productora de renta" },
  "Servicios":                { si: true,  label: "Deducible",   color: "#16A34A", nota: "Requiere factura o documento soporte de adquisición" },
  "Internet":                 { si: true,  label: "Deducible",   color: "#16A34A", nota: "Servicios de telecomunicaciones ligados a la actividad" },
  "Software y suscripciones": { si: true,  label: "Deducible",   color: "#16A34A", nota: "Herramientas y plataformas necesarias para la actividad" },
  "Publicidad":               { si: true,  label: "Deducible",   color: "#16A34A", nota: "Gastos de marketing y publicidad con soporte" },
  "Producción":               { si: true,  label: "Deducible",   color: "#16A34A", nota: "Costos directos de producción y materiales" },
  "Transporte":               { si: true,  label: "Deducible",   color: "#16A34A", nota: "Con factura o documento equivalente. Aplica si es del negocio" },
  "Impuestos":                { si: "p",   label: "Parcial",     color: "#D97706", nota: "Solo ICA e impuesto predial del negocio. No el impuesto de renta" },
  "Imprevistos":              { si: "c",   label: "Condicional", color: "#D97706", nota: "Solo con soporte documental válido y causalidad demostrable" },
  "Casino":                   { si: false, label: "No deducible",color: "#DC2626", nota: "No reconocido como deducible por la DIAN" },
  "Otros":                    { si: "c",   label: "Condicional", color: "#D97706", nota: "Depende del soporte y la relación de causalidad. Consultar contador" },
}

export const DOC_TIPOS_SOPORTE = [
  "Factura electrónica",
  "Documento soporte DIAN (Res. 167/2021)",
  "Contrato de servicios",
  "Recibo de pago",
  "Comprobante de egreso",
  "Otro",
]

export const uid = () => Math.random().toString(36).slice(2,9)

export const fmt = (n = 0) =>
  new Intl.NumberFormat("es-CO", { style:"currency", currency:"COP", minimumFractionDigits:0, maximumFractionDigits:0 }).format(n)

export const fmtS = (n = 0) =>
  new Intl.NumberFormat("es-CO", { style:"currency", currency:"COP", minimumFractionDigits:0, maximumFractionDigits:0 }).format(n)

export const getIVA  = i => (i.hasIVA||i.has_iva) ? (i.amount*(i.ivaP||i.iva_p))/((i.ivaP||i.iva_p)+100) : 0
export const getBase = i => (i.hasIVA||i.has_iva) ? i.amount/(1+((i.ivaP||i.iva_p)/100)) : i.amount

export const calcFin = (inc, exp) => {
  const tI    = inc.reduce((s,i)=>s+Number(i.amount),0)
  const tIVAc = inc.reduce((s,i)=>s+getIVA(i),0)
  const tIb   = tI - tIVAc
  const cobr  = inc.filter(i=>i.status==="Pagado").reduce((s,i)=>s+Number(i.amount),0)
  const tE    = exp.reduce((s,e)=>s+Number(e.amount),0)
  const tIVAp = exp.reduce((s,e)=>s+getIVA(e),0)
  const tEb   = tE - tIVAp
  return { tI, tIVAc, tIb, cobr, tE, tIVAp, tEb, saldo:tI-tE, saldoB:tIb-tEb, ivaN:tIVAc-tIVAp, util:tIb-tEb, caja:cobr-tE }
}

export const filterM = (arr,m,y) => arr.filter(i=>{ const d=new Date(i.date); return d.getMonth()===m && d.getFullYear()===y })
export const freqMult = f => ({ Mensual:1, Bimestral:.5, Trimestral:.333, Semestral:.167, Anual:.083 }[f]||1)
export const DEMO_INC = []
export const DEMO_EXP = []
export const DEMO_RECUR = []
