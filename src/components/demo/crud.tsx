'use client'
import { useMemo, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, Download, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { db, useCollection, type Row } from '@/lib/demo/store'
import { Badge, Btn, Card, Input, Label, Menu, Modal, PageHead, Select, Stats, Stat, Switch, Textarea, downloadCSV, fdate, fdt, inr } from './ui'

export interface Field { key: string; label: string; type?: 'text' | 'number' | 'email' | 'tel' | 'date' | 'datetime-local' | 'select' | 'textarea' | 'switch' | 'url'; options?: string[]; required?: boolean; full?: boolean; placeholder?: string }
export interface Col { key: string; label: string; render?: (r: Row) => ReactNode; badge?: boolean; money?: boolean; date?: boolean; datetime?: boolean }
export interface ActionCtx { update: (id: string, p: Partial<Row>) => Promise<void>; remove: (id: string) => Promise<void>; rows: Row[] }
export interface Action { label: string; run: (r: Row, c: ActionCtx) => void | Promise<void>; show?: (r: Row) => boolean; danger?: boolean }
export interface CrudConfig {
  collection: string; title: string; description?: string; singular: string
  columns: Col[]; fields: Field[]; defaults?: Partial<Row>; addLabel?: string
  filter?: { key: string }; actions?: Action[]; stats?: (rows: Row[]) => { label: string; value: ReactNode; hint?: string }[]
  readOnly?: boolean; noAdd?: boolean; extra?: (rows: Row[]) => ReactNode; pageSize?: number; embedded?: boolean
  onCreate?: (row: Row) => void
}

const toInput = (v: any, t?: string) => (t === 'date' ? String(v ?? '').slice(0, 10) : t === 'datetime-local' ? String(v ?? '').slice(0, 16) : v ?? '')

export function RecordForm({ fields, initial, onSubmit, onCancel, submitLabel = 'Save' }: { fields: Field[]; initial: Row; onSubmit: (v: Row) => void | Promise<void>; onCancel: () => void; submitLabel?: string }) {
  const [v, setV] = useState<Row>(initial)
  const set = (k: string, x: any) => setV(p => ({ ...p, [k]: x }))
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const miss = fields.find(f => f.required && (v[f.key] === '' || v[f.key] == null))
    if (miss) return void toast.error(`${miss.label} is required`)
    await onSubmit(v)
  }
  return <form onSubmit={submit} className="grid grid-cols-2 gap-3">
    {fields.map(f => <div key={f.key} className={f.full || f.type === 'textarea' ? 'col-span-2' : 'col-span-2 sm:col-span-1'}>
      {f.type === 'switch' ? <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2"><span className="text-sm">{f.label}</span><Switch checked={!!v[f.key]} onChange={x => set(f.key, x)} /></div> : <>
        <Label>{f.label}{f.required && ' *'}</Label>
        {f.type === 'select' ? <Select value={v[f.key] ?? ''} options={f.options ?? []} onChange={e => set(f.key, e.target.value)} />
          : f.type === 'textarea' ? <Textarea value={v[f.key] ?? ''} placeholder={f.placeholder} onChange={e => set(f.key, e.target.value)} />
          : <Input type={f.type ?? 'text'} placeholder={f.placeholder} value={toInput(v[f.key], f.type)} onChange={e => set(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)} />}</>}
    </div>)}
    <div className="col-span-2 mt-2 flex justify-end gap-2"><Btn type="button" variant="outline" onClick={onCancel}>Cancel</Btn><Btn type="submit">{submitLabel}</Btn></div>
  </form>
}

