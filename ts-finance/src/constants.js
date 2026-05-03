/* ── DESIGN TOKENS — tres Studio ────────────────────── */
export const T = {
  bg:       "#F8F8F6",
  surf:     "#FFFFFF",
  surf2:    "#F2F2F0",
  surf3:    "#EAEAE8",
  border:   "#E4E4E1",
  border2:  "#CCCCC9",
  muted:    "#9E9E9B",
  subtle:   "#737370",
  text2:    "#4A4A47",
  text:     "#1C1C1A",
  white:    "#101010",
  green:    "#44B26B",
  greenD:   "#38955A",
  greenBg:  "rgba(68,178,107,.07)",
  greenBg2: "rgba(68,178,107,.13)",
  red:      "#D72B20",
  redD:     "#B52319",
  redBg:    "rgba(215,43,32,.07)",
  redBg2:   "rgba(215,43,32,.13)",
  amber:    "#D97706",
  amberBg:  "rgba(217,119,6,.07)",
  blue:     "#2563EB",
  blueBg:   "rgba(37,99,235,.07)",
  violet:   "#5A3EE7",
  violetBg: "rgba(90,62,231,.07)",
}

export const MONTHS       = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
export const MONTHS_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
export const PAY_METHODS  = ["Transferencia","Efectivo","Tarjeta crédito","Tarjeta débito","Nequi","Daviplata"]
export const STATUS_LIST  = ["Pagado","Pendiente","Parcial"]
export const EXP_CATS     = ["Nómina","Honorarios","Proveedores","Arriendo","Servicios","Internet","Software y suscripciones","Publicidad","Producción","Casino","Transporte","Imprevistos","Impuestos","Otros"]
export const RECUR_FREQ   = ["Mensual","Bimestral","Trimestral","Semestral","Anual"]

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
