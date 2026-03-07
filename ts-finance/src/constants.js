/* ── DESIGN TOKENS ─────────────────────────────────────── */
export const T = {
  bg:       "#0A0A0B",
  surf:     "#111113",
  surf2:    "#18181B",
  surf3:    "#1C1C1F",
  border:   "#27272A",
  border2:  "#3F3F46",
  muted:    "#52525B",
  subtle:   "#71717A",
  text2:    "#A1A1AA",
  text:     "#D4D4D8",
  white:    "#FAFAFA",
  green:    "#22C55E",
  greenD:   "#16A34A",
  greenBg:  "rgba(34,197,94,.08)",
  greenBg2: "rgba(34,197,94,.15)",
  red:      "#F43F5E",
  redD:     "#BE123C",
  redBg:    "rgba(244,63,94,.08)",
  redBg2:   "rgba(244,63,94,.15)",
  amber:    "#F59E0B",
  amberBg:  "rgba(245,158,11,.08)",
  blue:     "#3B82F6",
  blueBg:   "rgba(59,130,246,.08)",
  violet:   "#8B5CF6",
  violetBg: "rgba(139,92,246,.08)",
};

/* ── CONSTANTS ─────────────────────────────────────────── */
export const MONTHS       = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
export const MONTHS_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
export const PAY_METHODS  = ["Transferencia","Efectivo","Tarjeta crédito","Tarjeta débito","Nequi","Daviplata"];
export const STATUS_LIST  = ["Pagado","Pendiente","Parcial"];
export const EXP_CATS     = ["Nómina","Honorarios","Proveedores","Arriendo","Servicios","Internet","Software y suscripciones","Publicidad","Producción","Transporte","Imprevistos","Impuestos","Otros"];
export const RECUR_FREQ   = ["Mensual","Bimestral","Trimestral","Semestral","Anual"];

/* ── UTILS ─────────────────────────────────────────────── */
export const uid  = () => Math.random().toString(36).slice(2,9);
export const fmt  = n => new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",minimumFractionDigits:0}).format(n);
export const fmtS = n => {
  const a = Math.abs(n);
  if(a>=1000000) return `$${(n/1000000).toFixed(1)}M`;
  if(a>=1000)    return `$${(n/1000).toFixed(0)}K`;
  return fmt(n);
};
export const getIVA  = i => (i.hasIVA||i.has_iva) ? (i.amount*(i.ivaP||i.iva_p))/((i.ivaP||i.iva_p)+100) : 0;
export const getBase = i => (i.hasIVA||i.has_iva) ? i.amount/(1+((i.ivaP||i.iva_p)/100)) : i.amount;

export const calcFin = (inc, exp) => {
  const tI    = inc.reduce((s,i)=>s+Number(i.amount),0);
  const tIVAc = inc.reduce((s,i)=>s+getIVA(i),0);
  const tIb   = tI - tIVAc;
  const cobr  = inc.filter(i=>i.status==="Pagado").reduce((s,i)=>s+Number(i.amount),0);
  const tE    = exp.reduce((s,e)=>s+Number(e.amount),0);
  const tIVAp = exp.reduce((s,e)=>s+getIVA(e),0);
  const tEb   = tE - tIVAp;
  return { tI, tIVAc, tIb, cobr, tE, tIVAp, tEb,
    saldo: tI-tE, saldoB: tIb-tEb,
    ivaN: tIVAc-tIVAp,
    util: tIb-tEb,
    caja: cobr-tE,
  };
};

export const filterM = (arr,m,y) => arr.filter(i=>{
  const d = new Date(i.date); return d.getMonth()===m && d.getFullYear()===y;
});

export const freqMult = f => ({ Mensual:1, Bimestral:.5, Trimestral:.333, Semestral:.167, Anual:.083 }[f]||1);

