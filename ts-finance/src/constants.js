/* ── DESIGN TOKENS — tres Studio ────────────────────── */
export const T = {
  /* Fondos */
  bg:       "#F7F7F7",   /* Casi blanco — área de contenido */
  surf:     "#FFFFFF",   /* Blanco puro — cards y paneles   */
  surf2:    "#F5F5F5",   /* Gris muy suave — secundario     */
  surf3:    "#EBEBEB",   /* Terciario                       */

  /* Bordes */
  border:   "#E8E8E8",
  border2:  "#D4D4D4",

  /* Texto */
  muted:    "#A3A3A3",   /* Gris medio — labels             */
  subtle:   "#737373",   /* Gris oscuro — texto secundario  */
  text2:    "#404040",   /* Casi negro — texto de apoyo     */
  text:     "#0A0A0A",   /* Negro marca                     */
  white:    "#0A0A0A",   /* backward-compat                 */

  /* Acento = Negro (color de marca tres Studio) */
  accent:    "#0A0A0A",
  accentD:   "#000000",
  accentBg:  "rgba(10,10,10,.05)",
  accentBg2: "rgba(10,10,10,.10)",
  accentText:"#0A0A0A",

  /* Sidebar */
  side:    "#FFFFFF",
  sideB:   "#E8E8E8",
  sideT:   "#0A0A0A",
  sideM:   "#A3A3A3",
  sideHov: "#F5F5F5",
  sideAct: "#0A0A0A",   /* fondo activo = negro */

  /* Semánticos (mantienen color para datos financieros) */
  green:    "#16A34A",
  greenD:   "#15803D",
  greenBg:  "rgba(22,163,74,.07)",
  greenBg2: "rgba(22,163,74,.13)",
  red:      "#DC2626",
  redD:     "#B91C1C",
  redBg:    "rgba(220,38,38,.07)",
  redBg2:   "rgba(220,38,38,.13)",
  amber:    "#D97706",
  amberBg:  "rgba(217,119,6,.07)",
  blue:     "#2563EB",
  blueBg:   "rgba(37,99,235,.07)",
  violet:   "#7C3AED",
  violetBg: "rgba(124,58,237,.07)",
}

export const MONTHS       = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
export const MONTHS_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
export const PAY_METHODS  = ["Transferencia","Efectivo","Tarjeta crédito","Tarjeta débito","Nequi","Daviplata"]
export const STATUS_LIST  = ["Pagado","Pendiente","Parcial"]
export const EXP_CATS     = ["Nómina","Honorarios","Proveedores","Arriendo","Servicios","Internet","Software y suscripciones","Publicidad","Producción","Casino","Transporte","Imprevistos","Impuestos","Otros"]
export const RECUR_FREQ   = ["Mensual","Bimestral","Trimestral","Semestral","Anual"]

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
