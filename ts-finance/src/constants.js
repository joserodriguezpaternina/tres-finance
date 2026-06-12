/* ─── DESIGN TOKENS — tres Finance® ERP ───────────────────────────────────
   Visual DNA: dark forest sidebar (#062F28) + lime accent (#9FE870)
   Neutrals are CSS variables → light/dark theme switch via
   <html data-theme="light|dark">. Semantic + brand colors are literal
   hexes (legible on both themes).
   ─────────────────────────────────────────────────────────────────────── */
export const T = {
  /* Canvas (theme-aware) */
  bg:        "var(--bg)",
  surf:      "var(--surf)",
  surf2:     "var(--surf2)",
  surf3:     "var(--surf3)",
  border:    "var(--border)",
  border2:   "var(--border2)",

  /* Text (theme-aware) */
  text:      "var(--text)",
  text2:     "var(--text2)",
  muted:     "var(--muted)",
  subtle:    "var(--subtle)",
  white:     "#FFFFFF",

  /* Primary — dark forest green */
  accent:    "#062F28",
  accentD:   "#041F1A",
  accentBg:  "rgba(6,47,40,.06)",
  accentBg2: "rgba(6,47,40,.12)",
  accentText:"#FFFFFF",

  /* Lime — brand highlight / active states */
  lime:      "#9FE870",
  limeD:     "#87D455",
  limeText:  "#27500A",
  limeBg:    "rgba(159,232,112,.18)",
  limeBorder:"rgba(159,232,112,.35)",

  /* Sidebar tokens (always dark) */
  side:      "#062F28",
  sideSurf:  "#083D33",
  sideBorder:"rgba(255,255,255,.08)",
  sideText:  "rgba(255,255,255,.9)",
  sideMuted: "rgba(255,255,255,.45)",
  sideActive:"rgba(159,232,112,.14)",
  sideHover: "rgba(255,255,255,.06)",

  /* Semantic (literal — legible on both themes) */
  green:     "#1E9E5A",
  greenD:    "#157A45",
  greenBg:   "rgba(30,158,90,.10)",
  greenBg2:  "rgba(30,158,90,.18)",
  red:       "#E5484D",
  redD:      "#C53438",
  redBg:     "rgba(229,72,77,.10)",
  redBg2:    "rgba(229,72,77,.18)",
  amber:     "#D97706",
  amberBg:   "rgba(217,119,6,.12)",
  blue:      "#2563EB",
  blueBg:    "rgba(37,99,235,.10)",
  violet:    "#7C5CFC",
  violetBg:  "rgba(124,92,252,.10)",
}

/* ─── Theme helpers ────────────────────────────────────────────────────── */
export const isDark   = () => typeof document !== "undefined" && document.documentElement.dataset.theme === "dark"
export const themeHex = (light, dark) => isDark() ? dark : light

/* ─── Chart palette (theme-aware via Proxy — recharts needs literal hex) ── */
const CHART_LIGHT = {
  inc:    "#062F28",
  exp:    "#9FE870",
  expS:   "#5FB35B",
  profit: "#1D9E75",
  acc:    "#87D455",
  neg:    "#E5484D",
  grid:   "#E6E6E3",
  tick:   "#8A8A86",
  scale:  ["#062F28","#1D6B52","#2C8A64","#5FB35B","#87D455","#C0E89A"],
}
const CHART_DARK = {
  inc:    "#9FE870",
  exp:    "#2C8A64",
  expS:   "#5FB35B",
  profit: "#4ADE96",
  acc:    "#87D455",
  neg:    "#F87171",
  grid:   "#27332E",
  tick:   "#8B958E",
  scale:  ["#9FE870","#6FCB7E","#4BAE85","#368B70","#2A6E5C","#1F5347"],
}
export const CHART = new Proxy({}, {
  get: (_, k) => (isDark() ? CHART_DARK : CHART_LIGHT)[k],
  ownKeys: () => Reflect.ownKeys(CHART_LIGHT),
  getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
})