export function Crud({ cfg }: { cfg: CrudConfig }) {
  const { rows, ready } = useCollection(cfg.collection)
  const [q, setQ] = useState(''); const [flt, setFlt] = useState('All'); const [page, setPage] = useState(0)
  const [sort, setSort] = useState<{ k: string; d: 1 | -1 } | null>(null)
  const [edit, setEdit] = useState<Row | null>(null); const [del, setDel] = useState<Row | null>(null)
  const size = cfg.pageSize ?? 8

  const opts = useMemo(() => (cfg.filter ? ['All', ...Array.from(new Set(rows.map(r => String(r[cfg.filter!.key]))))] : []), [rows, cfg.filter])
  const list = useMemo(() => {
    let l = rows.filter(r => (flt === 'All' || String(r[cfg.filter?.key ?? '']) === flt) && (!q || cfg.columns.some(c => String(r[c.key] ?? '').toLowerCase().includes(q.toLowerCase()))))
    if (sort) l = [...l].sort((a, b) => (a[sort.k] > b[sort.k] ? 1 : a[sort.k] < b[sort.k] ? -1 : 0) * sort.d)
    return l
  }, [rows, q, flt, sort, cfg.columns, cfg.filter])
  const pages = Math.max(1, Math.ceil(list.length / size)); const cur = Math.min(page, pages - 1)
  const view = list.slice(cur * size, cur * size + size)
  const ctx: ActionCtx = { update: (id, p) => db.update(cfg.collection, id, p), remove: id => db.remove(cfg.collection, id), rows }

  const save = async (v: Row) => {
    if (edit && rows.some(r => r.id === edit.id)) { await db.update(cfg.collection, edit.id, v); toast.success(`${cfg.singular} updated`) }
    else { const r = await db.create(cfg.collection, v); cfg.onCreate?.(r); toast.success(`${cfg.singular} added`) }
    setEdit(null)
  }
  const head = <>{cfg.stats && <div className="mb-4"><Stats>{cfg.stats(rows).map(s => <Stat key={s.label} {...s} />)}</Stats></div>}</>
  return <div>
    {!cfg.embedded && <PageHead title={cfg.title} description={cfg.description} actions={<>
      <Btn variant="outline" onClick={() => downloadCSV(cfg.collection, list, cfg.columns.map(c => c.key))}><Download size={14} />Export</Btn>
      {!cfg.readOnly && !cfg.noAdd && <Btn onClick={() => setEdit({ id: '', ...cfg.defaults })}><Plus size={14} />Add {cfg.singular}</Btn>}</>} />}
    {cfg.embedded && !cfg.readOnly && <div className="mb-3 flex justify-end"><Btn onClick={() => setEdit({ id: '', ...cfg.defaults })}><Plus size={14} />Add {cfg.singular}</Btn></div>}
    {head}{cfg.extra?.(rows)}
    <Card>
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        <div className="relative min-w-48 flex-1"><Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" /><Input className="pl-8" placeholder={`Search ${cfg.title.toLowerCase()}…`} value={q} onChange={e => { setQ(e.target.value); setPage(0) }} /></div>
        {cfg.filter && <Select className="w-40" options={opts} value={flt} onChange={e => { setFlt(e.target.value); setPage(0) }} />}
      </div>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-xs text-muted-foreground">
        {cfg.columns.map(c => <th key={c.key} className="cursor-pointer select-none whitespace-nowrap px-4 py-2.5 font-medium" onClick={() => setSort(s => (s?.k === c.key ? { k: c.key, d: (s.d * -1) as 1 | -1 } : { k: c.key, d: 1 }))}>
          <span className="inline-flex items-center gap-1">{c.label}{sort?.k === c.key && (sort.d === 1 ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}</span></th>)}
        <th className="px-4 py-2.5 text-right font-medium">Actions</th></tr></thead>
        <tbody>{!ready ? <tr><td colSpan={99} className="p-8 text-center text-muted-foreground">Loading…</td></tr> : view.length === 0 ? <tr><td colSpan={99} className="p-8 text-center text-muted-foreground">No {cfg.title.toLowerCase()} found.</td></tr> :
          view.map(r => { const extra = (cfg.actions ?? []).filter(a => !a.show || a.show(r)); return <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-card-2/60">
            {cfg.columns.map(c => <td key={c.key} className="whitespace-nowrap px-4 py-2.5">{c.render ? c.render(r) : c.badge ? <Badge>{r[c.key]}</Badge> : c.money ? inr(r[c.key]) : c.datetime ? fdt(r[c.key]) : c.date ? fdate(r[c.key]) : String(r[c.key] ?? '—')}</td>)}
            <td className="px-4 py-2.5"><div className="flex items-center justify-end gap-1">
              {!cfg.readOnly && <button title="Edit" onClick={() => setEdit(r)} className="cursor-pointer rounded-md p-1.5 text-muted-foreground hover:bg-card-2 hover:text-foreground"><Pencil size={14} /></button>}
              {!cfg.readOnly && <button title="Delete" onClick={() => setDel(r)} className="cursor-pointer rounded-md p-1.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"><Trash2 size={14} /></button>}
              {extra.length > 0 && <Menu items={extra.map(a => ({ label: a.label, danger: a.danger, onClick: () => void a.run(r, ctx) }))} />}</div></td></tr> })}</tbody></table></div>
      <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground"><span>{list.length} record{list.length !== 1 && 's'}</span>
        <div className="flex items-center gap-2"><Btn size="sm" variant="outline" disabled={cur === 0} onClick={() => setPage(cur - 1)}>Prev</Btn><span>{cur + 1} / {pages}</span><Btn size="sm" variant="outline" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>Next</Btn></div></div>
    </Card>
    <Modal open={!!edit} onClose={() => setEdit(null)} title={edit && rows.some(r => r.id === edit.id) ? `Edit ${cfg.singular}` : `Add ${cfg.singular}`}>
      {edit && <RecordForm fields={cfg.fields} initial={edit.id ? edit : (({ id, ...rest }) => rest as Row)(edit) as Row} onSubmit={v => save((edit.id ? v : { ...v, id: undefined }) as Row)} onCancel={() => setEdit(null)} />}</Modal>
    <Modal open={!!del} onClose={() => setDel(null)} title={`Delete ${cfg.singular}?`}>
      <p className="text-sm text-muted-foreground">This will permanently remove this record from the demo data.</p>
      <div className="mt-4 flex justify-end gap-2"><Btn variant="outline" onClick={() => setDel(null)}>Cancel</Btn>
        <Btn variant="danger" onClick={async () => { await db.remove(cfg.collection, del!.id); toast.success(`${cfg.singular} deleted`); setDel(null) }}>Delete</Btn></div></Modal>
  </div>
}
