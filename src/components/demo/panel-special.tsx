'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChevronLeft, ChevronRight, Copy, Eye, EyeOff, FileText, Film, Image as ImageIcon, Music, Plus, Send, Sparkles, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { db, useCollection, useDoc, uid, type Row } from '@/lib/demo/store'
import { THEME_IDS } from '@/lib/themes'
import { useTheme } from '@/hooks/use-theme'
import { cn } from '@/lib/utils'
import { CheckoutModal } from './checkout'
import { Crud, RecordForm } from './crud'
import { apiKeysCfg, teamCfg, dealFields } from './panel-crud'
import { Badge, Btn, Card, CardHead, Input, Label, Modal, PageHead, Select, Stat, Stats, Switch, Tabs, Textarea, copy, downloadCSV, fdate, fdt, inr } from './ui'

export const CH = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']
export const ChartBox = ({ h = 240, children }: { h?: number; children: React.ReactElement }) => <div style={{ height: h }}><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div>
export const tip = { contentStyle: { background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 } }
const count = (rows: Row[], k: string) => Object.entries(rows.reduce<Record<string, number>>((a, r) => ({ ...a, [r[k]]: (a[r[k]] ?? 0) + 1 }), {})).map(([name, value]) => ({ name, value }))

export function UserDashboard() {
  const leads = useCollection('leads').rows, cust = useCollection('customers').rows, inv = useCollection('invoices').rows, conv = useCollection('conversations').rows
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({ d, sent: 120 + ((i * 53) % 90), received: 80 + ((i * 37) % 70) }))
  return <div className="space-y-4"><PageHead title="Dashboard" description="Your business at a glance" actions={<Link href="/panel/sales/leads"><Btn><Plus size={14} />New lead</Btn></Link>} />
    <Stats><Stat label="Total leads" value={leads.length} hint={`${leads.filter(l => l.status === 'New').length} new`} /><Stat label="Open conversations" value={conv.filter(c => c.status === 'Open').length} hint={`${conv.reduce((a, c) => a + c.unread, 0)} unread messages`} />
      <Stat label="Customers" value={cust.length} /><Stat label="Revenue collected" value={inr(inv.reduce((a, i) => a + i.paid, 0))} hint={`${inr(inv.reduce((a, i) => a + i.total - i.paid, 0))} outstanding`} /></Stats>
    <div className="grid gap-4 lg:grid-cols-3"><Card className="lg:col-span-2"><CardHead title="Messages this week" /><div className="p-4"><ChartBox><AreaChart data={days}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={12} /><YAxis stroke="var(--muted-foreground)" fontSize={12} /><Tooltip {...tip} />
      <Area dataKey="sent" stroke={CH[0]} fill={CH[0]} fillOpacity={0.2} /><Area dataKey="received" stroke={CH[1]} fill={CH[1]} fillOpacity={0.2} /></AreaChart></ChartBox></div></Card>
      <Card><CardHead title="Leads by status" /><div className="p-4"><ChartBox><PieChart><Pie data={count(leads, 'status')} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85}>{count(leads, 'status').map((_, i) => <Cell key={i} fill={CH[i % 5]} />)}</Pie><Tooltip {...tip} /></PieChart></ChartBox></div></Card></div>
    <div className="grid gap-4 lg:grid-cols-2"><Card><CardHead title="Recent conversations" action={<Link href="/panel/conversation/inbox" className="text-xs text-primary">Open inbox</Link>} />
      {conv.slice(0, 5).map(c => <div key={c.id} className="flex items-center justify-between border-b border-border/60 px-4 py-2.5 last:border-0"><div><p className="text-sm font-medium">{c.name}</p><p className="max-w-64 truncate text-xs text-muted-foreground">{c.messages.at(-1)?.text}</p></div><Badge>{c.status}</Badge></div>)}</Card>
      <Card><CardHead title="Quick actions" /><div className="grid grid-cols-2 gap-2 p-4">{[['Add lead', '/panel/sales/leads'], ['Send broadcast', '/panel/whatsapp/broadcast-logs'], ['Create invoice', '/panel/billing/invoices'], ['Schedule meeting', '/panel/conversation/meetings'], ['Ask AI assistant', '/panel/automation/ai-assistant'], ['View reports', '/panel/billing/reports']].map(([l, h]) => <Link key={h} href={h} className="rounded-lg border border-border px-3 py-3 text-sm hover:bg-card-2">{l}</Link>)}</div></Card></div></div>
}