export const MONTHS       = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
export const MONTHS_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
export const PAY_METHODS  = ["Transferencia","Efectivo","Tarjeta crédito","Tarjeta débito","Nequi","Daviplata"]
export const STATUS_LIST  = ["Pagado","Pendiente","Parcial"]
export const EXP_CATS     = ["Nómina","Honorarios","Proveedores","Arriendo","Servicios","Internet","Software y suscripciones","Publicidad","Producción","Casino","Transporte","Imprevistos","Impuestos","Otros"]
export const RECUR_FREQ   = ["Mensual","Bimestral","Trimestral","Semestral","Anual"]

/* ─── Tributario — Colombia 2026 ───────────────────────────────────────── */
export const UVT = 52374   /* UVT 2026 (COP) — configurable */

/* Conceptos de retención en la fuente (tarifas vigentes de referencia) */
export const RETEFUENTE = [
  { id:"honorarios_pj", label:"Honorarios y comisiones (PJ / PN declarante)", rate:11,  baseUVT:0  },
  { id:"honorarios_pn", label:"Honorarios (PN no declarante)",                rate:10,  baseUVT:0  },
  { id:"servicios_pj",  label:"Servicios generales (PJ / PN declarante)",     rate:4,   baseUVT:4  },
  { id:"servicios_pn",  label:"Servicios generales (PN no declarante)",       rate:6,   baseUVT:4  },
  { id:"arr_inmuebles", label:"Arrendamiento de bienes inmuebles",            rate:3.5, baseUVT:27 },
  { id:"arr_muebles",   label:"Arrendamiento de bienes muebles",              rate:4,   baseUVT:0  },
  { id:"compras",       label:"Compras generales (declarante)",               rate:2.5, baseUVT:27 },
  { id:"compras_nd",    label:"Compras generales (no declarante)",            rate:3.5, baseUVT:27 },
  { id:"transporte",    label:"Transporte de carga",                          rate:1,   baseUVT:4  },
  { id:"software",      label:"Licenciamiento / desarrollo de software",      rate:3.5, baseUVT:0  },
]
export const RETEIVA_RATE = 15   /* % sobre el IVA facturado */
export const RETEICA_TARIFAS = [
  { id:"servicios",  label:"Servicios — Bogotá (9,66 × mil)",   perMil:9.66  },
  { id:"comercial",  label:"Comercial — Bogotá (11,04 × mil)",  perMil:11.04 },
  { id:"industrial", label:"Industrial — Bogotá (6,9 × mil)",   perMil:6.9   },
  { id:"financiero", label:"Financiero — Bogotá (11,04 × mil)", perMil:11.04 },
]

/* Calendario de obligaciones tributarias 2026 (fechas de referencia,
   últimas según dígito de NIT — verificar calendario oficial DIAN) */
