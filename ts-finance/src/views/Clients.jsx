import { useState, useMemo } from 'react'
import { Plus, Edit2, Trash2, Search, User, TrendingUp, Clock, CheckCircle, ChevronRight, X, Mail, Phone, FileText, Building2 } from 'lucide-react'
import { T, fmt, fmtS, uid } from '../constants.js'
import { card, inp, lbl, btnGreen, btnGhost } from '../ui.jsx'
import { Pill } from '../ui.jsx'

function ClientModal({ initial, onSave, onClose }) {
  const [f, setF] = useState(initial || { name: "", nit: "", email: "", phone: "", contacto: "", notas: "" })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
      <div style={{ background: T.surf, borderRadius: 18, border: `1px solid ${T.border}`, padding: 28, width: "100%", maxWidth: 480, boxShadow: "0 32px 80px rgba(0,0,0,.6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: T.white, fontFamily: "'Inter',sans-serif" }}>{initial ? "Editar cliente" : "Nuevo cliente"}</h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: T.muted }}>Información del cliente de Tres Studio</p>
          </div>
          <button onClick={onClose} style={{ background: T.surf2, border: `1px solid ${T.border}`, borderRadius: 9, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={15} color={T.text2} />
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "1/-1" }}><label style={lbl}>Nombre / Razón social *</label><input style={inp} value={f.name} onChange={e => set("name", e.target.value)} placeholder="Bancolombia S.A." /></div>
          <div><label style={lbl}>NIT / Cédula</label><input style={inp} value={f.nit} onChange={e => set("nit", e.target.value)} placeholder="900.123.456-7" /></div>
          <div><label style={lbl}>Contacto</label><input style={inp} value={f.contacto} onChange={e => set("contacto", e.target.value)} placeholder="Nombre del contacto" /></div>
          <div><label style={lbl}>Email</label><input style={inp} type="email" value={f.email} onChange={e => set("email", e.target.value)} placeholder="contacto@empresa.com" /></div>
          <div><label style={lbl}>Teléfono</label><input style={inp} value={f.phone} onChange={e => set("phone", e.target.value)} placeholder="+57 300 123 4567" /></div>
          <div style={{ gridColumn: "1/-1" }}><label style={lbl}>Notas</label><input style={inp} value={f.notas} onChange={e => set("notas", e.target.value)} placeholder="Información adicional..." /></div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={btnGhost}>Cancelar</button>
          <button onClick={() => { if (f.name.trim()) onSave({ ...f, id: f.id || uid() }) }} style={btnGreen}>
            <CheckCircle size={14} />{initial ? "Actualizar" : "Guardar cliente"}
          </button>
        </div>
      </div>
    </div>
  )
}

function ClientDetail({ client, incomes, onEdit, onClose }) {
  const clientInc = incomes.filter(i => i.client.toLowerCase() === client.name.toLowerCase())
  const total     = clientInc.reduce((s, i) => s + Number(i.amount), 0)
  const cobrado   = clientInc.filter(i => i.status === "Pagado").reduce((s, i) => s + Number(i.amount), 0)
  const pendiente = clientInc.filter(i => i.status === "Pendiente").reduce((s, i) => s + Number(i.amount), 0)
  const parcial   = clientInc.filter(i => i.status === "Parcial").reduce((s, i) => s + Number(i.amount), 0)

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
      <div style={{ background: T.surf, borderRadius: 18, border: `1px solid ${T.border}`, padding: 0, width: "100%", maxWidth: 580, maxHeight: "88vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(0,0,0,.6)" }}>
        {/* Header */}
        <div style={{ padding: "24px 28px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: T.greenBg, border: `1px solid ${T.green}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: T.green }}>{client.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: T.white }}>{client.name}</div>
              {client.nit && <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>NIT: {client.nit}</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onEdit(client)} style={{ background: T.surf2, border: `1px solid ${T.border}`, borderRadius: 9, padding: "6px 12px", cursor: "pointer", fontSize: 12, color: T.text2, display: "flex", alignItems: "center", gap: 5 }}>
              <Edit2 size={12} />Editar
            </button>
            <button onClick={onClose} style={{ background: T.surf2, border: `1px solid ${T.border}`, borderRadius: 9, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={15} color={T.text2} />
            </button>
          </div>
        </div>

        <div style={{ overflowY: "auto", padding: "20px 28px 24px" }}>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Total facturado", value: total, color: T.white },
              { label: "Cobrado", value: cobrado, color: T.green },
              { label: "Pendiente", value: pendiente + parcial, color: pendiente + parcial > 0 ? T.amber : T.muted },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: T.surf2, borderRadius: 10, padding: "14px 16px", border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 8 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color, fontFamily: "'DM Mono',monospace", letterSpacing: "-0.5px" }}>{fmtS(value)}</div>
              </div>
            ))}
          </div>

          {/* Contact info */}
          {(client.email || client.phone || client.contacto) && (
            <div style={{ background: T.surf2, borderRadius: 10, padding: "14px 16px", border: `1px solid ${T.border}`, marginBottom: 18, display: "flex", flexWrap: "wrap", gap: 16 }}>
              {client.contacto && <div style={{ display: "flex", alignItems: "center", gap: 7 }}><User size={12} color={T.muted} /><span style={{ fontSize: 13, color: T.text2 }}>{client.contacto}</span></div>}
              {client.email && <div style={{ display: "flex", alignItems: "center", gap: 7 }}><Mail size={12} color={T.muted} /><span style={{ fontSize: 13, color: T.text2 }}>{client.email}</span></div>}
              {client.phone && <div style={{ display: "flex", alignItems: "center", gap: 7 }}><Phone size={12} color={T.muted} /><span style={{ fontSize: 13, color: T.text2 }}>{client.phone}</span></div>}
              {client.notas && <div style={{ display: "flex", alignItems: "center", gap: 7 }}><FileText size={12} color={T.muted} /><span style={{ fontSize: 13, color: T.text2 }}>{client.notas}</span></div>}
            </div>
          )}

          {/* Transactions */}
          <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 10 }}>
            Historial de facturas ({clientInc.length})
          </div>
          {clientInc.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: T.muted, fontSize: 13 }}>Sin facturas registradas</div>
          ) : (
            clientInc.sort((a, b) => new Date(b.date) - new Date(a.date)).map((inc, i, arr) => (
              <div key={inc.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.white }}>{inc.project}</div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{inc.date} · {inc.method}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Pill s={inc.status} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.green, fontFamily: "'DM Mono',monospace" }}>{fmtS(inc.amount)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function ClientsView({ clients, incomes, onAdd, onEdit, onDelete }) {
  const [q, setQ] = useState("")
  const [detail, setDetail] = useState(null)

  const enriched = useMemo(() => clients.map(c => {
    const ci = incomes.filter(i => i.client.toLowerCase() === c.name.toLowerCase())
    const total     = ci.reduce((s, i) => s + Number(i.amount), 0)
    const cobrado   = ci.filter(i => i.status === "Pagado").reduce((s, i) => s + Number(i.amount), 0)
    const pendiente = ci.filter(i => i.status !== "Pagado").reduce((s, i) => s + Number(i.amount), 0)
    return { ...c, total, cobrado, pendiente, facturas: ci.length, lastDate: ci.sort((a,b) => new Date(b.date)-new Date(a.date))[0]?.date }
  }).filter(c => !q || c.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.total - a.total), [clients, incomes, q])

  const totalFacturado = enriched.reduce((s, c) => s + c.total, 0)
  const totalPendiente = enriched.reduce((s, c) => s + c.pendiente, 0)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: T.white }}>Clientes</h2>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: T.muted }}>
            {clients.length} clientes · facturado{" "}
            <span style={{ color: T.green, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{fmtS(totalFacturado)}</span>
            {totalPendiente > 0 && <> · pendiente <span style={{ color: T.amber, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{fmtS(totalPendiente)}</span></>}
          </p>
        </div>
        <button onClick={onAdd} style={btnGreen}><Plus size={14} />Nuevo cliente</button>
      </div>

      {/* Search */}
      <div style={{ ...card, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
        <Search size={13} color={T.muted} />
        <input placeholder="Buscar cliente..." value={q} onChange={e => setQ(e.target.value)}
          style={{ border: "none", background: "transparent", fontSize: 13, color: T.text, outline: "none", width: "100%" }} />
      </div>

      {/* Grid */}
      {enriched.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "60px 0", color: T.muted }}>
          <User size={32} color={T.border} style={{ margin: "0 auto 12px" }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text2 }}>Sin clientes aún</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Los clientes se agregan automáticamente al registrar ingresos</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {enriched.map(c => (
            <div key={c.id} onClick={() => setDetail(c)} style={{ ...card, cursor: "pointer", transition: "border-color .15s, transform .1s", position: "relative" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.green + "40"; e.currentTarget.style.transform = "translateY(-1px)" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: T.greenBg, border: `1px solid ${T.green}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: T.green }}>{c.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.white, lineHeight: 1.2 }}>{c.name}</div>
                    {c.nit && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{c.nit}</div>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 5 }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => onEdit(c)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Edit2 size={12} color={T.muted} /></button>
                  <button onClick={() => onDelete(c.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Trash2 size={12} color={T.muted} /></button>
                </div>
              </div>

              {/* Balance bar */}
              {c.total > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ height: 5, borderRadius: 3, background: T.surf2, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 3, background: T.green, width: `${Math.min(100, (c.cobrado / c.total) * 100)}%`, transition: "width .3s" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                    <span style={{ fontSize: 10, color: T.muted }}>Cobrado {c.total > 0 ? Math.round(c.cobrado / c.total * 100) : 0}%</span>
                    {c.pendiente > 0 && <span style={{ fontSize: 10, color: T.amber, fontWeight: 700 }}>Pendiente: {fmtS(c.pendiente)}</span>}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div style={{ display: "flex", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: ".5px" }}>Facturado</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: T.white, fontFamily: "'DM Mono',monospace", letterSpacing: "-0.5px" }}>{fmtS(c.total)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: ".5px" }}>Facturas</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>{c.facturas}</div>
                </div>
                {c.lastDate && (
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: ".5px" }}>Último</div>
                    <div style={{ fontSize: 12, color: T.muted }}>{c.lastDate}</div>
                  </div>
                )}
              </div>

              {/* Contact hints */}
              {(c.email || c.phone) && (
                <div style={{ display: "flex", gap: 10, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                  {c.email && <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Mail size={11} color={T.muted} /><span style={{ fontSize: 11, color: T.muted }}>{c.email}</span></div>}
                  {c.phone && <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Phone size={11} color={T.muted} /><span style={{ fontSize: 11, color: T.muted }}>{c.phone}</span></div>}
                </div>
              )}

              <ChevronRight size={14} color={T.border} style={{ position: "absolute", bottom: 16, right: 16 }} />
            </div>
          ))}
        </div>
      )}

      {detail && <ClientDetail client={detail} incomes={incomes} onEdit={c => { setDetail(null); onEdit(c) }} onClose={() => setDetail(null)} />}
    </div>
  )
}
