'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { db, useCollection, type Row } from '@/lib/demo/store'
import { getGateway } from '@/lib/payments'
import { Btn, Label, Modal, Select, inr } from './ui'

/** Demo checkout. Reads enabled gateways configured in Admin → Payment Gateway and charges via the PG abstraction. */
export function CheckoutModal({ open, onClose, plan, cycle, customer, onPaid }: { open: boolean; onClose: () => void; plan: Row | null; cycle: 'Monthly' | 'Yearly'; customer: { name: string; email: string }; onPaid?: () => void }) {
  const { rows } = useCollection('gateways'); const gws = rows.filter(g => g.enabled)
  const [gid, setGid] = useState(''); const [method, setMethod] = useState('UPI'); const [busy, setBusy] = useState(false)
  if (!plan) return null
  const gw = gws.find(g => g.id === gid) ?? gws.find(g => g.isDefault) ?? gws[0]
  const amount = cycle === 'Yearly' ? plan.priceYearly : plan.priceMonthly
  const pay = async () => {
    if (!gw) return void toast.error('No payment gateway is enabled')
    setBusy(true)
    const r = await getGateway(gw.provider).charge({ amount, currency: 'INR', description: `${plan.name} plan (${cycle})`, customer, method }, gw as any)
    await db.create('payments', { ref: r.reference, user: customer.name, plan: plan.name, amount, method, gateway: gw.name, status: r.ok ? 'Paid' : 'Failed', date: new Date().toISOString().slice(0, 10) })
    if (r.ok) {
      await db.create('subscriptions', { user: customer.name, plan: plan.name, cycle, amount, status: 'Active', started: new Date().toISOString().slice(0, 10), renewsOn: new Date(Date.now() + (cycle === 'Yearly' ? 365 : 30) * 864e5).toISOString().slice(0, 10) })
      toast.success(`Payment successful · ${r.reference}`); onPaid?.(); onClose()
    } else toast.error(r.message ?? 'Payment failed')
    setBusy(false)
  }
  return <Modal open={open} onClose={onClose} title="Secure checkout">
    <div className="space-y-4"><div className="rounded-lg border border-border bg-card-2 p-4"><p className="text-sm text-muted-foreground">{plan.name} plan · {cycle}</p><p className="text-2xl font-semibold">{inr(amount)}</p></div>
      <div><Label>Payment gateway</Label><Select options={gws.map(g => g.name)} value={gw?.name ?? ''} onChange={e => setGid(gws.find(g => g.name === e.target.value)?.id ?? '')} /></div>
      <div><Label>Payment method</Label><Select options={['UPI', 'Card', 'Net Banking', 'Wallet']} value={method} onChange={e => setMethod(e.target.value)} /></div>
      <p className="text-xs text-muted-foreground">Demo mode — no real money is charged. Live gateways plug in via <code>src/lib/payments</code>.</p>
      <Btn className="w-full" disabled={busy} onClick={pay}>{busy ? 'Processing…' : `Pay ${inr(amount)}`}</Btn></div></Modal>
}
