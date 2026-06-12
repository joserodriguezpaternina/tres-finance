import { useMemo, useState } from 'react'
import {
  Landmark, CalendarDays, AlertTriangle, Clock,
  CheckCircle2, PiggyBank, Receipt,
} from 'lucide-react'
import { T, MONTHS, fmtS, calcFin, filterM, TAX_CALENDAR } from '../constants.js'
import { KPI, EmptyState } from '../ui.jsx'

/* ── Helpers ────────────────────────────────────────────────────────────── */

const NOW = new Date()

const daysUntil = dateStr =>
  Math.ceil((new Date(`${dateStr}T23:59:59`) - NOW) / 86_400_000)

const fmtDue = dateStr =>
  new Date(`${dateStr}T12:00:00`).toLocaleDateString("es-CO", {
    weekday: "short", day: "2-digit", month: "long", year: "numeric",
  })

/* Colores por tipo de obligación */
const tipoTheme = tipo => ({
  Retefuente: { c: T.blue,   bg: T.blueBg   },
  IVA:        { c: T.amber,  bg: T.amberBg  },
  ICA:        { c: T.violet, bg: T.violetBg },
  Renta:      { c: T.red,    bg: T.redBg    },
  "Exógena":  { c: T.green,  bg: T.greenBg  },
}[tipo] || { c: T.muted, bg: T.surf2 })

const microLabel = {
  fontSize: 10, fontWeight: 600, textTransform: "uppercase",
  letterSpacing: ".07em", color: T.muted,
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function TipoBadge({ tipo }) {
  const th = tipoTheme(tipo)
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
      background: th.bg, color: th.c, whiteSpace: "nowrap",
      textTransform: "uppercase", letterSpacing: ".05em", flexShrink: 0,
    }}>
      {tipo}
    </span>
  )
}

function EstadoChip({ due }) {
  const d = daysUntil(due)
  if (d < 0) {
    return (
      <span style={{
        fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
        background: T.redBg, color: T.red, whiteSpace: "nowrap",
        display: "inline-flex", alignItems: "center", gap: 4,
      }}>
        <AlertTriangle size={9} />Vencida
      </span>
    )
  }
  if (d <= 20) {
    return (
      <span style={{
        fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
        background: T.amberBg, color: T.amber, whiteSpace: "nowrap",
        display: "inline-flex", alignItems: "center", gap: 4,
      }}>
        <Clock size={9} />Próxima · {d === 0 ? "hoy" : `${d}d`}
      </span>
    )
  }
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
      background: T.surf2, color: T.muted, whiteSpace: "nowrap",
    }}>
      En {d} días
    </span>
  )
}

