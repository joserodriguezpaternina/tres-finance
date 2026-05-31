/* ── DESIGN TOKENS — tres Finance (Fynix design system) ─── */
export const T = {
  bg:       "#EEEFEA",   /* light canvas */
  surf:     "#FFFFFF",   /* cards */
  surf2:    "#F4F5F1",   /* subtle fills */
  surf3:    "#EBECE6",
  border:   "#E8E9E3",
  border2:  "#D6D7D0",
  muted:    "#8A8C82",
  subtle:   "#56584E",
  text2:    "#373930",
  text:     "#161A12",   /* near-black green */
  white:    "#FFFFFF",
  /* primary = dark forest green */
  accent:    "#1A2E1F",
  accentD:   "#102015",
  accentBg:  "rgba(26,46,31,.06)",
  accentBg2: "rgba(26,46,31,.12)",
  accentText:"#FFFFFF",
  /* lime — decorative brand accent */
  lime:      "#A6E96A",
  limeD:     "#8FD94A",
  limeText:  "#2C4A14",
  limeBg:    "rgba(166,233,106,.22)",
  /* sidebar (white) */
  side:    "#FBFBFA",
  sideB:   "#E8E9E3",
  sideT:   "#161A12",
  sideM:   "#6B6D62",
  sideHov: "#F1F2EC",
  sideAct: "#E9F6D6",    /* light lime active */
  green:    "#1E9E5A",
  greenD:   "#157A45",
  greenBg:  "rgba(30,158,90,.10)",
  greenBg2: "rgba(30,158,90,.18)",
  red:      "#E5484D",
  redD:     "#C53438",
  redBg:    "rgba(229,72,77,.10)",
  redBg2:   "rgba(229,72,77,.18)",
  amber:    "#E0A030",
  amberBg:  "rgba(224,160,48,.12)",
  blue:     "#3B82F6",
  blueBg:   "rgba(59,130,246,.10)",
  violet:   "#7C5CFC",
  violetBg: "rgba(124,92,252,.10)",
}

/* ── Chart palette — cohesive green family (Fynix) ─── */
export const CHART = {
  inc:    "#1A2E1F",   /* income — dark forest (bars/lines) */
  exp:    "#A6E96A",   /* expense — lime (filled bars) */
  expS:   "#5FB35B",   /* expense stroke on white (contrast) */
  profit: "#1E9E5A",   /* utility / profit (lines) */
  acc:    "#8FD94A",   /* lime accent */
  neg:    "#E5484D",   /* negative / alert only */
  grid:   "#E8E9E3",
  scale:  ["#1A2E1F","#2C5638","#3F8A4E","#5FB35B","#8FD94A","#C2E89A"],
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
  "Impuestos":                { si: "p",   label: "Parcial",     color: "#E0A030", nota: "Solo ICA e impuesto predial del negocio. No el impuesto de renta" },
  "Imprevistos":              { si: "c",   label: "Condicional", color: "#E0A030", nota: "Solo con soporte documental válido y causalidad demostrable" },
  "Casino":                   { si: false, label: "No deducible",color: "#E5484D", nota: "No reconocido como deducible por la DIAN" },
  "Otros":                    { si: "c",   label: "Condicional", color: "#E0A030", nota: "Depende del soporte y la relación de causalidad. Consultar contador" },
}

export const DOC_TIPOS_SOPORTE = [
  "Factura electrónica", "Documento soporte DIAN (Res. 167/2021)",
  "Contrato de servicios", "Recibo de pago", "Comprobante de egreso", "Otro",
]

export const uid = () => Math.random().toString(36).slice(2,9)
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
