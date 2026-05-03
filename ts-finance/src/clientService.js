import { supabase, hasSupabase } from './supabase.js'
import { uid } from './constants.js'

const ls = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} },
}

// Auto-sync: extract unique clients from incomes and merge into clients list
export function syncClientsFromIncomes(incomes, existingClients) {
  const map = {}
  existingClients.forEach(c => { map[c.name.toLowerCase()] = c })
  incomes.forEach(i => {
    const key = i.client.toLowerCase()
    if (!map[key]) {
      map[key] = {
        id: uid(), name: i.client, email: "", phone: "", nit: "",
        contacto: "", notas: "", createdAt: i.date
      }
    }
  })
  return Object.values(map)
}

export const clientService = {
  async getAll() {
    if (!hasSupabase) return ls.get('ts_clients', [])
    const { data } = await supabase.from('clients').select('*').order('name')
    return data || []
  },
  async upsert(item) {
    if (!hasSupabase) {
      const all = ls.get('ts_clients', [])
      const next = all.find(c => c.id === item.id)
        ? all.map(c => c.id === item.id ? item : c)
        : [...all, item]
      ls.set('ts_clients', next)
      return next
    }
    await supabase.from('clients').upsert({
      id: item.id, name: item.name, email: item.email,
      phone: item.phone, nit: item.nit,
      contacto: item.contacto, notas: item.notas,
    })
    return clientService.getAll()
  },
  async remove(id) {
    if (!hasSupabase) {
      const next = ls.get('ts_clients', []).filter(c => c.id !== id)
      ls.set('ts_clients', next)
      return next
    }
    await supabase.from('clients').delete().eq('id', id)
    return clientService.getAll()
  },
}