function ObligationCard({ item }) {
  const th = tipoTheme(item.tipo)
  const overdue = daysUntil(item.due) < 0
  return (
    <div style={{
      background: T.surf, border: `1px solid ${T.border}`,
      borderLeft: `3px solid ${overdue ? T.red : th.c}`,
      borderRadius: 12, padding: "13px 16px",
      display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: th.bg, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Landmark size={15} color={th.c} />
      </div>
      <div style={{ flex: "1 1 200px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <TipoBadge tipo={item.tipo} />
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{item.label}</span>
        </div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>
          {item.entidad} · período {item.periodo}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.text2, fontFamily: "'DM Mono',monospace", whiteSpace: "nowrap" }}>
          {fmtDue(item.due)}
        </span>
        <EstadoChip due={item.due} />
      </div>
    </div>
  )
}

/* ── Main ───────────────────────────────────────────────────────────────── */

const TIPO_FILTERS = ["Todas", "IVA", "Retefuente", "ICA", "Renta"]

export default function ImpuestosView({ allInc, allExp, year }) {
  const [tipoFil, setTipoFil] = useState("Todas")

  const curMonth = NOW.getMonth()
  const isCurrentYear = NOW.getFullYear() === year

  /* IVA neto del bimestre actual (los 2 meses del bimestre en curso) */
  const biFin = useMemo(() => {
    const biStart = Math.floor(curMonth / 2) * 2
    const inc = [...filterM(allInc, biStart, year), ...filterM(allInc, biStart + 1, year)]
    const exp = [...filterM(allExp, biStart, year), ...filterM(allExp, biStart + 1, year)]
    return calcFin(inc, exp)
  }, [allInc, allExp, curMonth, year])

  const biLabel = useMemo(() => {
    const biStart = Math.floor(curMonth / 2) * 2
    return `${MONTHS[biStart].slice(0, 3)}–${MONTHS[biStart + 1].slice(0, 3)}`
  }, [curMonth])

  /* IVA neto + utilidad YTD */
  const ytdFin = useMemo(() => calcFin(
    allInc.filter(i => new Date(i.date).getFullYear() === year),
    allExp.filter(e => new Date(e.date).getFullYear() === year),
  ), [allInc, allExp, year])

  /* Próxima obligación + vencidas */
  const upcoming = useMemo(() =>
    [...TAX_CALENDAR]
      .filter(o => daysUntil(o.due) >= 0)
      .sort((a, b) => new Date(a.due) - new Date(b.due)),
    []
  )
  const nextOb = upcoming[0]

  const overdueCount = useMemo(() =>
    TAX_CALENDAR.filter(o =>
      new Date(o.due).getFullYear() === 2026 && daysUntil(o.due) < 0
    ).length,
    []
  )

  /* Provisión sugerida */
  const monthsElapsed = isCurrentYear ? curMonth + 1 : 12
  const ivaReserve   = ytdFin.ivaN > 0 ? ytdFin.ivaN / monthsElapsed : 0
  const rentaReserve = Math.max(ytdFin.util, 0) * 0.35 / 12
  const totalReserve = ivaReserve + rentaReserve

  /* Calendario filtrado y agrupado por mes */
  const grouped = useMemo(() => {
    const items = TAX_CALENDAR
      .filter(o => tipoFil === "Todas" || o.tipo === tipoFil)
      .sort((a, b) => new Date(a.due) - new Date(b.due))
    const map = new Map()
    items.forEach(o => {
      const d = new Date(`${o.due}T12:00:00`)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (!map.has(key)) map.set(key, { month: d.getMonth(), year: d.getFullYear(), items: [] })
      map.get(key).items.push(o)
    })
    return [...map.values()]
  }, [tipoFil])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Header */}
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: "-.3px" }}>Impuestos</div>
        <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Calendario tributario y obligaciones fiscales · {year}</div>
      </div>

      {/* KPI strip */}
      <div className="g4">
        <KPI
          title={`IVA neto bimestre (${biLabel})`}
          value={fmtS(Math.abs(biFin.ivaN))}
          sub={biFin.ivaN >= 0 ? "A pagar a la DIAN" : "Saldo a favor"}
          icon={Receipt}
          color={biFin.ivaN >= 0 ? T.red : T.green}
        />
        <KPI
          title={`IVA neto ${year} (YTD)`}
          value={fmtS(Math.abs(ytdFin.ivaN))}
          sub={ytdFin.ivaN >= 0 ? "A pagar acumulado" : "A favor acumulado"}
          icon={Landmark}
          color={ytdFin.ivaN >= 0 ? T.red : T.green}
        />
        <KPI
          title="Próxima obligación"
          value={nextOb ? `${daysUntil(nextOb.due)} días` : "—"}
          sub={nextOb ? nextOb.label : "Sin obligaciones próximas"}
          icon={CalendarDays}
          color={nextOb && daysUntil(nextOb.due) <= 20 ? T.amber : T.blue}
        />
        <KPI
          title="Obligaciones vencidas"
          value={String(overdueCount)}
          sub={overdueCount > 0 ? "Verifique presentación y pago" : "Sin vencimientos pendientes"}
          icon={overdueCount > 0 ? AlertTriangle : CheckCircle2}
          color={overdueCount > 0 ? T.red : T.green}
        />
      </div>

      {/* Provisión sugerida */}
      <div style={{
        background: T.surf, border: `1px solid ${T.border}`, borderRadius: 14,
        padding: "20px 22px", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap",
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: T.limeBg, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <PiggyBank size={19} color={T.limeText} />
        </div>
        <div style={{ flex: "1 1 240px", minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Provisión mensual sugerida</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 3, lineHeight: 1.5 }}>
            Reserva estimada para cubrir impuestos: IVA neto acumulado del año dividido entre
            los {monthsElapsed} meses transcurridos, más renta estimada (35% de la utilidad YTD,
            prorrateada a 12 meses). Cifra orientativa — no reemplaza el cálculo de su contador.
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={microLabel}>IVA / mes</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text2, fontFamily: "'DM Mono',monospace", marginTop: 3 }}>{fmtS(ivaReserve)}</div>
          </div>
          <div>
            <div style={microLabel}>Renta / mes</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text2, fontFamily: "'DM Mono',monospace", marginTop: 3 }}>{fmtS(rentaReserve)}</div>
          </div>
          <div style={{
            background: T.limeBg, border: `1px solid ${T.limeBorder}`,
            borderRadius: 12, padding: "10px 18px",
          }}>
            <div style={{ ...microLabel, color: T.limeText }}>Total a reservar</div>
            <div style={{ fontSize: 21, fontWeight: 700, color: T.limeText, fontFamily: "'DM Mono',monospace", letterSpacing: "-.4px", marginTop: 3 }}>
              {fmtS(totalReserve)}
            </div>
          </div>
        </div>
      </div>

      {/* Calendario de obligaciones */}
      <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 14, padding: "22px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Calendario de obligaciones</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Vencimientos DIAN y SHD por mes</div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {TIPO_FILTERS.map(f => {
              const active = tipoFil === f
              return (
                <button
                  key={f}
                  onClick={() => setTipoFil(f)}
                  style={{
                    padding: "6px 13px", borderRadius: 999, cursor: "pointer",
                    fontSize: 11, fontWeight: 600, fontFamily: "inherit",
                    background: active ? T.accent : T.surf2,
                    color: active ? T.accentText : T.muted,
                    border: `1px solid ${active ? T.accent : T.border}`,
                    transition: "background .12s, color .12s",
                  }}
                >
                  {f}
                </button>
              )
            })}
          </div>
        </div>

        {grouped.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {grouped.map(g => {
              const isCurrent = g.month === curMonth && g.year === NOW.getFullYear()
              return (
                <div
                  key={`${g.year}-${g.month}`}
                  style={{
                    borderLeft: isCurrent ? `3px solid ${T.lime}` : `3px solid ${T.border}`,
                    paddingLeft: 18, marginLeft: 4,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                      {MONTHS[g.month]} {g.year}
                    </span>
                    {isCurrent && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: "2px 9px", borderRadius: 999,
                        background: T.limeBg, color: T.limeText,
                        textTransform: "uppercase", letterSpacing: ".07em",
                      }}>
                        Mes actual
                      </span>
                    )}
                    <span style={{ fontSize: 10, color: T.muted }}>
                      {g.items.length} obligaci{g.items.length === 1 ? "ón" : "ones"}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {g.items.map(o => <ObligationCard key={o.id} item={o} />)}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="Sin obligaciones para este filtro"
            sub="Cambie el filtro de tipo para ver el calendario completo."
          />
        )}

        {/* Disclaimer */}
        <div style={{
          marginTop: 22, paddingTop: 14, borderTop: `1px solid ${T.border}`,
          fontSize: 11, color: T.muted, display: "flex", alignItems: "center", gap: 7,
        }}>
          <AlertTriangle size={11} color={T.muted} style={{ flexShrink: 0 }} />
          Fechas de referencia. Los plazos exactos dependen del último dígito del NIT — verifique el calendario oficial DIAN.
        </div>
      </div>
    </div>
  )
}