export const TAX_CALENDAR = [
  ...["2026-01-16","2026-02-17","2026-03-17","2026-04-17","2026-05-19","2026-06-17",
      "2026-07-17","2026-08-18","2026-09-17","2026-10-20","2026-11-18","2026-12-17"]
    .map((due, i) => ({ id:`rtf-${i}`, tipo:"Retefuente", entidad:"DIAN",
      label:`Declaración retención en la fuente — ${MONTHS[i]}`, periodo:MONTHS[i], due })),
  { id:"iva-1", tipo:"IVA", entidad:"DIAN", label:"IVA bimestre Ene–Feb", periodo:"Ene–Feb", due:"2026-03-17" },
  { id:"iva-2", tipo:"IVA", entidad:"DIAN", label:"IVA bimestre Mar–Abr", periodo:"Mar–Abr", due:"2026-05-19" },
  { id:"iva-3", tipo:"IVA", entidad:"DIAN", label:"IVA bimestre May–Jun", periodo:"May–Jun", due:"2026-07-17" },
  { id:"iva-4", tipo:"IVA", entidad:"DIAN", label:"IVA bimestre Jul–Ago", periodo:"Jul–Ago", due:"2026-09-17" },
  { id:"iva-5", tipo:"IVA", entidad:"DIAN", label:"IVA bimestre Sep–Oct", periodo:"Sep–Oct", due:"2026-11-18" },
  { id:"iva-6", tipo:"IVA", entidad:"DIAN", label:"IVA bimestre Nov–Dic", periodo:"Nov–Dic", due:"2027-01-19" },
  { id:"ica-1", tipo:"ICA", entidad:"SHD Bogotá", label:"ICA bimestre Ene–Feb", periodo:"Ene–Feb", due:"2026-03-31" },
  { id:"ica-2", tipo:"ICA", entidad:"SHD Bogotá", label:"ICA bimestre Mar–Abr", periodo:"Mar–Abr", due:"2026-05-29" },
  { id:"ica-3", tipo:"ICA", entidad:"SHD Bogotá", label:"ICA bimestre May–Jun", periodo:"May–Jun", due:"2026-07-31" },
  { id:"ica-4", tipo:"ICA", entidad:"SHD Bogotá", label:"ICA bimestre Jul–Ago", periodo:"Jul–Ago", due:"2026-09-30" },
  { id:"ica-5", tipo:"ICA", entidad:"SHD Bogotá", label:"ICA bimestre Sep–Oct", periodo:"Sep–Oct", due:"2026-11-30" },
  { id:"ica-6", tipo:"ICA", entidad:"SHD Bogotá", label:"ICA bimestre Nov–Dic", periodo:"Nov–Dic", due:"2027-01-29" },
  { id:"renta-1",  tipo:"Renta",   entidad:"DIAN", label:"Renta PJ — 1ª cuota",        periodo:"AG 2025", due:"2026-04-14" },
  { id:"renta-2",  tipo:"Renta",   entidad:"DIAN", label:"Renta PJ — 2ª cuota",        periodo:"AG 2025", due:"2026-06-12" },
  { id:"exogena",  tipo:"Exógena", entidad:"DIAN", label:"Información exógena AG 2025", periodo:"AG 2025", due:"2026-05-26" },
]

/* ─── Plan Único de Cuentas (mapa simplificado) ────────────────────────── */
export const PUC = {
  caja:        { code:"1105", name:"Caja / Bancos" },
  clientes:    { code:"1305", name:"Clientes (CxC)" },
  ivaGen:      { code:"2408", name:"IVA generado por pagar" },
  ivaDesc:     { code:"2408D",name:"IVA descontable" },
  proveedores: { code:"2335", name:"Costos y gastos por pagar (CxP)" },
  retefuente:  { code:"2365", name:"Retención en la fuente por pagar" },
  reteiva:     { code:"2367", name:"Retención de IVA por pagar" },
  reteica:     { code:"2368", name:"Retención de ICA por pagar" },
  ingresos:    { code:"4135", name:"Ingresos por servicios" },
  utilidad:    { code:"3605", name:"Utilidad del ejercicio" },
}
export const PUC_GASTOS = {
  "Nómina":                   { code:"5105", name:"Gastos de personal" },
  "Honorarios":               { code:"5110", name:"Honorarios" },
  "Impuestos":                { code:"5115", name:"Impuestos" },
  "Arriendo":                 { code:"5120", name:"Arrendamientos" },
  "Servicios":                { code:"5135", name:"Servicios" },
  "Internet":                 { code:"5135", name:"Servicios" },
  "Software y suscripciones": { code:"5135", name:"Servicios" },
  "Publicidad":               { code:"5237", name:"Publicidad y propaganda" },
  "Producción":               { code:"6135", name:"Costos de producción" },
  "Transporte":               { code:"5235", name:"Transporte, fletes y acarreos" },
  "Casino":                   { code:"5195", name:"Gastos diversos" },
  "Imprevistos":              { code:"5195", name:"Gastos diversos" },
  "Otros":                    { code:"5195", name:"Gastos diversos" },
}

