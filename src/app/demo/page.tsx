import Link from 'next/link'

export const metadata = { title: 'WhatsCRM demo' }
export default function DemoLanding() {
  const cards = [
    { t: 'Admin Panel', d: 'Users, billing & usage, payment gateway, plans, subscriptions, support, enquiries, Flow/Automation platforms, main site.', h: '/admin/dashboard', c: 'admin@whatscrm.demo' },
    { t: 'User Panel', d: 'Dashboard, sales, conversations, marketing, WhatsApp, automation & AI, products, billing and settings.', h: '/panel/dashboard', c: 'owner@whatscrm.demo' },
  ]
  return <main className="grid min-h-screen place-items-center bg-background p-6"><div className="w-full max-w-3xl">
    <h1 className="text-center text-3xl font-semibold tracking-tight">WhatsCRM — Demo</h1>
    <p className="mt-2 text-center text-sm text-muted-foreground">Runs fully on demo data stored in your browser. No database needed.</p>
    <div className="mt-8 grid gap-4 md:grid-cols-2">{cards.map(c => <Link key={c.h} href={c.h} className="rounded-2xl border border-border bg-card p-6 transition hover:ring-2 hover:ring-primary">
      <h2 className="text-lg font-semibold">{c.t}</h2><p className="mt-2 text-sm text-muted-foreground">{c.d}</p><p className="mt-4 text-xs text-muted-foreground">Demo login: {c.c}</p><span className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Enter →</span></Link>)}</div></div></main>
}
