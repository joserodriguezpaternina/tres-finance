/* ── DESIGN TOKENS — tres Studio ────────────────────── */
export const T = {
  /* Fondos */
  bg:       "#F5F4F1",   /* Gris cálido muy suave — área de contenido */
  surf:     "#FFFFFF",   /* Blanco puro — cards y paneles              */
  surf2:    "#F0EEE9",   /* Gris cálido suave — secundario             */
  surf3:    "#E8E6E1",   /* Terciario                                  */

  /* Bordes */
  border:   "#EEECE8",
  border2:  "#D8D5CF",

  /* Texto */
  muted:    "#9B9890",   /* Gris medio cálido — labels             */
  subtle:   "#6B6962",   /* Gris oscuro cálido — texto secundario  */
  text2:    "#3A3830",   /* Casi negro cálido — texto de apoyo     */
  text:     "#0F0E0C",   /* Negro marca tres Studio                */
  white:    "#0F0E0C",   /* backward-compat                        */

  /* Acento = Negro (color de marca tres Studio) */
  accent:    "#0F0E0C",
  accentD:   "#000000",
  accentBg:  "rgba(15,14,12,.07)",
  accentBg2: "rgba(15,14,12,.12)",
  accentText:"#0F0E0C",

  /* Sidebar */
  side:    "#FFFFFF",
  sideB:   "#EEECE8",
  sideT:   "#0F0E0C",
  sideM:   "#9B9890",
  sideHov: "#F5F4F1",
  sideAct: "rgba(15,14,12,.07)", /* fondo activo = pill gris suave, NO negro */

  /* Semánticos (señales de datos financieros) */
  green:    "#16784A",
  greenD:   "#125F3C",
  greenBg:  "rgba(22,120,74,.08)",
  greenBg2: "rgba(22,120,74,.13)",
  red:      "#C41E1E",
  redD:     "#A31919",
  redBg:    "rgba(196,30,30,.08)",
  redBg2:   "rgba(196,30,30,.13)",
  amber:    "#B87308",
  amberBg:  "rgba(184,115,8,.08)",
  blue:     "#1A4FBF",
  blueBg:   "rgba(26,79,191,.08)",
  violet:   "#6830CC",
  violetBg: "rgba(104,48,204,.08)",
}

export const MONTHS       = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
export const MONTHS_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
export const PAY_METHODS  = ["Transferencia","Efectivo","Tarjeta crédito","Tarjeta débito","Nequi","Daviplata"]
export const STATUS_LIST  = ["Pagado","Pendiente","Parcial"]
export const EXP_CATS     = ["Nómina","Honorarios","Proveedores","Arriendo","Servicios","Internet","Software y suscripciones","Publicidad","Producción","Casino","Transporte","Imprevistos","Impuestos","Otros"]
export const RECUR_FREQ   = ["Mensual","Bimestral","Trimestral","Semestral","Anual"]

export const DIAN_DEDUCIBLES = {
  "Nómina":                   { si: true,  label: "Deducible",   color: "#16784A", nota: "Salarios, prestaciones y aportes parafiscales" },
  "Honorarios":               { si: true,  label: "Deducible",   color: "#16784A", nota: "Requiere documento soporte DIAN o factura electrónica" },
  "Proveedores":              { si: true,  label: "Deducible",   color: "#16784A", nota: "Con factura electrónica de venta del proveedor" },
  "Arriendo":                 { si: true,  label: "Deducible",   color: "#16784A", nota: "Arrendamiento de inmuebles para actividad productora de renta" },
  "Servicios":                { si: true,  label: "Deducible",   color: "#16784A", nota: "Requiere factura o documento soporte de adquisición" },
  "Internet":                 { si: true,  label: "Deducible",   color: "#16784A", nota: "Servicios de telecomunicaciones ligados a la actividad" },
  "Software y suscripciones": { si: true,  label: "Deducible",   color: "#16784A", nota: "Herramientas y plataformas necesarias para la actividad" },
  "Publicidad":               { si: true,  label: "Deducible",   color: "#16784A", nota: "Gastos de marketing y publicidad con soporte" },
  "Producción":               { si: true,  label: "Deducible",   color: "#16784A", nota: "Costos directos de producción y materiales" },
  "Transporte":               { si: true,  label: "Deducible",   color: "#16784A", nota: "Con factura o documento equivalente. Aplica si es del negocio" },
  "Impuestos":                { si: "p",   label: "Parcial",     color: "#B87308", nota: "Solo ICA e impuesto predial del negocio. No el impuesto de renta" },
  "Imprevistos":              { si: "c",   label: "Condicional", color: "#B87308", nota: "Solo con soporte documental válido y causalidad demostrable" },
  "Casino":                   { si: false, label: "No deducible",color: "#C41E1E", nota: "No reconocido como deducible por la DIAN" },
  "Otros":                    { si: "c",   label: "Condicional", color: "#B87308", nota: "Depende del soporte y la relación de causalidad. Consultar contador" },
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