/* ── DEMO DATA ─────────────────────────────────────────── */
export const DEMO_INC = [
  {id:"i1",client:"Bancolombia",project:"Rediseño de marca",date:"2026-01-08",amount:14280000,hasIVA:true,ivaP:19,status:"Pagado",method:"Transferencia",notes:"Fase 1 entregada"},
  {id:"i2",client:"Grupo Éxito",project:"Campaña digital Q1",date:"2026-01-15",amount:10115000,hasIVA:true,ivaP:19,status:"Pagado",method:"Transferencia",notes:""},
  {id:"i3",client:"Rappi",project:"Diseño UX App",date:"2026-01-22",amount:7140000,hasIVA:true,ivaP:19,status:"Pendiente",method:"Transferencia",notes:"En revisión interna"},
  {id:"i4",client:"Tostao",project:"Identidad visual",date:"2026-01-28",amount:4500000,hasIVA:false,ivaP:0,status:"Pagado",method:"Nequi",notes:"Régimen simplificado"},
  {id:"i5",client:"Avianca",project:"Motion graphics",date:"2026-02-05",amount:17850000,hasIVA:true,ivaP:19,status:"Pagado",method:"Transferencia",notes:""},
  {id:"i6",client:"Grupo Corona",project:"Social media pack",date:"2026-02-14",amount:8568000,hasIVA:true,ivaP:19,status:"Pagado",method:"Transferencia",notes:"3 meses contenido"},
  {id:"i7",client:"Nutresa",project:"Packaging redesign",date:"2026-02-20",amount:11662000,hasIVA:true,ivaP:19,status:"Parcial",method:"Transferencia",notes:"50% recibido"},
  {id:"i8",client:"Claro",project:"Campaña BTL",date:"2026-02-27",amount:5500000,hasIVA:false,ivaP:0,status:"Pendiente",method:"Transferencia",notes:""},
  {id:"i9",client:"Bancolombia",project:"Sitio web corporativo",date:"2026-03-03",amount:21420000,hasIVA:true,ivaP:19,status:"Pagado",method:"Transferencia",notes:"Proyecto flagship"},
  {id:"i10",client:"Grupo Aval",project:"Brand guidelines",date:"2026-03-10",amount:13090000,hasIVA:true,ivaP:19,status:"Pendiente",method:"Transferencia",notes:""},
  {id:"i11",client:"Cliente local",project:"Fotografía producto",date:"2026-03-18",amount:3808000,hasIVA:true,ivaP:19,status:"Pagado",method:"Efectivo",notes:""},
  {id:"i12",client:"Tostao",project:"Rediseño menú",date:"2026-03-25",amount:2800000,hasIVA:false,ivaP:0,status:"Parcial",method:"Nequi",notes:"Anticipo 40%"},
];

