/* ── DESIGN TOKENS — tres Studio ────────────────────── */
export const T = {
  /* Fondos — tonos cálidos, no fríos */
  bg:       "#F8F8F7",
  surf:     "#FFFFFF",
  surf2:    "#F4F4F2",
  surf3:    "#ECEAE6",

  /* Bordes — cálidos */
  border:   "#E5E3DE",
  border2:  "#CCCAC4",

  /* Texto — negro cálido */
  muted:    "#A09E98",
  subtle:   "#6E6C67",
  text2:    "#3D3B36",
  text:     "#0F0E0C",
  white:    "#0F0E0C",   /* backward-compat */

  /* Acento = Negro cálido marca */
  accent:    "#0F0E0C",
  accentD:   "#000000",
  accentBg:  "rgba(15,14,12,.05)",
  accentBg2: "rgba(15,14,12,.10)",
  accentText:"#0F0E0C",

  /* Sidebar */
  side:    "#FFFFFF",
  sideB:   "#E5E3DE",
  sideT:   "#0F0E0C",
  sideM:   "#A09E98",
  sideHov: "#F4F4F2",
  sideAct: "#0F0E0C",

  /* Semánticos — profundos, tipo datos financieros */
  green:    "#1A7A4A",
  greenD:   "#145E38",
  greenBg:  "rgba(26,122,74,.07)",
  greenBg2: "rgba(26,122,74,.13)",
  red:      "#C92020",
  redD:     "#A31A1A",
  redBg:    "rgba(201,32,32,.07)",
  redBg2:   "rgba(201,32,32,.13)",
  amber:    "#C47B0A",
  amberBg:  "rgba(196,123,10,.07)",
  blue:     "#1D52C4",
  blueBg:   "rgba(29,82,196,.07)",
  violet:   "#6B33D4",
  violetBg: "rgba(107,51,212,.07)",
}

export const MONTHS       = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
export const MONTHS_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
export const PAY_METHODS  = ["Transferencia","Efectivo","Tarjeta crédito","Tarjeta débito","Nequi","Daviplata"]
export const STATUS_LIST  = ["Pagado","Pendiente","Parcial"]
export const EXP_CATS     = ["Nómina","Honorarios","Proveedores","Arriendo","Servicios","Internet","Software y suscripciones","Publicidad","Producción","Casino","Transporte","Imprevistos","Impuestos","Otros"]
export const RECUR_FREQ   = ["Mensual","Bimestral","Trimestral","Semestral","Anual"]

export const DIAN_DEDUCIBLES = {
  "Nómina":                   { si: true,  label: "Deducible",   color: "#1A7A4A", nota: "Salarios, prestaciones y aportes parafiscales" },
  "Honorarios":               { si: true,  label: "Deducible",   color: "#1A7A4A", nota: "Requiere documento soporte DIAN o factura electrónica" },
  "Proveedores":              { si: true,  label: "Deducible",   color: "#1A7A4A", nota: "Con factura electrónica de venta del proveedor" },
  "Arriendo":                 { si: true,  label: "Deducible",   color: "#1A7A4A", nota: "Arrendamiento de inmuebles para actividad productora de renta" },
  "Servicios":                { si: true,  label: "Deducible",   color: "#1A7A4A", nota: "Requiere factura o documento soporte de adquisición" },
  "Internet":                 { si: true,  label: "Deducible",   color: "#1A7A4A", nota: "Servicios de telecomunicaciones ligados a la actividad" },
  "Software y suscripciones": { si: true,  label: "Deducible",   color: "#1A7A4A", nota: "Herramientas y plataformas necesarias para la actividad" },
  "Publicidad":               { si: true,  label: "Deducible",   color: "#1A7A4A", nota: "Gastos de marketing y publicidad con soporte" },
  "Producción":               { si: true,  label: "Deducible",   color: "#1A7A4A", nota: "Costos directos de producción y materiales" },
  "Transporte":               { si: true,  label: "Deducible",   color: "#1A7A4A", nota: "Con factura o documento equivalente. Aplica si es del negocio" },
  "Impuestos":                { si: "p",   label: "Parcial",     color: "#C47B0A", nota: "Solo ICA e impuesto predial del negocio. No el impuesto de renta" },
  "Imprevistos":              { si: "c",   label: "Condicional", color: "#C47B0A", nota: "Solo con soporte documental válido y causalidad demostrable" },
  "Casino":                   { si: false, label: "No deducible",color: "#C92020", nota: "No reconocido como deducible por la DIAN" },
  "Otros":                    { si: "c",   label: "Condicional", color: "#C47B0A", nota: "Depende del soporte y la relación de causalidad. Consultar contador" },
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