const STAGES = ['New Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won']
export function Pipeline() {
  const { rows } = useCollection('deals'); const [edit, setEdit] = useState<Row | null>(null); const [over, setOver] = useState('')
  const move = (r: Row, d: number) => { const s = STAGES[STAGES.indexOf(r.stage) + d]; if (s) { db.update('deals', r.id, { stage: s }); toast.success(`Moved to ${s}`) } }
  const open = rows.filter(r => r.stage !== 'Won').reduce((a, r) => a + r.value, 0)
  return <div><PageHead title="Pipeline" description="Drag deals between stages or use the arrows" actions={<Btn onClick={() => setEdit({ id: '', stage: 'New Lead', owner: 'Riya', value: 10000 })}><Plus size={14} />Add deal</Btn>} />
    <div className="mb-4"><Stats><Stat label="Open pipeline" value={inr(open)} /><Stat label="Won" value={inr(rows.filter(r => r.stage === 'Won').reduce((a, r) => a + r.value, 0))} /><Stat label="Deals" value={rows.length} /><Stat label="Win rate" value={`${Math.round((rows.filter(r => r.stage === 'Won').length / (rows.length || 1)) * 100)}%`} /></Stats></div>
    <div className="grid gap-3 overflow-x-auto pb-2 md:grid-cols-5">{STAGES.map(s => { const items = rows.filter(r => r.stage === s)
      return <div key={s} onDragOver={e => { e.preventDefault(); setOver(s) }} onDragLeave={() => setOver('')} onDrop={e => { setOver(''); const r = rows.find(x => x.id === e.dataTransfer.getData('id')); if (r && r.stage !== s) { db.update('deals', r.id, { stage: s }); toast.success(`Moved to ${s}`) } }}
        className={cn('min-w-56 rounded-xl border border-border bg-card-2/50 p-2', over === s && 'ring-2 ring-primary')}>
        <div className="mb-2 flex items-center justify-between px-1"><span className="text-sm font-semibold">{s}</span><span className="text-xs text-muted-foreground">{items.length} · {inr(items.reduce((a, r) => a + r.value, 0))}</span></div>
        <div className="space-y-2">{items.map(r => <div key={r.id} draggable onDragStart={e => e.dataTransfer.setData('id', r.id)} className="cursor-grab rounded-lg border border-border bg-card p-3 active:cursor-grabbing">
          <button className="cursor-pointer text-left text-sm font-medium hover:text-primary" onClick={() => setEdit(r)}>{r.title}</button><p className="mt-1 text-xs text-muted-foreground">{r.contact} · {r.owner}</p>
          <div className="mt-2 flex items-center justify-between"><span className="text-sm font-semibold">{inr(r.value)}</span><div className="flex"><button disabled={s === STAGES[0]} onClick={() => move(r, -1)} className="cursor-pointer rounded p-1 hover:bg-card-2 disabled:opacity-30"><ChevronLeft size={14} /></button><button disabled={s === 'Won'} onClick={() => move(r, 1)} className="cursor-pointer rounded p-1 hover:bg-card-2 disabled:opacity-30"><ChevronRight size={14} /></button>
            <button onClick={() => db.remove('deals', r.id)} className="cursor-pointer rounded p-1 text-muted-foreground hover:text-destructive"><Trash2 size={13} /></button></div></div></div>)}</div></div> })}</div>
    <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit deal' : 'Add deal'}>{edit && <RecordForm fields={dealFields} initial={edit} onCancel={() => setEdit(null)} onSubmit={async v => { if (edit.id) await db.update('deals', edit.id, v); else await db.create('deals', { ...v, id: undefined }); toast.success('Deal saved'); setEdit(null) }} />}</Modal></div>
}