export const DEMO_EXP = [
  {id:"e1",date:"2026-01-05",cat:"Nómina",sub:"Equipo diseño",desc:"Nómina enero",provider:"Equipo TS",amount:8000000,hasIVA:false,ivaP:0,method:"Transferencia",obs:""},
  {id:"e2",date:"2026-01-05",cat:"Arriendo",sub:"Chapinero",desc:"Canon enero",provider:"Colpatria",amount:2800000,hasIVA:false,ivaP:0,method:"Transferencia",obs:""},
  {id:"e3",date:"2026-01-10",cat:"Software y suscripciones",sub:"Adobe CC",desc:"Adobe Creative Cloud",provider:"Adobe",amount:535500,hasIVA:true,ivaP:19,method:"T. crédito",obs:""},
  {id:"e4",date:"2026-01-10",cat:"Internet",sub:"ETB",desc:"Internet 500MB",provider:"ETB",amount:214200,hasIVA:true,ivaP:19,method:"Débito auto",obs:""},
  {id:"e5",date:"2026-02-05",cat:"Nómina",sub:"Equipo diseño",desc:"Nómina febrero",provider:"Equipo TS",amount:8000000,hasIVA:false,ivaP:0,method:"Transferencia",obs:""},
  {id:"e6",date:"2026-02-05",cat:"Arriendo",sub:"Chapinero",desc:"Canon febrero",provider:"Colpatria",amount:2800000,hasIVA:false,ivaP:0,method:"Transferencia",obs:""},
  {id:"e7",date:"2026-02-10",cat:"Honorarios",sub:"Freelance",desc:"Motion designer externo",provider:"C. Restrepo",amount:2975000,hasIVA:false,ivaP:0,method:"Nequi",obs:"Proyecto Avianca"},
  {id:"e8",date:"2026-02-12",cat:"Software y suscripciones",sub:"Figma",desc:"Figma Professional team",provider:"Figma Inc.",amount:380800,hasIVA:true,ivaP:19,method:"T. crédito",obs:""},
  {id:"e9",date:"2026-02-20",cat:"Publicidad",sub:"Digital",desc:"Google Ads febrero",provider:"Google",amount:952000,hasIVA:true,ivaP:19,method:"T. crédito",obs:""},
  {id:"e10",date:"2026-03-05",cat:"Nómina",sub:"Equipo diseño",desc:"Nómina marzo",provider:"Equipo TS",amount:8000000,hasIVA:false,ivaP:0,method:"Transferencia",obs:""},
  {id:"e11",date:"2026-03-05",cat:"Arriendo",sub:"Chapinero",desc:"Canon marzo",provider:"Colpatria",amount:2800000,hasIVA:false,ivaP:0,method:"Transferencia",obs:""},
  {id:"e12",date:"2026-03-08",cat:"Producción",sub:"Fotografía",desc:"Estudio y equipos sesión",provider:"Studio Lens Bogotá",amount:1785000,hasIVA:true,ivaP:19,method:"Transferencia",obs:""},
  {id:"e13",date:"2026-03-10",cat:"Impuestos",sub:"ICA",desc:"ICA primer bimestre 2026",provider:"Secretaría Hacienda",amount:650000,hasIVA:false,ivaP:0,method:"Transferencia",obs:""},
];

export const DEMO_RECUR = [
  {id:"r1",name:"Adobe Creative Cloud",cat:"Software",amount:535500,hasIVA:true,ivaP:19,freq:"Mensual",day:10,method:"T. crédito",active:true,icon:"adobe",notes:"Plan teams 5 licencias"},
  {id:"r2",name:"Figma Professional",cat:"Software",amount:380800,hasIVA:true,ivaP:19,freq:"Mensual",day:12,method:"T. crédito",active:true,icon:"figma",notes:"Team plan"},
  {id:"r3",name:"Slack Business+",cat:"Software",amount:214200,hasIVA:true,ivaP:19,freq:"Mensual",day:1,method:"T. crédito",active:true,icon:"slack",notes:"15 usuarios"},
  {id:"r4",name:"Google Workspace",cat:"Software",amount:285600,hasIVA:true,ivaP:19,freq:"Mensual",day:1,method:"T. crédito",active:true,icon:"google",notes:"Business Starter"},
  {id:"r5",name:"Notion Team",cat:"Software",amount:178500,hasIVA:true,ivaP:19,freq:"Mensual",day:5,method:"T. crédito",active:true,icon:"notion",notes:"10 miembros"},
  {id:"r6",name:"Loom Business",cat:"Software",amount:142800,hasIVA:true,ivaP:19,freq:"Mensual",day:5,method:"T. crédito",active:false,icon:"loom",notes:"En pausa"},
  {id:"r7",name:"Arriendo oficina",cat:"Arriendo",amount:2800000,hasIVA:false,ivaP:0,freq:"Mensual",day:5,method:"Transferencia",active:true,icon:"office",notes:"Chapinero Alto"},
  {id:"r8",name:"Internet ETB 500MB",cat:"Internet",amount:214200,hasIVA:true,ivaP:19,freq:"Mensual",day:15,method:"Débito auto",active:true,icon:"wifi",notes:"Fibra óptica"},
  {id:"r9",name:"Hosting & dominio",cat:"Software",amount:95200,hasIVA:true,ivaP:19,freq:"Anual",day:1,method:"T. crédito",active:true,icon:"globe",notes:"AWS + .co"},
  {id:"r10",name:"Spotify Teams",cat:"Software",amount:47600,hasIVA:true,ivaP:19,freq:"Mensual",day:20,method:"T. crédito",active:true,icon:"spotify",notes:"Ambiente oficina"},
];
