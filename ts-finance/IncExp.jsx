import { useState } from 'react'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { T, EXP_CATS, STATUS_LIST, fmtS, fmt, getIVA, getBase } from '../constants.js'
import { card, inp, btnGreen, btnRed, btnGhost, Pill } from '../ui.jsx'

function TableShell({ title, count, total, totalColor, addBtn, searchVal, onSearch, filterEl, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: T.white, fontFamily: "'Inter',sans-serif" }}>{title}</h2>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: T.muted }}>
            {count} registros ·{" "}
            <span style={{ color: totalColor, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{fmt(total)}</span>
          </p>
        </div>
        {addBtn}
      </div>
      <div style={{ ...card, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: T.surf2, borderRadius: 9, padding: "8px 12px", minWidth: 200 }}>
          <Search size={13} color={T.muted} />
          <input placeholder="Buscar..." value={searchVal} onChange={e => onSearch(e.target.value)} style={{ border: "none", background: "transparent", fontSize: 13, color: T.text, outline: "none", width: "100%", fontFamily: "'Inter',sans-serif" }} />
        </div>
        {filterEl}
      </div>
      <div style={{ ...card, overflowX: "auto" }}>{children}</div>
    </div>
  )
}

function Tbl({ headers, children }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
      <thead>
        <tr>{headers.map(h => (
          <th key={h} style={{ textAlign: "left", fontSize: 10, fontWeight: 700, color: T.muted, padding: "0 12px 12px", textTransform: "uppercase", letterSpacing: ".7px", borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap" }}>{h}</th>
        ))}</tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  )
}

function ActionBtns({ onEdit, onDelete }) {
  return (
    <div style={{ display: "flex", gap: 5 }}>
      <button onClick={onEdit} style={{ background: T.blueBg, border: "none", borderRadius: 7, padding: "5px 8px", cursor: "pointer" }}><Edit2 size={11} color={T.blue} /></button>
      <button onClick={onDelete} style={{ background: T.redBg, border: "none", borderRadius: 7, padding: "5px 8px", cursor: "pointer" }}><Trash2 size={11} color={T.red} /></button>
    </div>
  )
}

const td = (content, mono = false) => (
  <td style={{ padding: "11px 12px", fontSize: 13, color: T.text, fontFamily: mono ? "'DM Mono',monospace" : "inherit", whiteSpace: "nowrap" }}>{content}</td>
)

/* ── INCOMES ─────────────────────────────────────────────── */
export function IncomesView({ incomes, onAdd, onEdit, onDelete }) {
  const [q, setQ] = useState("")
  const [fil, setFil] = useState("Todos")
  const filtered = incomes.filter(i => {
    const match = !q || (i.client + i.project + i.notes).toLowerCase().includes(q.toLowerCase())
    return match && (fil === "Todos" || i.status === fil)
  }).sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <TableShell
      title="Ingresos" count={filtered.length}
      total={filtered.reduce((s, i) => s + Number(i.amount), 0)} totalColor={T.green}
      addBtn={<button onClick={onAdd} style={btnGreen}><Plus size={14} />Nuevo ingreso</button>}
      searchVal={q} onSearch={setQ}
      filterEl={
        <div style={{ display: "flex", gap: 6 }}>
          {["Todos", ...STATUS_LIST].map(s => (
            <button key={s} onClick={() => setFil(s)} style={{ padding: "7px 12px", borderRadius: 8, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", background: fil === s ? T.green : T.surf2, color: fil === s ? "#000" : T.muted, fontFamily: "'Inter',sans-serif" }}>{s}</button>
          ))}
        </div>
      }
    >
      <Tbl headers={["Cliente", "Proyecto", "Fecha", "Monto", "Base", "IVA", "Estado", "Método", ""]}>
        {filtered.length === 0
          ? <tr><td colSpan={9} style={{ textAlign: "center", padding: "48px", color: T.muted, fontSize: 13 }}>Sin registros</td></tr>
          : filtered.map(i => (
            <tr key={i.id} style={{ borderBottom: `1px solid ${T.border}` }}>
              <td style={{ padding: "11px 12px" }}><span style={{ fontSize: 13, fontWeight: 700, color: T.white }}>{i.client}</span></td>
              {td(i.project)}
              <td style={{ padding: "11px 12px", fontSize: 12, color: T.muted }}>{i.date}</td>
              <td style={{ padding: "11px 12px", fontSize: 13, fontWeight: 700, color: T.green, fontFamily: "'DM Mono',monospace" }}>{fmtS(i.amount)}</td>
              <td style={{ padding: "11px 12px", fontSize: 12, color: T.text2, fontFamily: "'DM Mono',monospace" }}>{fmtS(getBase(i))}</td>
              <td style={{ padding: "11px 12px", fontSize: 12, color: T.amber, fontFamily: "'DM Mono',monospace" }}>{i.hasIVA ? fmtS(getIVA(i)) : "—"}</td>
              <td style={{ padding: "11px 12px" }}><Pill s={i.status} /></td>
              <td style={{ padding: "11px 12px", fontSize: 12, color: T.muted }}>{i.method}</td>
              <td style={{ padding: "11px 12px" }}><ActionBtns onEdit={() => onEdit(i)} onDelete={() => onDelete(i.id, "ingreso")} /></td>
            </tr>
          ))}
      </Tbl>
    </TableShell>
  )
}

/* ── EXPENSES ────────────────────────────────────────────── */
export function ExpensesView({ expenses, onAdd, onEdit, onDelete }) {
  const [q, setQ] = useState("")
  const [cat, setCat] = useState("Todos")
  const filtered = expenses.filter(e => {
    const match = !q || ((e.desc||e.description) + e.provider + e.cat).toLowerCase().includes(q.toLowerCase())
    return match && (cat === "Todos" || e.cat === cat)
  }).sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <TableShell
      title="Egresos" count={filtered.length}
      total={filtered.reduce((s, e) => s + Number(e.amount), 0)} totalColor={T.red}
      addBtn={<button onClick={onAdd} style={btnRed}><Plus size={14} />Nuevo egreso</button>}
      searchVal={q} onSearch={setQ}
      filterEl={
        <select value={cat} onChange={e => setCat(e.target.value)} style={{ ...inp, width: "auto", padding: "7px 12px", fontSize: 12 }}>
          <option>Todos</option>
          {EXP_CATS.map(c => <option key={c}>{c}</option>)}
        </select>
      }
    >
      <Tbl headers={["Fecha", "Categoría", "Descripción", "Proveedor", "Monto", "Base", "IVA", "Método", ""]}>
        {filtered.length === 0
          ? <tr><td colSpan={9} style={{ textAlign: "center", padding: "48px", color: T.muted, fontSize: 13 }}>Sin registros</td></tr>
          : filtered.map(e => (
            <tr key={e.id} style={{ borderBottom: `1px solid ${T.border}` }}>
              <td style={{ padding: "11px 12px", fontSize: 12, color: T.muted }}>{e.date}</td>
              <td style={{ padding: "11px 12px" }}><span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: T.surf2, color: T.text2, border: `1px solid ${T.border}` }}>{e.cat}</span></td>
              <td style={{ padding: "11px 12px", fontSize: 13, color: T.text }}>{e.desc||e.description}</td>
              <td style={{ padding: "11px 12px", fontSize: 13, color: T.text2 }}>{e.provider}</td>
              <td style={{ padding: "11px 12px", fontSize: 13, fontWeight: 700, color: T.red, fontFamily: "'DM Mono',monospace" }}>{fmtS(e.amount)}</td>
              <td style={{ padding: "11px 12px", fontSize: 12, color: T.text2, fontFamily: "'DM Mono',monospace" }}>{fmtS(getBase(e))}</td>
              <td style={{ padding: "11px 12px", fontSize: 12, color: T.amber, fontFamily: "'DM Mono',monospace" }}>{e.hasIVA ? fmtS(getIVA(e)) : "—"}</td>
              <td style={{ padding: "11px 12px", fontSize: 12, color: T.muted }}>{e.method}</td>
              <td style={{ padding: "11px 12px" }}><ActionBtns onEdit={() => onEdit(e)} onDelete={() => onDelete(e.id, "egreso")} /></td>
            </tr>
          ))}
      </Tbl>
    </TableShell>
  )
}
