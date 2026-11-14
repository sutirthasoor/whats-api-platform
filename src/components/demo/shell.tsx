'use client'
import { useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, ChevronDown, LogOut, Menu as MenuIcon, Moon, RefreshCw, Search, Sun, Repeat } from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '@/hooks/use-theme'
import { db } from '@/lib/demo/store'
import { cn } from '@/lib/utils'
import { Input } from './ui'

export interface NavItem { label: string; icon: React.ElementType; href?: string; children?: { label: string; href: string }[] }
interface Props { brand: string; badge: string; base: string; nav: NavItem[]; user: { name: string; email: string }; switchTo: { label: string; href: string }; children: ReactNode }

export function Shell({ brand, badge, base, nav, user, switchTo, children }: Props) {
  const path = usePathname(); const router = useRouter(); const { mode, toggleMode } = useTheme()
  const [open, setOpen] = useState<Record<string, boolean>>({}); const [drawer, setDrawer] = useState(false)
  const [q, setQ] = useState(''); const [menu, setMenu] = useState(false); const [bell, setBell] = useState(false)
  const [notes, setNotes] = useState([{ t: 'New lead from WhatsApp', u: true }, { t: 'Payment received — ₹1,499', u: true }, { t: 'Template "promo_offer_v2" approved', u: false }])
  const flat = useMemo(() => nav.flatMap(n => (n.children ? n.children.map(c => ({ label: `${n.label} › ${c.label}`, href: c.href })) : [{ label: n.label, href: n.href! }])), [nav])
  const hits = q ? flat.filter(f => f.label.toLowerCase().includes(q.toLowerCase())).slice(0, 6) : []
  const active = (h: string) => path === h || (h !== base && path.startsWith(h + '/'))
  const isOpen = (n: NavItem) => open[n.label] ?? !!n.children?.some(c => active(c.href))

  const side = <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
    <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4"><span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">W</span>
      <div><p className="text-sm font-semibold leading-none">{brand}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{badge}</p></div></div>
    <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">{nav.map(n => { const Icon = n.icon
      if (!n.children) return <Link key={n.label} href={n.href!} onClick={() => setDrawer(false)} className={cn('flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm', active(n.href!) ? 'bg-primary-soft font-medium text-primary' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}><Icon size={16} />{n.label}</Link>
      return <div key={n.label}><button onClick={() => setOpen({ ...open, [n.label]: !isOpen(n) })} className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"><Icon size={16} />{n.label}<ChevronDown size={14} className={cn('ml-auto transition', isOpen(n) && 'rotate-180')} /></button>
        {isOpen(n) && <div className="ml-5 mt-0.5 space-y-0.5 border-l border-border pl-3">{n.children.map(c => <Link key={c.href} href={c.href} onClick={() => setDrawer(false)} className={cn('block rounded-md px-3 py-1.5 text-[13px]', active(c.href) ? 'bg-primary-soft font-medium text-primary' : 'text-muted-foreground hover:text-foreground')}>{c.label}</Link>)}</div>}</div> })}</nav>
  </aside>

  return <div className="flex h-screen overflow-hidden bg-background">
    <div className="hidden lg:block">{side}</div>
    {drawer && <div className="fixed inset-0 z-40 flex lg:hidden"><div className="h-full">{side}</div><div className="flex-1 bg-black/60" onClick={() => setDrawer(false)} /></div>}
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="relative z-30 flex h-14 items-center gap-3 border-b border-border bg-card px-4">
        <button className="cursor-pointer lg:hidden" onClick={() => setDrawer(true)} aria-label="Menu"><MenuIcon size={20} /></button>
        <div className="relative max-w-sm flex-1"><Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" /><Input className="pl-8" placeholder="Jump to a page…" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && hits[0]) { router.push(hits[0].href); setQ('') } }} />
          {hits.length > 0 && <div className="absolute mt-1 w-full rounded-lg border border-border bg-popover p-1 shadow-xl">{hits.map(h => <button key={h.href} onClick={() => { router.push(h.href); setQ('') }} className="block w-full cursor-pointer rounded-md px-3 py-1.5 text-left text-sm hover:bg-card-2">{h.label}</button>)}</div>}</div>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={toggleMode} className="cursor-pointer rounded-lg p-2 hover:bg-card-2" aria-label="Toggle theme">{mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button>
          <div className="relative"><button onClick={() => { setBell(!bell); setMenu(false) }} className="relative cursor-pointer rounded-lg p-2 hover:bg-card-2" aria-label="Notifications"><Bell size={16} />{notes.some(n => n.u) && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />}</button>
            {bell && <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-popover p-2 shadow-xl"><div className="flex items-center justify-between px-2 py-1"><span className="text-sm font-semibold">Notifications</span><button className="cursor-pointer text-xs text-primary" onClick={() => setNotes(notes.map(n => ({ ...n, u: false })))}>Mark all read</button></div>
              {notes.map((n, i) => <p key={i} className={cn('rounded-md px-2 py-2 text-sm', n.u && 'bg-primary-soft')}>{n.t}</p>)}</div>}</div>
          <div className="relative"><button onClick={() => { setMenu(!menu); setBell(false) }} className="flex cursor-pointer items-center gap-2 rounded-lg p-1.5 hover:bg-card-2"><span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{user.name[0]}</span><span className="hidden text-sm sm:block">{user.name}</span></button>
            {menu && <div className="absolute right-0 mt-2 w-60 rounded-xl border border-border bg-popover p-1.5 shadow-xl"><div className="px-3 py-2"><p className="text-sm font-medium">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></div>
              <Link href={switchTo.href} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-card-2"><Repeat size={14} />{switchTo.label}</Link>
              <button onClick={async () => { await db.reset(); toast.success('Demo data reset'); setMenu(false) }} className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-card-2"><RefreshCw size={14} />Reset demo data</button>
              <Link href="/demo" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-card-2"><LogOut size={14} />Sign out</Link></div>}</div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-6" onClick={() => { setMenu(false); setBell(false) }}>{children}</main>
    </div>
  </div>
}
