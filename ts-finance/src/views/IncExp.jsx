import { useState, useMemo } from 'react'
import {
  Plus, Search, Edit2, Trash2, CheckCircle, ArrowUp, ArrowDown,
  TrendingUp, TrendingDown, AlertCircle, RefreshCw, Clock, DollarSign,
  BarChart2, FileText, Inbox, Download, Copy
} from 'lucide-react'
import { T, EXP_CATS, STATUS_LIST, fmtS, fmt, getIVA, getBase, MONTHS_SHORT } from '../constants.js'
import { card, inp, btnGreen, btnRed, btnGhost, Pill, lbl } from '../ui.jsx'

/* ── CSV Export utility ───────────────────────────────── */
function exportCSV(rows, filename) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const escape = v => {
    const s = String(v ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

/* ── Date formatter: "15 may" ─────────────────────────── */
function fmtDateCompact(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()].toLowerCase()}`
}

/* ── helpers ─────────────────────────────────────────────── */
const isOverdue = (item) => {
  if (item.status === 'Pagado') return false
  const d = new Date(item.date)
  return (Date.now() - d.getTime()) > 30 * 24 * 60 * 60 * 1000
}

const CAT_COLORS = {
  'Nómina':                   { bg: 'rgba(37,99,235,.09)',   c: '#1D4ED8'  },
  'Honorarios':               { bg: 'rgba(90,62,231,.09)',   c: '#5A3EE7'  },
  'Proveedores':              { bg: 'rgba(217,119,6,.09)',   c: '#B45309'  },
  'Arriendo':                 { bg: 'rgba(236,72,153,.09)',  c: '#BE185D'  },
  'Servicios':                { bg: 'rgba(68,178,107,.09)',  c: '#38955A'  },
  'Internet':                 { bg: 'rgba(37,99,235,.09)',   c: '#2563EB'  },
  'Software y suscripciones': { bg: 'rgba(90,62,231,.09)',   c: '#5A3EE7'  },
  'Publicidad':               { bg: 'rgba(239,68,68,.09)',   c: '#DC2626'  },
  'Producción':               { bg: 'rgba(217,119,6,.09)',   c: '#D97706'  },
  'Casino':                   { bg: 'rgba(215,43,32,.09)',   c: '#D72B20'  },
  'Transporte':               { bg: 'rgba(20,184,166,.09)',  c: '#0F766E'  },
  'Imprevistos':              { bg: 'rgba(245,158,11,.09)',  c: '#92400E'  },
  'Impuestos':                { bg: 'rgba(215,43,32,.09)',   c: '#B52319'  },
  'Otros':                    { bg: T.surf2,                 c: T.text2    },
}

/* ── shared primitives ───────────────────────────────────── */
const thCell = {
  textAlign: 'left', fontSize: 10, fontWeight: 700, color: T.muted,
  padding: '10px 14px', textTransform: 'uppercase', letterSpacing: '.7px',
  borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap',
  background: T.surf2, position: 'sticky', top: 0, zIndex: 1,
}
const thRight = { ...thCell, textAlign: 'right' }
const tdBase = { padding: '11px 14px', fontSize: 13, color: T.text, whiteSpace: 'nowrap' }
const tdMono = { ...tdBase, fontFamily: "'DM Mono',monospace", textAlign: 'right' }

function Th({ children, sortable, active, dir, onClick }) {
  return (
    <th onClick={sortable ? onClick : undefined}
      style={{ ...thCell, cursor: sortable ? 'pointer' : 'default', userSelect: 'none' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {children}
        {sortable && (
          active
            ? dir === 'desc'
              ? <ArrowDown size={10} color={T.green} />
              : <ArrowUp size={10} color={T.green} />
            : <ArrowDown size={10} color={T.border2} />
        )}
      </span>
    </th>
  )
}

function ActionBtns({ onEdit, onDelete, onDuplicate }) {
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {onDuplicate && (
        <button onClick={onDuplicate} title="Duplicar" style={{ background: T.surf2, border: 'none', borderRadius: 7, padding: '5px 8px', cursor: 'pointer' }}>
          <Copy size={11} color={T.muted} />
        </button>
      )}
      <button onClick={onEdit} title="Editar" style={{ background: T.blueBg, border: 'none', borderRadius: 7, padding: '5px 8px', cursor: 'pointer' }}>
        <Edit2 size={11} color={T.blue} />
      </button>
      <button onClick={onDelete} title="Eliminar" style={{ background: T.redBg, border: 'none', borderRadius: 7, padding: '5px 8px', cursor: 'pointer' }}>
        <Trash2 size={11} color={T.red} />
      </button>
    </div>
  )
}

function ChipBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 13px', borderRadius: 8, border: active ? 'none' : `1px solid ${T.border}`,
      fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
      background: active ? T.text : T.surf, color: active ? '#fff' : T.muted,
      transition: 'all .15s',
    }}>{children}</button>
  )
}

/* KPI strip — compact horizontal cards */
function KpiStrip({ items }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {items.map((k, i) => (
        <div key={i} style={{
          flex: '1 1 160px', background: T.surf, border: `1px solid ${T.border}`,
          borderRadius: 12, padding: '14px 18px',
          boxShadow: '0 1px 3px rgba(0,0,0,.03)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: T.muted, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>
            {k.label}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: k.accent, fontFamily: "'DM Mono',monospace", letterSpacing: '-.5px', lineHeight: 1 }}>
            {fmt(k.value)}
          </div>
          {k.sub && <div style={{ fontSize: 11, color: T.muted, marginTop: 5 }}>{k.sub}</div>}
        </div>
      ))}
    </div>
  )
}

/* Empty state */
function EmptyState({ icon: Icon, title, subtitle, ctaLabel, onCta }) {
  return (
    <tr>
      <td colSpan={99}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: T.surf2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={24} color={T.muted} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>{title}</div>
            <div style={{ fontSize: 12, color: T.muted }}>{subtitle}</div>
          </div>
          {ctaLabel && onCta && (
            <button onClick={onCta} style={{ ...btnGreen, marginTop: 4 }}>
              <Plus size={13} />{ctaLabel}
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

/* ── INCOMES VIEW ────────────────────────────────────────── */
export function IncomesView({ incomes, allIncomes, onAdd, onEdit, onDelete, onMarkPaid }) {
  const allInc = allIncomes ?? incomes
  const [q, setQ]           = useState('')
  const [statusFil, setStatusFil] = useState('Todos')
  const [period, setPeriod] = useState('Este mes')
  const [sortDir, setSortDir] = useState('desc')
  const [hoveredRow, setHoveredRow] = useState(null)

  const PERIODS = ['Este mes', 'Todo', 'Solo pendientes']

  const baseList = useMemo(() => {
    if (period === 'Este mes')       return incomes
    if (period === 'Todo')           return allInc
    if (period === 'Solo pendientes') return allInc.filter(i => i.status !== 'Pagado')
    return incomes
  }, [period, incomes, allInc])

  const filtered = useMemo(() => {
    return baseList
      .filter(i => {
        const text = (i.client + ' ' + i.project + ' ' + (i.notes || '')).toLowerCase()
        const matchQ = !q || text.includes(q.toLowerCase())
        const matchS = statusFil === 'Todos' || i.status === statusFil
        return matchQ && matchS
      })
      .sort((a, b) => {
        const diff = new Date(a.date) - new Date(b.date)
        return sortDir === 'desc' ? -diff : diff
      })
  }, [baseList, q, statusFil, sortDir])

  const totalFact    = filtered.reduce((s, i) => s + Number(i.amount), 0)
  const totalCobrado = filtered.filter(i => i.status === 'Pagado').reduce((s, i) => s + Number(i.amount), 0)
  const totalPend    = filtered.filter(i => i.status === 'Pendiente' || i.status === 'Parcial').reduce((s, i) => s + Number(i.amount), 0)

  const handleExportCSV = () => {
    const rows = filtered.map(i => ({
      Fecha:    i.date,
      Cliente:  i.client,
      Proyecto: i.project,
      Monto:    Number(i.amount),
      Base:     Math.round(getBase(i)),
      IVA:      i.hasIVA ? Math.round(getIVA(i)) : 0,
      Estado:   i.status,
      Método:   i.method || '',
      Notas:    i.notes  || '',
    }))
    exportCSV(rows, `ingresos-${new Date().toISOString().slice(0,10)}.csv`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── Page header */}
      <div className="page-hdr">
        <div>
          <div className="page-title">Ingresos</div>
          <div className="page-sub">
            {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'} · total{' '}
            <span style={{ color: T.green, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{fmt(totalFact)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
          <button onClick={handleExportCSV} style={{ ...btnGhost, padding: '7px 13px', fontSize: 12, gap: 5 }}>
            <Download size={13} color={T.muted} />
            <span className="btnText">Exportar</span>
          </button>
          <button onClick={() => onAdd()} style={btnGreen}>
            <Plus size={14} />Nuevo ingreso
          </button>
        </div>
      </div>

      {/* ── Filter bar */}
      <div style={{ ...card, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Row 1: search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.surf2, borderRadius: 9, padding: '8px 12px' }}>
          <Search size={13} color={T.muted} />
          <input
            placeholder="Buscar cliente, proyecto…"
            value={q} onChange={e => setQ(e.target.value)}
            style={{ border: 'none', background: 'transparent', fontSize: 13, color: T.text, outline: 'none', width: '100%', fontFamily: "inherit" }}
          />
        </div>
        {/* Row 2: chips scrollables */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', overflow: 'hidden' }}>
          <div className="chip-scroll">
            {PERIODS.map(p => (
              <ChipBtn key={p} active={period === p} onClick={() => setPeriod(p)}>{p}</ChipBtn>
            ))}
          </div>
          <div style={{ width: 1, height: 20, background: T.border, flexShrink: 0 }} />
          <div className="chip-scroll">
            {['Todos', ...STATUS_LIST].map(s => (
              <ChipBtn key={s} active={statusFil === s} onClick={() => setStatusFil(s)}>{s}</ChipBtn>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI strip */}
      <KpiStrip items={[
        { label: 'Total facturado', value: totalFact,    accent: T.text,  sub: `${filtered.length} facturas` },
        { label: 'Cobrado',         value: totalCobrado, accent: T.green, sub: 'Estado: Pagado' },
        { label: 'Pendiente',       value: totalPend,    accent: T.amber, sub: 'Pendiente + Parcial' },
      ]} />

      {/* ── Table */}
      <div className="tbl-wrap" style={{ background: T.surf, borderRadius: 14, border: `1px solid ${T.border}`, maxHeight: 560, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr>
              <Th>Cliente</Th>
              <th className="col-hide-mobile" style={thCell}>Proyecto</th>
              <Th sortable active dir={sortDir} onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}>Fecha</Th>
              <th style={thRight}>Monto</th>
              <th className="col-hide-mobile" style={thRight}>Base</th>
              <th className="col-hide-mobile" style={thRight}>IVA</th>
              <Th>Estado</Th>
              <th className="col-hide-mobile" style={thCell}>Método</th>
              <th style={thCell}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <EmptyState
                  icon={Inbox}
                  title="Sin ingresos en este período"
                  subtitle="Registra tu primera factura para comenzar a ver tus ingresos aquí."
                  ctaLabel="Registrar ingreso"
                  onCta={onAdd}
                />
              : filtered.map(i => {
                  const overdue = isOverdue(i)
                  const canPay  = i.status === 'Pendiente' || i.status === 'Parcial'
                  const isHovered = hoveredRow === i.id
                  return (
                    <tr key={i.id}
                      onMouseEnter={() => setHoveredRow(i.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        borderBottom: `1px solid ${T.border}`,
                        borderLeft: overdue ? `3px solid ${T.red}` : '3px solid transparent',
                        background: overdue ? 'rgba(215,43,32,.025)' : isHovered ? T.surf2 : 'transparent',
                        transition: 'background .1s',
                      }}>
                      {/* Cliente */}
                      <td style={{ ...tdBase, paddingLeft: overdue ? 11 : 14 }}>
                        <span style={{ fontWeight: 600, color: T.text }}>{i.client}</span>
                      </td>

                      {/* Proyecto */}
                      <td className="col-hide-mobile" style={{ ...tdBase, color: T.text2, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.project}</td>

                      {/* Fecha */}
                      <td style={{ ...tdBase, fontSize: 12, color: T.muted, minWidth: 60 }}>
                        {fmtDateCompact(i.date)}
                      </td>

                      {/* Monto */}
                      <td style={{ ...tdMono, fontWeight: 700, color: T.green }}>
                        {fmtS(i.amount)}
                      </td>

                      {/* Base */}
                      <td className="col-hide-mobile" style={{ ...tdMono, fontSize: 12, color: T.text2 }}>
                        {fmtS(getBase(i))}
                      </td>

                      {/* IVA */}
                      <td className="col-hide-mobile" style={{ ...tdMono, fontSize: 12, color: T.amber }}>
                        {i.hasIVA ? fmtS(getIVA(i)) : '—'}
                      </td>

                      {/* Estado */}
                      <td style={{ ...tdBase }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                          <Pill s={i.status} />
                          {overdue && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                              background: T.redBg2, color: T.red, border: `1px solid rgba(215,43,32,.2)`,
                              display: 'inline-flex', alignItems: 'center', gap: 3,
                            }}>
                              <Clock size={8} />Vencida
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Método */}
                      <td className="col-hide-mobile" style={{ ...tdBase, fontSize: 12, color: T.muted }}>{i.method}</td>

                      {/* Acciones */}
                      <td style={{ ...tdBase }}>
                        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                          {canPay && (
                            <button
                              onClick={() => onMarkPaid && onMarkPaid(i.id)}
                              title="Marcar como pagado"
                              style={{
                                background: T.greenBg2, border: 'none', borderRadius: 7,
                                padding: '5px 8px', cursor: 'pointer', display: 'inline-flex',
                              }}>
                              <CheckCircle size={11} color={T.green} />
                            </button>
                          )}
                          <ActionBtns
                            onEdit={() => onEdit(i)}
                            onDelete={() => onDelete(i.id, 'ingreso')}
                            onDuplicate={() => onAdd({ ...i, id: undefined, status: 'Pendiente', date: new Date().toISOString().slice(0,10) })}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── EXPENSES VIEW ───────────────────────────────────────── */
export function ExpensesView({ expenses, allExpenses, onAdd, onEdit, onDelete }) {
  const allExp = allExpenses ?? expenses
  const [q, setQ]     = useState('')
  const [cat, setCat] = useState('Todos')
  const [typeFilter, setTypeFilter] = useState('Todos') // 'Todos' | 'Recurrentes' | 'Manuales'
  const [sortDir, setSortDir] = useState('desc')
  const [hoveredRow, setHoveredRow] = useState(null)

  const filtered = useMemo(() => {
    return expenses
      .filter(e => {
        const desc  = (e.desc || e.description || '')
        const text  = (desc + ' ' + (e.provider || '') + ' ' + (e.cat || '')).toLowerCase()
        const matchQ    = !q || text.includes(q.toLowerCase())
        const matchCat  = cat === 'Todos' || e.cat === cat
        const matchType = typeFilter === 'Todos'
          || (typeFilter === 'Recurrentes' && e.autoGenerated)
          || (typeFilter === 'Manuales'    && !e.autoGenerated)
        return matchQ && matchCat && matchType
      })
      .sort((a, b) => {
        const diff = new Date(a.date) - new Date(b.date)
        return sortDir === 'desc' ? -diff : diff
      })
  }, [expenses, q, cat, typeFilter, sortDir])

  const total    = filtered.reduce((s, e) => s + Number(e.amount), 0)
  const avgAmt   = filtered.length ? total / filtered.length : 0

  // Largest category
  const catTotals = useMemo(() => {
    const m = {}
    filtered.forEach(e => { m[e.cat] = (m[e.cat] || 0) + Number(e.amount) })
    return Object.entries(m).sort((a, b) => b[1] - a[1])
  }, [filtered])
  const topCat = catTotals[0]

  const handleExportCSV = () => {
    const rows = filtered.map(e => ({
      Fecha:        e.date,
      Categoría:    e.cat || '',
      Descripción:  e.desc || e.description || '',
      Proveedor:    e.provider || '',
      Monto:        Number(e.amount),
      Base:         Math.round(getBase(e)),
      IVA:          e.hasIVA ? Math.round(getIVA(e)) : 0,
      Método:       e.method || '',
      Recurrente:   e.autoGenerated ? 'Sí' : 'No',
    }))
    exportCSV(rows, `egresos-${new Date().toISOString().slice(0,10)}.csv`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── Page header */}
      <div className="page-hdr">
        <div>
          <div className="page-title">Egresos</div>
          <div className="page-sub">
            {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'} · total{' '}
            <span style={{ color: T.red, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{fmt(total)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
          <button onClick={handleExportCSV} style={{ ...btnGhost, padding: '7px 13px', fontSize: 12, gap: 5 }}>
            <Download size={13} color={T.muted} />
            <span className="btnText">Exportar</span>
          </button>
          <button onClick={() => onAdd()} style={btnRed}>
            <Plus size={14} />Nuevo egreso
          </button>
        </div>
      </div>

      {/* ── Filter bar */}
      <div style={{ ...card, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: T.surf2, borderRadius: 9, padding: '8px 12px', minWidth: 200 }}>
          <Search size={13} color={T.muted} />
          <input
            placeholder="Buscar descripción, proveedor…"
            value={q} onChange={e => setQ(e.target.value)}
            style={{ border: 'none', background: 'transparent', fontSize: 13, color: T.text, outline: 'none', width: '100%', fontFamily: "inherit" }}
          />
        </div>

        {/* Category select */}
        <select value={cat} onChange={e => setCat(e.target.value)}
          style={{ ...inp, width: 'auto', padding: '7px 12px', fontSize: 12, minWidth: 140 }}>
          <option>Todos</option>
          {EXP_CATS.map(c => <option key={c}>{c}</option>)}
        </select>

        {/* Type toggle chips */}
        <div style={{ display: 'flex', gap: 5, borderLeft: `1px solid ${T.border}`, paddingLeft: 10 }}>
          {['Todos', 'Recurrentes', 'Manuales'].map(t => (
            <ChipBtn key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>{t}</ChipBtn>
          ))}
        </div>
      </div>

      {/* ── KPI strip */}
      <KpiStrip items={[
        { label: 'Total egresos',      value: total,   accent: T.red,   sub: `${filtered.length} transacciones` },
        { label: 'Promedio por egreso', value: avgAmt, accent: T.amber, sub: 'Por transacción' },
        { label: topCat ? topCat[0] : 'Sin categoría', value: topCat ? topCat[1] : 0, accent: T.violet, sub: 'Categoría mayor' },
      ]} />

      {/* ── Table */}
      <div className="tbl-wrap" style={{ background: T.surf, borderRadius: 14, border: `1px solid ${T.border}`, maxHeight: 560, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr>
              <Th sortable active dir={sortDir} onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}>Fecha</Th>
              <th className="col-hide-mobile" style={thCell}>Categoría</th>
              <Th>Descripción</Th>
              <th className="col-hide-mobile" style={thCell}>Proveedor</th>
              <th style={thRight}>Monto</th>
              <th className="col-hide-mobile" style={thRight}>Base</th>
              <th className="col-hide-mobile" style={thRight}>IVA</th>
              <th className="col-hide-mobile" style={thCell}>Método</th>
              <th style={thCell}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <EmptyState
                  icon={BarChart2}
                  title="Sin egresos en este período"
                  subtitle="Registra tus gastos y costos para llevar un control preciso."
                  ctaLabel="Registrar egreso"
                  onCta={onAdd}
                />
              : filtered.map(e => {
                  const catTheme = CAT_COLORS[e.cat] || { bg: T.surf2, c: T.text2 }
                  const overdue  = e.status && e.status !== 'Pagado' && isOverdue(e)
                  const isHovered = hoveredRow === e.id
                  return (
                    <tr key={e.id}
                      onMouseEnter={() => setHoveredRow(e.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        borderBottom: `1px solid ${T.border}`,
                        borderLeft: overdue ? `3px solid ${T.red}` : '3px solid transparent',
                        background: overdue ? 'rgba(215,43,32,.025)' : isHovered ? T.surf2 : 'transparent',
                        opacity: e.autoGenerated ? 0.93 : 1,
                        transition: 'background .1s',
                      }}>
                      {/* Fecha */}
                      <td style={{ ...tdBase, paddingLeft: overdue ? 11 : 14, fontSize: 12, color: T.muted, minWidth: 60 }}>
                        {fmtDateCompact(e.date)}
                      </td>

                      {/* Categoría */}
                      <td className="col-hide-mobile" style={{ ...tdBase }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6,
                          background: catTheme.bg, color: catTheme.c,
                          border: `1px solid ${catTheme.c}22`,
                        }}>{e.cat}</span>
                      </td>

                      {/* Descripción */}
                      <td style={{ ...tdBase, maxWidth: 260 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          {e.autoGenerated && (
                            <span title="Generado automáticamente desde Recurrentes" style={{
                              display: 'inline-flex', alignItems: 'center', gap: 3,
                              fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 5,
                              background: T.violetBg, color: T.violet,
                              border: `1px solid rgba(90,62,231,.2)`, flexShrink: 0,
                            }}>
                              <RefreshCw size={8} />AUTO
                            </span>
                          )}
                          <span style={{ fontSize: 13, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {e.desc || e.description}
                          </span>
                        </div>
                      </td>

                      {/* Proveedor */}
                      <td className="col-hide-mobile" style={{ ...tdBase, fontSize: 12, color: T.text2 }}>{e.provider}</td>

                      {/* Monto */}
                      <td style={{ ...tdMono, fontWeight: 700, color: T.red }}>
                        {fmtS(e.amount)}
                      </td>

                      {/* Base */}
                      <td className="col-hide-mobile" style={{ ...tdMono, fontSize: 12, color: T.text2 }}>
                        {fmtS(getBase(e))}
                      </td>

                      {/* IVA */}
                      <td className="col-hide-mobile" style={{ ...tdMono, fontSize: 12, color: T.amber }}>
                        {e.hasIVA ? fmtS(getIVA(e)) : '—'}
                      </td>

                      {/* Método */}
                      <td className="col-hide-mobile" style={{ ...tdBase, fontSize: 12, color: T.muted }}>{e.method}</td>

                      {/* Acciones */}
                      <td style={{ ...tdBase }}>
                        {e.autoGenerated
                          ? <span title="Gestiona este gasto desde Recurrentes" style={{
                              fontSize: 10, color: T.muted, padding: '3px 8px', borderRadius: 6,
                              border: `1px solid ${T.border}`, cursor: 'default', display: 'inline-flex', alignItems: 'center', gap: 4,
                            }}>
                              <RefreshCw size={8} />Recurrente
                            </span>
                          : <ActionBtns
                              onEdit={() => onEdit(e)}
                              onDelete={() => onDelete(e.id, 'egreso')}
                              onDuplicate={() => onAdd({ ...e, id: undefined, date: new Date().toISOString().slice(0,10) })}
                            />
                        }
                      </td>
                    </tr>
                  )
                })
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
