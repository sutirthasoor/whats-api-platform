'use client'
import { useEffect, useSyncExternalStore } from 'react'
import { SEED, type Row } from './seed'
export type { Row }

/**
 * DATA SOURCE PROVISION
 * All demo screens read/write through `db` + `useCollection`, never directly
 * to storage. To connect a real database, implement `DataProvider` (e.g. with
 * fetch() calls to Next.js route handlers backed by Postgres/Supabase) and call
 * `setDataProvider(new MyApiProvider())` once at startup. No screen changes.
 */
export interface DataProvider {
  list(collection: string): Promise<Row[]>
  create(collection: string, row: Row): Promise<Row>
  update(collection: string, id: string, patch: Partial<Row>): Promise<void>
  remove(collection: string, id: string): Promise<void>
  reset?(): Promise<void>
}

const PREFIX = 'wcrm-demo:'
class DemoProvider implements DataProvider {
  private read(c: string): Row[] {
    try { const raw = localStorage.getItem(PREFIX + c); if (raw) return JSON.parse(raw) as Row[] } catch {}
    const seed = SEED[c]?.() ?? []
    this.write(c, seed)
    return seed
  }
  private write(c: string, rows: Row[]) { try { localStorage.setItem(PREFIX + c, JSON.stringify(rows)) } catch {} }
  async list(c: string) { return this.read(c) }
  async create(c: string, row: Row) { this.write(c, [row, ...this.read(c)]); return row }
  async update(c: string, id: string, patch: Partial<Row>) { this.write(c, this.read(c).map(r => (r.id === id ? { ...r, ...patch } : r))) }
  async remove(c: string, id: string) { this.write(c, this.read(c).filter(r => r.id !== id)) }
  async reset() { Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).forEach(k => localStorage.removeItem(k)) }
}

let provider: DataProvider = new DemoProvider()
const cache = new Map<string, Row[]>()
const pending = new Map<string, Promise<void>>()
const listeners = new Set<() => void>()
const EMPTY: Row[] = []
const emit = () => listeners.forEach(l => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l) } }

export function setDataProvider(p: DataProvider) { provider = p; cache.clear(); pending.clear(); emit() }
export const uid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

function ensure(c: string): Promise<void> {
  let p = pending.get(c)
  if (!p) {
    p = provider.list(c).then(rows => { cache.set(c, rows); emit() })
    pending.set(c, p)
  }
  return p
}

export const db = {
  async all(c: string) { await ensure(c); return cache.get(c) ?? EMPTY },
  async create(c: string, data: Partial<Row>) {
    await ensure(c)
    const row: Row = { ...data, id: data.id ?? uid(c) }
    cache.set(c, [row, ...(cache.get(c) ?? [])]); emit()
    await provider.create(c, row)
    return row
  },
  async update(c: string, id: string, patch: Partial<Row>) {
    await ensure(c)
    cache.set(c, (cache.get(c) ?? []).map(r => (r.id === id ? { ...r, ...patch } : r))); emit()
    await provider.update(c, id, patch)
  },
  async remove(c: string, id: string) {
    await ensure(c)
    cache.set(c, (cache.get(c) ?? []).filter(r => r.id !== id)); emit()
    await provider.remove(c, id)
  },
  async reset() { await provider.reset?.(); cache.clear(); pending.clear(); emit() },
}

export function useCollection(c: string) {
  useEffect(() => { void ensure(c) }, [c])
  const rows = useSyncExternalStore(subscribe, () => cache.get(c) ?? EMPTY, () => EMPTY)
  const ready = useSyncExternalStore(subscribe, () => cache.has(c), () => false)
  return { rows, ready }
}

/** Single-document collections (settings, theme…). */
export function useDoc(c: string): [Row, (p: Partial<Row>) => Promise<void>] {
  const { rows } = useCollection(c)
  const row = rows[0]
  const patch = async (p: Partial<Row>) => { if (row) await db.update(c, row.id, p); else await db.create(c, { id: 'main', ...p }) }
  return [row ?? { id: 'main' }, patch]
}
