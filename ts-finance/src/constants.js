/* ─── DESIGN TOKENS — tres Finance® Redesign ──────────────────────────────
   Visual DNA: dark forest sidebar (#062F28) + lime accent (#9FE870)
   Faithful to the Fynix reference images shared in the design brief
   ─────────────────────────────────────────────────────────────────────── */
export const T = {
  /* Canvas */
  bg:        "#EEECEA",
  surf:      "#FFFFFF",
  surf2:     "#F5F5F3",
  surf3:     "#EBEBEA",
  border:    "#E6E6E3",
  border2:   "#D0D0CC",

  /* Text */
  text:      "#1A1A18",
  text2:     "#3A3A37",
  muted:     "#8A8A86",
  subtle:    "#5A5A56",
  white:     "#FFFFFF",

  /* Primary — dark forest green sidebar */
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

  /* Sidebar tokens */
  side:      "#062F28",
  sideSurf:  "#083D33",
  sideBorder:"rgba(255,255,255,.08)",
  sideText:  "rgba(255,255,255,.9)",
  sideMuted: "rgba(255,255,255,.45)",
  sideActive:"rgba(159,232,112,.14)",
  sideHover: "rgba(255,255,255,.06)",

  /* Semantic */
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

/* ─── Chart palette ────────────────────────────────────────────────────── */
export const CHART = {
  inc:    "#062F28",
  exp:    "#9FE870",
  expS:   "#5FB35B",
  profit: "#1D9E75",
  acc:    "#87D455",
  neg:    "#E5484D",
  grid:   "#E6E6E3",
  scale:  ["#062F28","#1D6B52","#2C8A64","#5FB35B","#87D455","#C0E89A"],
}

export const MONTHS       = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
export const MONTHS_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
export const PAY_METHODS  = ["Transferencia","Efectivo","Tarjeta crédito","Tarjeta débito","Nequi","Daviplata"]
export const STATUS_LIST  = ["Pagado","Pendiente","Parcial"]
export const EXP_CATS     = ["Nómina","Honorarios","Proveedores","Arriendo","Servicios","Internet","Software y suscripciones","Publicidad","Producción","Casino","Transporte","Imprevistos","Impuestos","Otros"]
export const RECUR_FREQ   = ["Mensual","Bimestral","Trimestral","Semestral","Anual"]

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
export const DEMO_INC = []; export const DEMO_EXP = []; export const DEMO_RECUR = []
