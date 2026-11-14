'use client'
import type { ReactElement } from 'react'
import { BookOpen, Bot, CreditCard, FileText, Globe, HeartHandshake, Inbox as InboxI, LayoutDashboard, Layers, Megaphone, MessageCircle, Package, Receipt, Settings, ShoppingBag, Tag, Users, Workflow, Wallet, Zap, Mail } from 'lucide-react'
import { Crud } from './crud'
import { PANEL_CRUD } from './panel-crud'
import * as P from './panel-special'
import * as A from './admin-pages'
import type { NavItem } from './shell'

const crud = (k: string) => () => <Crud cfg={PANEL_CRUD[k]} />
export const PANEL_PAGES: Record<string, () => ReactElement> = {
  dashboard: P.UserDashboard, 'sales/pipeline': P.Pipeline, 'conversation/inbox': P.Inbox, 'marketing/media-library': P.MediaLibrary, 'whatsapp/api': P.WhatsAppApi, 'whatsapp/api-docs': P.ApiDocs,
  'automation/ai-assistant': P.AiAssistant, 'billing/reports': P.BillingReports, settings: P.UserSettings, ...Object.fromEntries(Object.keys(PANEL_CRUD).map(k => [k, crud(k)])),
}
const L = (b: string, items: [string, string][]) => items.map(([label, h]) => ({ label, href: `${b}/${h}` }))
export const PANEL_NAV: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/panel/dashboard' },
  { label: 'Sales', icon: Wallet, children: L('/panel/sales', [['Leads', 'leads'], ['Pipeline', 'pipeline'], ['Customers', 'customers']]) },
  { label: 'Conversation', icon: MessageCircle, children: L('/panel/conversation', [['Inbox', 'inbox'], ['Follow Ups', 'follow-ups'], ['Meetings', 'meetings'], ['Calls', 'calls']]) },
  { label: 'Marketing', icon: Megaphone, children: L('/panel/marketing', [['Campaign Reports', 'campaign-reports'], ['Lead Form', 'lead-form'], ['Media Library', 'media-library']]) },
  { label: 'WhatsApp', icon: Mail, children: L('/panel/whatsapp', [['Templates', 'templates'], ['Forms', 'forms'], ['Broadcast Logs', 'broadcast-logs'], ['WhatsApp API', 'api'], ['API Docs', 'api-docs']]) },
  { label: 'Automation & AI', icon: Bot, children: L('/panel/automation', [['Chatbot', 'chatbot'], ['FAQ Bot', 'faq-bot'], ['AI Assistant', 'ai-assistant']]) },
  { label: 'Products/Services', icon: Package, href: '/panel/products' },
  { label: 'Billing', icon: Receipt, children: L('/panel/billing', [['Quotations', 'quotations'], ['Invoices', 'invoices'], ['Reports', 'reports'], ['Reminders', 'reminders']]) },
  { label: 'Settings', icon: Settings, href: '/panel/settings' },
]

export const ADMIN_PAGES: Record<string, () => ReactElement> = {
  dashboard: A.AdminDashboard, users: A.Users, 'billing-usage': A.BillingUsage, 'payment-gateway': A.PaymentGateway, plans: () => <Crud cfg={A.plansCfg} />, subscriptions: () => <Crud cfg={A.subsCfg} />, support: A.Support, enquiries: A.Enquiries,
  ...Object.fromEntries((['flow', 'automation'] as const).flatMap(p => Object.entries(p === 'flow' ? A.FLOW : A.AUTO).map(([k, C]) => [`${p}/${k}`, C as () => ReactElement]))),
  'main-site/theming': A.SiteTheming, 'main-site/credentials': A.SiteCredentials,
}
const plat = ['Overview', 'Users', 'Organisation', 'Training', 'Credentials']
export const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' }, { label: 'User Management', icon: Users, href: '/admin/users' }, { label: 'Billing & Usage', icon: Receipt, href: '/admin/billing-usage' }, { label: 'Payment Gateway', icon: CreditCard, href: '/admin/payment-gateway' },
  { label: 'Plans', icon: Layers, href: '/admin/plans' }, { label: 'Subscriptions', icon: Zap, href: '/admin/subscriptions' }, { label: 'Support', icon: HeartHandshake, href: '/admin/support' }, { label: 'Enquiries', icon: BookOpen, href: '/admin/enquiries' },
  { label: 'Flow Platform', icon: Workflow, children: plat.map(l => ({ label: l, href: `/admin/flow/${l.toLowerCase()}` })) }, { label: 'Automation Platform', icon: Bot, children: plat.map(l => ({ label: l, href: `/admin/automation/${l.toLowerCase()}` })) },
  { label: 'Main Site', icon: Globe, children: [{ label: 'Theming', href: '/admin/main-site/theming' }, { label: 'Credentials', href: '/admin/main-site/credentials' }] },
]