export function Inbox() {
  const { rows } = useCollection('conversations'); const tpl = useCollection('templates').rows.filter(t => t.status === 'Approved')
  const [sel, setSel] = useState(''); const [f, setF] = useState('All'); const [q, setQ] = useState(''); const [txt, setTxt] = useState(''); const end = useRef<HTMLDivElement>(null)
  const list = rows.filter(c => (f === 'All' || (f === 'Unread' ? c.unread > 0 : c.status === f)) && (c.name + c.phone).toLowerCase().includes(q.toLowerCase()))
  const cur = rows.find(c => c.id === (sel || list[0]?.id))
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [cur?.messages.length, cur?.id])
  useEffect(() => { if (cur?.unread) db.update('conversations', cur.id, { unread: 0 }) }, [cur?.id, cur?.unread])
  const send = async (text = txt) => {
    if (!text.trim() || !cur) return; const id = cur.id
    await db.update('conversations', id, { messages: [...cur.messages, { id: uid('m'), from: 'me', text, at: new Date().toISOString() }], status: cur.status === 'Resolved' ? 'Open' : cur.status }); setTxt('')
    setTimeout(async () => { const c = (await db.all('conversations')).find(x => x.id === id); if (c) db.update('conversations', id, { messages: [...c.messages, { id: uid('m'), from: 'them', text: 'Thanks! 👍 Got it.', at: new Date().toISOString() }] }) }, 1500)
  }
  return <div><PageHead title="Inbox" description="Shared WhatsApp inbox for your team" />
    <Card className="grid h-[calc(100vh-11rem)] min-h-[480px] overflow-hidden md:grid-cols-[300px_1fr] xl:grid-cols-[300px_1fr_260px]">
      <div className="flex flex-col border-r border-border"><div className="space-y-2 p-3"><Input placeholder="Search chats…" value={q} onChange={e => setQ(e.target.value)} /><div className="flex flex-wrap gap-1">{['All', 'Unread', 'Open', 'Pending', 'Resolved'].map(x => <button key={x} onClick={() => setF(x)} className={cn('cursor-pointer rounded-full px-2.5 py-1 text-xs', f === x ? 'bg-primary text-primary-foreground' : 'bg-card-2')}>{x}</button>)}</div></div>
        <div className="flex-1 overflow-y-auto">{list.map(c => <button key={c.id} onClick={() => setSel(c.id)} className={cn('flex w-full cursor-pointer items-center gap-3 border-b border-border/60 px-3 py-3 text-left hover:bg-card-2', cur?.id === c.id && 'bg-primary-soft')}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary">{c.name[0]}</span><div className="min-w-0 flex-1"><div className="flex justify-between"><p className="truncate text-sm font-medium">{c.name}</p><span className="text-[10px] text-muted-foreground">{fdt(c.messages.at(-1)?.at).split(',').pop()}</span></div>
            <p className="truncate text-xs text-muted-foreground">{c.messages.at(-1)?.text}</p></div>{c.unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">{c.unread}</span>}</button>)}{!list.length && <p className="p-6 text-center text-sm text-muted-foreground">No chats</p>}</div></div>
      {cur ? <><div className="flex min-w-0 flex-col"><div className="flex items-center justify-between border-b border-border px-4 py-3"><div><p className="font-medium">{cur.name}</p><p className="text-xs text-muted-foreground">{cur.phone}</p></div>
        <div className="flex gap-2"><Btn size="sm" variant="outline" onClick={() => db.update('conversations', cur.id, { status: cur.status === 'Resolved' ? 'Open' : 'Resolved' })}>{cur.status === 'Resolved' ? 'Reopen' : 'Resolve'}</Btn></div></div>
        <div className="flex-1 space-y-2 overflow-y-auto bg-card-2/40 p-4">{cur.messages.map((m: Row) => <div key={m.id} className={cn('flex', m.from === 'me' && 'justify-end')}><div className={cn('max-w-[75%] rounded-2xl px-3 py-2 text-sm', m.from === 'me' ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm bg-card')}>{m.text}<p className="mt-1 text-right text-[10px] opacity-60">{fdt(m.at).split(',').pop()}</p></div></div>)}<div ref={end} /></div>
        <div className="space-y-2 border-t border-border p-3"><div className="flex gap-2"><Select className="w-44" value="" options={['Insert template…', ...tpl.map(t => t.name)]} onChange={e => { const t = tpl.find(x => x.name === e.target.value); if (t) setTxt(t.body) }} />
          {['Thanks for reaching out!', 'Can I call you now?'].map(r => <Btn key={r} size="sm" variant="outline" onClick={() => setTxt(r)}>{r.split(' ').slice(0, 2).join(' ')}…</Btn>)}</div>
          <div className="flex gap-2"><Input placeholder="Type a message" value={txt} onChange={e => setTxt(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} /><Btn onClick={() => send()}><Send size={14} />Send</Btn></div></div></div>
        <div className="hidden space-y-4 border-l border-border p-4 xl:block"><p className="text-sm font-semibold">Contact</p><div><Label>Status</Label><Select value={cur.status} options={['Open', 'Pending', 'Resolved']} onChange={e => db.update('conversations', cur.id, { status: e.target.value })} /></div>
          <div><Label>Assignee</Label><Select value={cur.assignee} options={['Riya', 'Kabir', 'Meera', 'Dev']} onChange={e => { db.update('conversations', cur.id, { assignee: e.target.value }); toast.success('Reassigned') }} /></div>
          <div><Label>Tags</Label><div className="flex flex-wrap gap-1">{cur.tags.map((t: string) => <Badge key={t}>{t}</Badge>)}<button onClick={() => { const t = prompt('New tag'); if (t) db.update('conversations', cur.id, { tags: [...cur.tags, t] }) }} className="cursor-pointer rounded-full border border-dashed border-border px-2 text-xs">+ add</button></div></div></div></>
        : <div className="col-span-2 grid place-items-center text-muted-foreground">Select a conversation</div>}</Card></div>
}

const MI: Record<string, React.ElementType> = { image: ImageIcon, video: Film, audio: Music, document: FileText }
export function MediaLibrary() {
  const { rows } = useCollection('media'); const [f, setF] = useState('all'); const [q, setQ] = useState(''); const fi = useRef<HTMLInputElement>(null)
  const list = rows.filter(r => (f === 'all' || r.type === f) && r.name.toLowerCase().includes(q.toLowerCase()))
  const upload = async (files: FileList | null) => { for (const file of Array.from(files ?? [])) await db.create('media', { name: file.name, type: file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'document', size: `${(file.size / 1048576).toFixed(1)} MB`, createdAt: new Date().toISOString() }); toast.success('Uploaded (demo — metadata only)') }
  return <div><PageHead title="Media Library" description="Images, videos and documents for WhatsApp messages" actions={<><input ref={fi} type="file" multiple hidden onChange={e => upload(e.target.files)} /><Btn onClick={() => fi.current?.click()}><Upload size={14} />Upload</Btn></>} />
    <div className="mb-4 flex flex-wrap gap-2"><Input className="max-w-xs" placeholder="Search media…" value={q} onChange={e => setQ(e.target.value)} />{['all', 'image', 'video', 'document', 'audio'].map(x => <button key={x} onClick={() => setF(x)} className={cn('cursor-pointer rounded-full px-3 text-xs capitalize', f === x ? 'bg-primary text-primary-foreground' : 'bg-card-2')}>{x}</button>)}</div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">{list.map(m => { const I = MI[m.type] ?? FileText; return <Card key={m.id} className="overflow-hidden"><div className="grid h-28 place-items-center bg-primary-soft text-primary"><I size={32} /></div><div className="p-3"><p className="truncate text-sm font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.size} · {fdate(m.createdAt)}</p>
      <div className="mt-2 flex gap-1"><Btn size="sm" variant="outline" onClick={() => copy(`https://cdn.example.com/media/${m.name}`, 'Link copied')}><Copy size={12} /></Btn><Btn size="sm" variant="danger" onClick={() => db.remove('media', m.id)}><Trash2 size={12} /></Btn></div></div></Card> })}</div>
    {!list.length && <p className="p-10 text-center text-muted-foreground">No media found.</p>}</div>
}

export function WhatsAppApi() {
  const [d, patch] = useDoc('waapi'); const [show, setShow] = useState(false); const [to, setTo] = useState('+91 '); const [tpl, setTpl] = useState('welcome_message')
  const tpls = useCollection('templates').rows.filter(t => t.status === 'Approved').map(t => t.name)
  const webhook = typeof window !== 'undefined' ? `${location.origin}/api/whatsapp/webhook` : '/api/whatsapp/webhook'
  const test = async () => { await patch({ log: [{ id: uid('l'), to, tpl, at: new Date().toISOString(), status: 'Delivered' }, ...(d.log ?? [])].slice(0, 8) }); toast.success(`Test message sent to ${to} (demo)`) }
  return <div className="space-y-4"><PageHead title="WhatsApp API" description="Cloud API connection, webhook and test console" actions={<Btn variant={d.connected ? 'danger' : 'primary'} onClick={() => { patch({ connected: !d.connected }); toast(d.connected ? 'Disconnected' : 'Connected') }}>{d.connected ? 'Disconnect' : 'Connect number'}</Btn>} />
    <Stats><Stat label="Status" value={<Badge>{d.connected ? 'Connected' : 'Inactive'}</Badge>} /><Stat label="Number" value={<span className="text-lg">{d.phoneNumber}</span>} /><Stat label="Quality" value={<Badge>{d.quality ?? 'Green'}</Badge>} /><Stat label="Messaging tier" value={<span className="text-lg">{d.tier}</span>} /></Stats>
    <div className="grid gap-4 lg:grid-cols-2"><Card><CardHead title="Credentials" /><div className="space-y-3 p-4">{([['Phone number ID', 'phoneNumberId'], ['WhatsApp Business Account ID', 'wabaId']] as const).map(([l, k]) => <div key={k}><Label>{l}</Label><Input value={d[k] ?? ''} onChange={e => patch({ [k]: e.target.value })} /></div>)}
      <div><Label>Permanent access token</Label><div className="flex gap-2"><Input type={show ? 'text' : 'password'} value={d.token ?? ''} onChange={e => patch({ token: e.target.value })} /><Btn variant="outline" onClick={() => setShow(!show)}>{show ? <EyeOff size={14} /> : <Eye size={14} />}</Btn></div></div>
      <Btn onClick={() => toast.success('Credentials saved')}>Save credentials</Btn></div></Card>
      <Card><CardHead title="Webhook" /><div className="space-y-3 p-4"><div><Label>Callback URL</Label><div className="flex gap-2"><Input readOnly value={webhook} /><Btn variant="outline" onClick={() => copy(webhook)}><Copy size={14} /></Btn></div></div>
        <div><Label>Verify token</Label><div className="flex gap-2"><Input value={d.verifyToken ?? ''} onChange={e => patch({ verifyToken: e.target.value })} /><Btn variant="outline" onClick={() => patch({ verifyToken: 'wc_verify_' + Math.random().toString(16).slice(2, 8) })}>Regenerate</Btn></div></div>
        <p className="text-xs text-muted-foreground">Paste these into Meta → WhatsApp → Configuration. Subscribe to <code>messages</code>.</p></div></Card></div>
    <Card><CardHead title="Test console" /><div className="grid gap-3 p-4 md:grid-cols-[1fr_1fr_auto]"><div><Label>Recipient</Label><Input value={to} onChange={e => setTo(e.target.value)} /></div><div><Label>Template</Label><Select value={tpl} options={tpls.length ? tpls : ['welcome_message']} onChange={e => setTpl(e.target.value)} /></div><div className="flex items-end"><Btn onClick={test} disabled={!d.connected}>Send test</Btn></div></div>
      {(d.log ?? []).map((l: Row) => <div key={l.id} className="flex justify-between border-t border-border px-4 py-2 text-sm"><span>{l.tpl} → {l.to}</span><span className="text-muted-foreground">{fdt(l.at)} · <Badge>{l.status}</Badge></span></div>)}</Card></div>
}

const EP = [
  ['GET', '/api/v1/me', 'Current API key owner and workspace'], ['GET', '/api/v1/contacts', 'List contacts (supports ?q= and pagination)'], ['POST', '/api/v1/contacts', 'Create a contact'], ['GET', '/api/v1/contacts/{id}', 'Fetch one contact'], ['PATCH', '/api/v1/contacts/{id}', 'Update a contact'],
  ['GET', '/api/v1/conversations', 'List conversations'], ['GET', '/api/v1/conversations/{id}/messages', 'Message history of a conversation'], ['POST', '/api/v1/messages', 'Send a WhatsApp message (text or template)'], ['GET', '/api/v1/webhooks', 'List outbound webhooks'], ['POST', '/api/v1/webhooks', 'Register an outbound webhook'],
]
export function ApiDocs() {
  const [o, setO] = useState(0); const base = typeof window !== 'undefined' ? location.origin : 'https://your-domain.com'
  const curl = (m: string, p: string) => `curl -X ${m} "${base}${p}" \\\n  -H "Authorization: Bearer wc_live_YOUR_KEY" \\\n  -H "Content-Type: application/json"${m === 'POST' ? ` \\\n  -d '{"to":"+919800012345","type":"text","text":"Hello from the API"}'` : ''}`
  return <div><PageHead title="API Docs" description="REST API reference — authenticate with an API key from Settings → API Keys" actions={<Link href="/panel/settings"><Btn variant="outline">Manage API keys</Btn></Link>} />
    <Card>{EP.map(([m, p, desc], i) => <div key={p + m} className="border-b border-border last:border-0"><button onClick={() => setO(o === i ? -1 : i)} className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left hover:bg-card-2/60">
      <span className={cn('w-14 rounded px-2 py-0.5 text-center text-[11px] font-bold', m === 'GET' ? 'bg-emerald-500/15 text-emerald-500' : m === 'POST' ? 'bg-sky-500/15 text-sky-500' : 'bg-amber-500/15 text-amber-500')}>{m}</span><code className="text-sm">{p}</code><span className="ml-auto hidden text-sm text-muted-foreground md:block">{desc}</span></button>
      {o === i && <div className="space-y-2 px-4 pb-4"><p className="text-sm text-muted-foreground md:hidden">{desc}</p><pre className="overflow-x-auto rounded-lg bg-card-2 p-3 text-xs">{curl(m, p)}</pre><Btn size="sm" variant="outline" onClick={() => copy(curl(m, p))}><Copy size={12} />Copy cURL</Btn></div>}</div>)}</Card></div>
}

const reply = (q: string, faqs: Row[], prods: Row[], cfg: Row): { text: string; src: string[] } => {
  const w = q.toLowerCase().split(/\W+/).filter(x => x.length > 2)
  if (/^(hi|hello|hey)\b/i.test(q)) return { text: cfg.greeting, src: [] }
  if (cfg.useFaqs) { const best = faqs.map(f => ({ f, s: w.filter(x => (f.question + f.answer).toLowerCase().includes(x)).length })).sort((a, b) => b.s - a.s)[0]; if (best?.s >= 1) return { text: best.f.answer, src: [`FAQ: ${best.f.question}`] } }
  if (cfg.useProducts) { const p = prods.find(x => w.some(t => x.name.toLowerCase().includes(t))); if (p) return { text: `${p.name} is ${inr(p.price)} (+${p.tax}% GST). Want me to send a quotation?`, src: [`Product: ${p.name}`] } }
  return { text: cfg.handoff ? "I'm not fully sure about that — let me connect you with a human teammate." : "Sorry, I don't have that information yet.", src: [] }
}
export function AiAssistant() {
  const [cfg, patch] = useDoc('aiconfig'); const faqs = useCollection('faqs').rows; const prods = useCollection('products').rows
  const [msgs, setMsgs] = useState<{ me: boolean; text: string; src?: string[] }[]>([]); const [t, setT] = useState(''); const [busy, setBusy] = useState(false)
  const ask = (text: string) => { if (!text.trim() || busy) return; setMsgs(m => [...m, { me: true, text }]); setT(''); setBusy(true); setTimeout(() => { const r = reply(text, faqs, prods, cfg); setMsgs(m => [...m, { me: false, ...r }]); setBusy(false) }, 700) }
  return <div><PageHead title="AI Assistant" description="Configure and test your WhatsApp AI agent (demo uses local FAQ/product matching)" />
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]"><Card><CardHead title="Configuration" /><div className="space-y-3 p-4"><div><Label>Assistant name</Label><Input value={cfg.name ?? ''} onChange={e => patch({ name: e.target.value })} /></div><div><Label>Tone</Label><Select value={cfg.tone} options={['Friendly', 'Professional', 'Concise', 'Playful']} onChange={e => patch({ tone: e.target.value })} /></div>
      <div><Label>Model</Label><Select value={cfg.model} options={['Claude Sonnet', 'Claude Haiku', 'GPT-4o mini']} onChange={e => patch({ model: e.target.value })} /></div><div><Label>Greeting</Label><Textarea value={cfg.greeting ?? ''} onChange={e => patch({ greeting: e.target.value })} /></div>
      {([['autoReply', 'Auto-reply to new chats'], ['useFaqs', 'Use FAQ knowledge'], ['useProducts', 'Use products & prices'], ['handoff', 'Hand off to human when unsure']] as const).map(([k, l]) => <div key={k} className="flex items-center justify-between text-sm"><span>{l}</span><Switch checked={!!cfg[k]} onChange={v => patch({ [k]: v })} /></div>)}</div></Card>
      <Card className="flex h-[560px] flex-col"><CardHead title={`Test chat · ${cfg.name ?? 'Assistant'}`} action={<Btn size="sm" variant="ghost" onClick={() => setMsgs([])}>Clear</Btn>} />
        <div className="flex-1 space-y-3 overflow-y-auto p-4">{!msgs.length && <div className="grid h-full place-items-center text-center text-sm text-muted-foreground"><div><Sparkles className="mx-auto mb-2 text-primary" />Try one of the prompts below</div></div>}
          {msgs.map((m, i) => <div key={i} className={cn('flex', m.me && 'justify-end')}><div className={cn('max-w-[80%] rounded-2xl px-3 py-2 text-sm', m.me ? 'bg-primary text-primary-foreground' : 'bg-card-2')}>{m.text}{m.src?.map(s => <p key={s} className="mt-1 text-[10px] opacity-60">Source — {s}</p>)}</div></div>)}{busy && <p className="text-xs text-muted-foreground">{cfg.name} is typing…</p>}</div>
        <div className="space-y-2 border-t border-border p-3"><div className="flex flex-wrap gap-1.5">{['Hi', 'Do you offer a free trial?', 'Price of Growth Plan?', 'Can I cancel anytime?'].map(p => <button key={p} onClick={() => ask(p)} className="cursor-pointer rounded-full border border-border px-3 py-1 text-xs hover:bg-card-2">{p}</button>)}</div>
          <div className="flex gap-2"><Input value={t} placeholder="Ask something…" onChange={e => setT(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask(t)} /><Btn onClick={() => ask(t)}><Send size={14} /></Btn></div></div></Card></div></div>
}

export function BillingReports() {
  const { rows } = useCollection('invoices'); const [range, setRange] = useState('All time')
  const list = rows.filter(r => range === 'All time' || (Date.now() - +new Date(r.issued)) / 864e5 <= (range === 'Last 30 days' ? 30 : 90))
  const byM = useMemo(() => Object.entries(list.reduce<Record<string, { billed: number; collected: number }>>((a, r) => { const k = r.issued.slice(0, 7); a[k] = { billed: (a[k]?.billed ?? 0) + r.total, collected: (a[k]?.collected ?? 0) + r.paid }; return a }, {})).sort().map(([m, v]) => ({ m, ...v })), [list])
  const top = Object.entries(list.reduce<Record<string, number>>((a, r) => ({ ...a, [r.customer]: (a[r.customer] ?? 0) + r.total }), {})).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const billed = list.reduce((a, r) => a + r.total, 0), paid = list.reduce((a, r) => a + r.paid, 0)
  return <div className="space-y-4"><PageHead title="Billing Reports" description="Revenue, collections and receivables" actions={<><Select className="w-40" value={range} options={['All time', 'Last 30 days', 'Last 90 days']} onChange={e => setRange(e.target.value)} /><Btn variant="outline" onClick={() => downloadCSV('invoice-report', list, ['number', 'customer', 'issued', 'due', 'total', 'paid', 'status'])}>Export CSV</Btn></>} />
    <Stats><Stat label="Billed" value={inr(billed)} /><Stat label="Collected" value={inr(paid)} /><Stat label="Outstanding" value={inr(billed - paid)} /><Stat label="Overdue invoices" value={list.filter(r => r.status === 'Overdue').length} /></Stats>
    <div className="grid gap-4 lg:grid-cols-3"><Card className="lg:col-span-2"><CardHead title="Billed vs collected" /><div className="p-4"><ChartBox><BarChart data={byM}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} /><YAxis stroke="var(--muted-foreground)" fontSize={12} /><Tooltip {...tip} formatter={(v: any) => inr(Number(v))} /><Bar dataKey="billed" fill={CH[0]} radius={[4, 4, 0, 0]} /><Bar dataKey="collected" fill={CH[1]} radius={[4, 4, 0, 0]} /></BarChart></ChartBox></div></Card>
      <Card><CardHead title="Top customers" />{top.map(([n, v]) => <div key={n} className="flex justify-between border-b border-border/60 px-4 py-2.5 text-sm last:border-0"><span>{n}</span><span className="font-medium">{inr(v)}</span></div>)}</Card></div></div>
}

export function UserSettings() {
  const [s, patch] = useDoc('settings'); const { theme, setTheme, mode, toggleMode } = useTheme(); const plans = useCollection('plans').rows; const [co, setCo] = useState<Row | null>(null); const [cycle, setCycle] = useState<'Monthly' | 'Yearly'>('Monthly')
  const F = ({ l, k, type }: { l: string; k: string; type?: string }) => <div><Label>{l}</Label><Input type={type} value={s[k] ?? ''} onChange={e => patch({ [k]: e.target.value })} /></div>
  const tabs = [
    { id: 'profile', label: 'Profile', node: <Card className="grid gap-3 p-4 md:grid-cols-2"><F l="Full name" k="name" /><F l="Email" k="email" /><F l="Phone" k="phone" /><div><Label>Timezone</Label><Select value={s.timezone} options={['Asia/Kolkata', 'Asia/Dubai', 'Europe/London', 'America/New_York']} onChange={e => patch({ timezone: e.target.value })} /></div><div className="md:col-span-2"><Btn onClick={() => toast.success('Profile saved')}>Save changes</Btn></div></Card> },
    { id: 'business', label: 'Business', node: <Card className="grid gap-3 p-4 md:grid-cols-2"><F l="Business name" k="business" /><F l="GSTIN" k="gst" /><F l="Address" k="address" /><div><Label>Currency</Label><Select value={s.currency} options={['INR', 'USD', 'EUR', 'AED']} onChange={e => patch({ currency: e.target.value })} /></div><div className="md:col-span-2"><Btn onClick={() => toast.success('Business details saved')}>Save changes</Btn></div></Card> },
    { id: 'team', label: 'Team', node: <Crud cfg={{ ...teamCfg, embedded: true }} /> },
    { id: 'api', label: 'API Keys', node: <Crud cfg={{ ...apiKeysCfg, embedded: true }} /> },
    { id: 'notif', label: 'Notifications', node: <Card className="divide-y divide-border">{([['notifyNew', 'New lead or conversation'], ['notifyAssign', 'Chat assigned to me'], ['notifyPayment', 'Payment received'], ['notifyDigest', 'Daily email digest']] as const).map(([k, l]) => <div key={k} className="flex items-center justify-between p-4 text-sm">{l}<Switch checked={!!s[k]} onChange={v => patch({ [k]: v })} /></div>)}</Card> },
    { id: 'plan', label: 'Billing & Plan', node: <div className="space-y-4"><Card className="flex items-center justify-between p-4"><div><p className="text-xs text-muted-foreground">Current plan</p><p className="text-lg font-semibold">{s.plan} · {s.cycle}</p></div><Select className="w-32" value={cycle} options={['Monthly', 'Yearly']} onChange={e => setCycle(e.target.value as any)} /></Card>
      <div className="grid gap-3 md:grid-cols-3">{plans.filter(p => p.status === 'Active').map(p => <Card key={p.id} className={cn('p-4', p.name === s.plan && 'ring-2 ring-primary')}><p className="font-semibold">{p.name}</p><p className="my-1 text-2xl font-semibold">{inr(cycle === 'Yearly' ? p.priceYearly : p.priceMonthly)}<span className="text-xs font-normal text-muted-foreground">/{cycle === 'Yearly' ? 'yr' : 'mo'}</span></p><p className="mb-3 text-xs text-muted-foreground">{p.features.split(',').slice(0, 3).join(' · ')}</p><Btn className="w-full" variant={p.name === s.plan ? 'outline' : 'primary'} disabled={p.name === s.plan} onClick={() => setCo(p)}>{p.name === s.plan ? 'Current plan' : 'Upgrade'}</Btn></Card>)}</div>
      <CheckoutModal open={!!co} onClose={() => setCo(null)} plan={co} cycle={cycle} customer={{ name: s.name ?? 'Demo', email: s.email ?? '' }} onPaid={() => patch({ plan: co!.name, cycle })} /></div> },
    { id: 'look', label: 'Appearance', node: <Card className="space-y-4 p-4"><div className="flex items-center justify-between text-sm">Dark mode<Switch checked={mode === 'dark'} onChange={toggleMode} /></div><div><Label>Accent colour</Label><div className="flex flex-wrap gap-2">{THEME_IDS.map(t => <button key={t} onClick={() => setTheme(t)} className={cn('cursor-pointer rounded-full border px-3 py-1 text-xs capitalize', theme === t ? 'border-primary bg-primary-soft text-primary' : 'border-border')}>{t}</button>)}</div></div></Card> },
  ]
  return <div><PageHead title="Settings" description="Account, business, team and billing" /><Tabs tabs={tabs} /></div>
}