export const DIAN_DEDUCIBLES = {
  "Nómina":                   { si: true,  label: "Deducible",   color: "#1E9E5A", nota: "Salarios, prestaciones y aportes parafiscales" },
  "Honorarios":               { si: true,  label: "Deducible",   color: "#1E9E5A", nota: "Requiere documento soporte DIAN o factura electrónica" },
  "Proveedores":              { si: true,  label: "Deducible",   color: "#1E9E5A", nota: "Con factura electrónica de venta del proveedor" },
  "Arriendo":                 { si: true,  label: "Deducible",   color: "#1E9E5A", nota: "Arrendamiento de inmuebles para actividad productora de renta" },
  "Servicios":                { si: true,  label: "Deducible",   color: "#1E9E5A", nota: "Requiere factura o documento soporte de adquisición" },
  "Internet":                 { si: true,  label: "Deducible",   color: "#1E9E5A", nota: "Servicios de telecomunicaciones ligados a la actividad" },
  "Software y suscripciones": { si: true,  label: "Deducible",   color: "#1E9E5A", nota: "Herramientas y plataformas necesarias para la actividad" },
  "Publicidad":               { si: true,  label: "Deducible",   color: "#1E9E5A", nota: "Gastos de marketing y publicidad con soporte" },
  "Producción":               { si: true,  label: "Deducible",   color: "#1E9E5A", nota: "Costos directos de producción y materiales" },
  "Transporte":               { si: true,  label: "Deducible",   color: "#1E9E5A", nota: "Con factura o documento equivalente. Aplica si es del negocio" },
  "Impuestos":                { si: "p",   label: "Parcial",     color: "#D97706", nota: "Solo ICA e impuesto predial del negocio. No el impuesto de renta" },
  "Imprevistos":              { si: "c",   label: "Condicional", color: "#D97706", nota: "Solo con soporte documental válido y causalidad demostrable" },
  "Casino":                   { si: false, label: "No deducible",color: "#E5484D", nota: "No reconocido como deducible por la DIAN" },
  "Otros":                    { si: "c",   label: "Condicional", color: "#D97706", nota: "Depende del soporte y la relación de causalidad. Consultar contador" },
}

export const DOC_TIPOS_SOPORTE = [
  "Factura electrónica", "Documento soporte DIAN (Res. 167/2021)",
  "Contrato de servicios", "Recibo de pago", "Comprobante de egreso", "Otro",
]

export const uid  = () => Math.random().toString(36).slice(2,9)
export const fmt  = (n = 0) => new Intl.NumberFormat("es-CO", { style:"currency", currency:"COP", minimumFractionDigits:0, maximumFractionDigits:0 }).format(n)
export const fmtS = (n = 0) => new Intl.NumberFormat("es-CO", { style:"currency", currency:"COP", minimumFractionDigits:0, maximumFractionDigits:0 }).format(n)
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
export const filterM  = (arr,m,y) => arr.filter(i=>{ const d=new Date(i.date); return d.getMonth()===m && d.getFullYear()===y })
export const freqMult = f => ({ Mensual:1, Bimestral:.5, Trimestral:.333, Semestral:.167, Anual:.083 }[f]||1)

/* Antigüedad de cartera → buckets de aging */
export const AGING_BUCKETS = ["Corriente","1–30 días","31–60 días","61–90 días","+90 días"]
export const agingBucket = (dateStr, now = new Date()) => {
  const days = Math.floor((now - new Date(dateStr)) / 86_400_000)
  if (days <= 0)  return 0
  if (days <= 30) return 1
  if (days <= 60) return 2
  if (days <= 90) return 3
  return 4
}

export const DEMO_INC = []; export const DEMO_EXP = []; export const DEMO_RECUR = []
