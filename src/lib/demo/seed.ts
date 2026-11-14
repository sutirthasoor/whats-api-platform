// Demo seed data. Everything is generated relative to "now" so the demo
// always looks fresh. Replace this file's role with real DB reads by
// implementing a DataProvider (see ./store.ts).
export type Row = { id: string; [k: string]: any }

const ago = (d: number, h = 0) => new Date(Date.now() - d * 864e5 - h * 36e5).toISOString()
const ahead = (d: number, h = 0) => ago(-d, -h)
function P<T>(a: T[], i: number): T { return a[i % a.length] }
function mk(pre: string, n: number, f: (i: number) => Omit<Row, 'id'>): Row[] {
  return Array.from({ length: n }, (_, i) => ({ id: `${pre}_${i + 1}`, ...f(i) }))
}

const N = ['Aarav Sharma','Priya Patel','Rohan Mehta','Ananya Iyer','Vikram Singh','Neha Gupta','Arjun Nair','Kavya Reddy','Rahul Verma','Sneha Das','Aditya Rao','Meera Joshi','Karan Malhotra','Ishita Bose','Siddharth Jain','Pooja Kulkarni','Manish Agarwal','Divya Menon','Sandeep Roy','Tanvi Shah']
const CO = ['Textile Hub','BlueLeaf Foods','Apex Logistics','Nova Clinics','Urban Nest Realty','BrightPath EdTech','Zenith Motors','Saffron Kitchen','PixelCraft Studio','GreenGrid Energy']
const CITY = ['Mumbai','Bengaluru','Delhi','Pune','Hyderabad','Kolkata','Chennai','Bhubaneswar','Jaipur','Ahmedabad']
const OWN = ['Riya','Kabir','Meera','Dev']
const phone = (i: number) => `+91 9${String(800000000 + i * 7919317).slice(0, 9)}`
const mail = (i: number) => `${P(N, i).split(' ')[0].toLowerCase()}@${P(CO, i).toLowerCase().replace(/[^a-z]/g, '')}.in`
const LEAD_ST = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost']
const STAGES = ['New Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won']

const THREAD = [
  ['them', 'Hi, I saw your ad on Instagram. Can you share pricing?'],
  ['me', 'Hello! Happy to help. Our plans start at ₹999/month. Would you like a quick demo?'],
  ['them', 'Yes please, tomorrow afternoon works for me.'],
  ['me', 'Booked for 3 PM. I will send the meeting link here.'],
  ['them', 'Great, thanks! Also do you support broadcast messages?'],
]
const conv = (i: number) => {
  const n = 2 + (i % 4)
  return {
    name: P(N, i + 3), phone: phone(i + 3), unread: i % 3 === 0 ? (i % 4) + 1 : 0,
    status: P(['Open', 'Open', 'Pending', 'Resolved'], i), assignee: P(OWN, i),
    tags: [P(['Hot lead', 'Support', 'Pricing', 'VIP', 'Demo'], i)],
    messages: THREAD.slice(0, n).map(([from, text], k) => ({ id: `m${i}_${k}`, from, text, at: ago(0, (n - k) * 2 + i) })),
  }
}

const PLAN_DEF: [string, number, number, number, number, string][] = [
  ['Automation', 999, 9990, 3, 5000, 'Chatbot builder,Keyword triggers,Auto replies,Workflow logs'],
  ['Flow', 1499, 14990, 5, 10000, 'Visual flow builder,WhatsApp Forms,Webhooks,Run history'],
  ['ATS', 1999, 19990, 8, 15000, 'Job posts,Candidate pipeline,Resume parsing,Interview scheduling'],
  ['HRMS', 2499, 24990, 25, 20000, 'Attendance,Payroll,Leave management,Employee portal'],
  ['Social Media', 1299, 12990, 4, 8000, 'Post scheduler,Unified comments,Analytics,Brand kit'],
  ['Unified', 4999, 49990, 50, 100000, 'Everything in all plans,Priority support,SSO,Custom domain'],
]
const PLANS = PLAN_DEF.map(p => p[0])
const STATUS_U = ['Active', 'Active', 'Trial', 'Active', 'Suspended']

const platform = (pre: string) => ({
  [`${pre}_users`]: () => mk(`${pre}u`, 10, i => ({ name: P(N, i + 5), email: mail(i + 5), org: P(CO, i), role: P(['Owner', 'Admin', 'Member', 'Member'], i), status: P(['Active', 'Active', 'Invited', 'Suspended'], i), lastActive: ago(i * 0.7) })),
  [`${pre}_orgs`]: () => mk(`${pre}o`, 6, i => ({ name: P(CO, i), owner: P(N, i + 2), members: 3 + i * 4, plan: P(PLANS, i), status: P(['Active', 'Active', 'Trial'], i), created: ago(20 + i * 30) })),
  [`${pre}_training`]: () => mk(`${pre}t`, 6, i => ({ title: P(['Getting started', 'Building your first flow', 'Advanced triggers', 'Webhooks & API', 'Best practices', 'Troubleshooting'], i), type: P(['Video', 'Document', 'Live session'], i), duration: `${15 + i * 10} min`, enrolled: 20 + i * 13, status: P(['Published', 'Published', 'Draft'], i) })),
  [`${pre}_credentials`]: () => mk(`${pre}c`, 5, i => ({ service: P(['WhatsApp Cloud API', 'OpenAI', 'SMTP', 'Google OAuth', 'S3 Storage'], i), keyName: P(['ACCESS_TOKEN', 'API_KEY', 'SMTP_PASSWORD', 'CLIENT_SECRET', 'SECRET_KEY'], i), value: `sk_${pre}_${(9183746 * (i + 3)).toString(36)}${(i * 77123).toString(36)}`, environment: P(['Production', 'Production', 'Staging'], i), status: 'Active', updated: ago(i * 6) })),
})

export const SEED: Record<string, () => Row[]> = {
  leads: () => mk('lead', 24, i => ({ name: P(N, i), phone: phone(i), email: mail(i), company: P(CO, i), source: P(['WhatsApp', 'Website', 'Referral', 'Instagram', 'Google Ads', 'Facebook'], i), status: P(LEAD_ST, i * 2 + (i % 3)), value: 5000 + ((i * 3700) % 90000), owner: P(OWN, i), createdAt: ago(i * 1.3) })),
  deals: () => mk('deal', 14, i => ({ title: `${P(CO, i)} — ${P(['Starter plan', 'Annual contract', 'Bulk broadcast', 'Custom bot'], i)}`, contact: P(N, i), value: 12000 + ((i * 8300) % 150000), stage: P(STAGES, i * 3 + (i % 2)), owner: P(OWN, i), closeDate: ahead(i * 2 + 3).slice(0, 10) })),
  customers: () => mk('cust', 16, i => ({ name: P(N, i + 1), company: P(CO, i + 2), phone: phone(i + 9), email: mail(i + 1), city: P(CITY, i), totalSpent: 8000 + ((i * 11300) % 240000), status: P(['Active', 'Active', 'Active', 'Inactive'], i), since: ago(30 + i * 22) })),
  conversations: () => mk('conv', 10, conv),
  followups: () => mk('fu', 12, i => ({ contact: P(N, i + 4), task: P(['Send pricing deck', 'Call to confirm demo', 'Share catalogue on WhatsApp', 'Collect payment', 'Renewal discussion'], i), dueAt: i < 3 ? ago(i + 1) : ahead(i), priority: P(['High', 'Medium', 'Low'], i), status: i < 2 ? 'Overdue' : i % 5 === 0 ? 'Done' : 'Pending', assignee: P(OWN, i) })),
  meetings: () => mk('meet', 8, i => ({ title: P(['Product demo', 'Onboarding call', 'Pricing discussion', 'Quarterly review'], i), contact: P(N, i + 6), at: i < 3 ? ago(i + 1) : ahead(i, 3), duration: P([30, 45, 60], i), mode: P(['Google Meet', 'In person', 'Phone'], i), status: i < 3 ? 'Completed' : i === 5 ? 'Cancelled' : 'Scheduled', link: `https://meet.example.com/wc-${i + 100}` })),
  calls: () => mk('call', 14, i => ({ contact: P(N, i + 7), phone: phone(i + 7), direction: P(['Outbound', 'Inbound'], i), duration: i % 5 === 3 ? 0 : 2 + ((i * 3) % 14), status: i % 5 === 3 ? 'Missed' : i % 7 === 6 ? 'Scheduled' : 'Completed', at: ago(i * 0.5, i), notes: P(['Interested in annual plan', 'Asked for a callback', 'Needs integration help', 'Not reachable', 'Will confirm tomorrow'], i) })),
  campaigns: () => mk('camp', 8, i => { const sent = 800 + i * 410; return { name: P(['Diwali Offer', 'New Arrivals', 'Cart Reminder', 'Webinar Invite', 'Feedback Survey', 'Renewal Nudge', 'Winter Sale', 'Product Launch'], i), template: P(['promo_offer_v2', 'order_update', 'webinar_invite'], i), sent, delivered: Math.round(sent * 0.96), read: Math.round(sent * (0.62 - i * 0.02)), replied: Math.round(sent * 0.11), failed: Math.round(sent * 0.04), status: i === 0 ? 'Running' : i === 1 ? 'Scheduled' : 'Completed', date: ago(i * 6) } }),
  leadforms: () => mk('lf', 5, i => ({ name: P(['Website enquiry', 'Demo request', 'Newsletter', 'Event registration', 'Callback request'], i), fields: 4 + i, submissions: 40 + i * 37, status: i === 4 ? 'Paused' : 'Active', slug: `form-${i + 1}`, source: P(['Website', 'Landing page', 'QR code'], i) })),
  media: () => mk('media', 12, i => ({ name: P(['banner-diwali.png', 'catalogue.pdf', 'demo-video.mp4', 'logo.png', 'price-list.pdf', 'welcome-note.mp3'], i), type: P(['image', 'document', 'video', 'image', 'document', 'audio'], i), size: `${(0.3 + i * 0.37).toFixed(1)} MB`, createdAt: ago(i * 3) })),
  templates: () => mk('tpl', 9, i => ({ name: P(['welcome_message', 'order_confirmation', 'promo_offer_v2', 'payment_reminder', 'otp_login', 'feedback_request', 'appointment_reminder', 'shipping_update', 'cart_recovery'], i), category: P(['Utility', 'Utility', 'Marketing', 'Utility', 'Authentication', 'Marketing'], i), language: P(['en', 'en', 'hi', 'en'], i), status: P(['Approved', 'Approved', 'Pending', 'Approved', 'Rejected'], i), body: P(['Hi {{1}}, welcome to {{2}}! Reply HELP anytime.', 'Your order {{1}} is confirmed and will ship soon.', 'Flat {{1}}% off this week only. Tap to shop now!', 'Hi {{1}}, invoice {{2}} of ₹{{3}} is due on {{4}}.'], i) })),
  waforms: () => mk('wf', 5, i => ({ name: P(['Customer feedback', 'Appointment booking', 'Lead capture', 'Order form', 'Support request'], i), screens: 1 + (i % 3), responses: 25 + i * 31, status: P(['Published', 'Published', 'Draft'], i), updated: ago(i * 4) })),
  broadcasts: () => mk('bc', 10, i => { const s = 300 + i * 150; return { name: P(['Weekend flash sale', 'Payment reminders', 'New feature update', 'Event invite', 'Festival greetings'], i), template: P(['promo_offer_v2', 'payment_reminder', 'welcome_message'], i), audience: P(['All contacts', 'Hot leads', 'Customers', 'Tag: VIP'], i), sent: s, delivered: Math.round(s * 0.95), read: Math.round(s * 0.55), failed: Math.round(s * 0.05), status: i === 0 ? 'Scheduled' : i === 4 ? 'Failed' : 'Completed', at: ago(i * 2) } }),
  chatbot: () => mk('bot', 8, i => ({ trigger: P(['hi', 'price', 'catalogue', 'order status', 'timing', 'support', 'location', 'human'], i), matchType: P(['Exact', 'Contains', 'Contains', 'Starts with'], i), reply: P(['Hello! 👋 How can we help you today?', 'Our plans start at ₹999/month. Reply DEMO to book a demo.', 'Here is our latest catalogue 📎', 'Please share your order ID and we will check.', 'We are open Mon–Sat, 9 AM – 7 PM.', 'Connecting you with a support agent…', 'We are based in Bhubaneswar.', 'An agent will join shortly.'], i), status: i === 6 ? 'Inactive' : 'Active', hits: 20 + i * 14 })),
  faqs: () => mk('faq', 10, i => ({ question: P(['What are your business hours?', 'Do you offer a free trial?', 'How do I reset my password?', 'What payment methods are accepted?', 'Can I cancel anytime?', 'Do you support Arattai?', 'How do broadcasts work?', 'Is my data secure?', 'Where is my invoice?', 'How do I add team members?'], i), answer: P(['We are open Monday to Saturday, 9 AM to 7 PM IST.', 'Yes — every plan includes a 14-day free trial, no card required.', 'Use "Forgot password" on the login page and follow the email link.', 'UPI, cards, net banking and wallets through our payment gateway.', 'Yes. Cancel from Settings → Billing and you keep access until period end.'], i), category: P(['General', 'Pricing', 'Account', 'Billing', 'Product'], i), status: 'Active', hits: 12 + i * 9 })),
  products: () => mk('prod', 12, i => ({ name: P(['Starter Plan', 'Growth Plan', 'Enterprise Plan', 'Onboarding Service', 'Custom Chatbot', 'Broadcast Pack (10k)', 'Template Design', 'Priority Support', 'API Add-on', 'Training Workshop', 'Data Migration', 'Dedicated Number'], i), type: i % 3 === 0 || i === 4 ? 'Service' : 'Product', sku: `SKU-${1000 + i}`, price: 999 + ((i * 2250) % 24000), tax: P([18, 18, 12], i), stock: i % 3 === 0 ? '—' : 50 + i * 7, status: i === 9 ? 'Inactive' : 'Active' })),
  quotations: () => mk('qt', 10, i => { const amt = 6000 + ((i * 9100) % 80000); return { number: `QT-2026-${String(i + 1).padStart(3, '0')}`, customer: P(N, i + 2), items: `${P(['Growth Plan', 'Custom Chatbot', 'Onboarding Service'], i)} x${1 + (i % 3)}`, amount: amt, total: Math.round(amt * 1.18), validTill: ahead(10 - i).slice(0, 10), status: P(['Draft', 'Sent', 'Accepted', 'Sent', 'Rejected'], i) } }),
  invoices: () => mk('inv', 16, i => { const t = 7000 + ((i * 12700) % 120000); const st = P(['Paid', 'Paid', 'Unpaid', 'Overdue', 'Partial', 'Paid'], i); return { number: `INV-2026-${String(i + 1).padStart(3, '0')}`, customer: P(N, i + 1), issued: ago(i * 9).slice(0, 10), due: ahead(12 - i * 9 / 3).slice(0, 10), total: t, paid: st === 'Paid' ? t : st === 'Partial' ? Math.round(t / 2) : 0, status: st } }),
  reminders: () => mk('rem', 8, i => ({ invoice: `INV-2026-${String(i * 2 + 3).padStart(3, '0')}`, customer: P(N, i + 3), channel: P(['WhatsApp', 'Email', 'SMS'], i), sendOn: i < 3 ? ago(i + 1) : ahead(i), status: i < 3 ? 'Sent' : 'Scheduled', message: 'Hi, a gentle reminder that your invoice is pending. Pay securely using the link below.' })),
  team: () => [
    { id: 'tm_1', name: 'Sutirtha Soor', email: 'owner@whatscrm.demo', role: 'Admin', status: 'Active' },
    { id: 'tm_2', name: 'Riya Sen', email: 'riya@whatscrm.demo', role: 'Agent', status: 'Active' },
    { id: 'tm_3', name: 'Kabir Das', email: 'kabir@whatscrm.demo', role: 'Agent', status: 'Invited' },
    { id: 'tm_4', name: 'Meera Nair', email: 'meera@whatscrm.demo', role: 'Viewer', status: 'Active' },
  ],
  apikeys: () => [
    { id: 'key_1', name: 'Production server', key: 'wc_live_8f3a91c2d7e04b5aa1', created: ago(40), lastUsed: ago(0, 2), status: 'Active' },
    { id: 'key_2', name: 'Zapier', key: 'wc_live_21bb7c90e5d34f6c02', created: ago(90), lastUsed: ago(12), status: 'Active' },
  ],
  settings: () => [{ id: 'main', name: 'Sutirtha Soor', email: 'owner@whatscrm.demo', phone: '+91 98000 12345', timezone: 'Asia/Kolkata', business: 'Demo Business Pvt Ltd', gst: '21ABCDE1234F1Z5', address: 'Bhubaneswar, Odisha, India', currency: 'INR', plan: 'Growth', cycle: 'Monthly', notifyNew: true, notifyAssign: true, notifyDigest: false, notifyPayment: true }],
  waapi: () => [{ id: 'main', connected: true, phoneNumber: '+91 98000 12345', phoneNumberId: '109876543210987', wabaId: '203948576102938', token: 'EAAG' + 'x9Kd0pQ2mZl83hTfR1vYbN7cUa5WjS', verifyToken: 'wc_verify_7d2f91', quality: 'Green', tier: 'Tier 1 (1K/day)', log: [] }],
  aiconfig: () => [{ id: 'main', name: 'Aria', tone: 'Friendly', model: 'Claude Sonnet', autoReply: true, useFaqs: true, useProducts: true, handoff: true, greeting: 'Hi! I am Aria, how can I help you today?' }],
  // ---------------- admin ----------------
  users: () => mk('usr', 18, i => ({ name: P(N, i), email: mail(i), company: P(CO, i), plan: P(PLANS, i * 2 + 1), status: P(STATUS_U, i), role: i % 9 === 0 ? 'Reseller' : 'Customer', joined: ago(10 + i * 17), lastLogin: ago(i * 0.8) })),
  plans: () => PLAN_DEF.map((p, i) => ({ id: `plan_${i + 1}`, name: p[0], priceMonthly: p[1], priceYearly: p[2], seats: p[3], messages: p[4], features: p[5], status: 'Active', subscribers: 12 + i * 9 })),
  subscriptions: () => mk('sub', 14, i => { const plan = PLAN_DEF[(i * 2 + 1) % 6]; const y = i % 4 === 3; return { user: P(N, i), plan: plan[0], cycle: y ? 'Yearly' : 'Monthly', amount: y ? plan[2] : plan[1], status: P(['Active', 'Active', 'Trialing', 'Active', 'Past due', 'Cancelled'], i), started: ago(30 + i * 20).slice(0, 10), renewsOn: ahead(i * 2 + 1).slice(0, 10) } }),
  payments: () => mk('pay', 20, i => { const plan = PLAN_DEF[(i * 3) % 6]; return { ref: `PAY-${48210 + i}`, user: P(N, i + 2), plan: plan[0], amount: i % 5 === 4 ? plan[2] : plan[1], method: P(['UPI', 'Card', 'Net Banking', 'UPI', 'Wallet'], i), gateway: P(['Razorpay', 'Stripe', 'Paytm', 'Razorpay'], i), status: P(['Paid', 'Paid', 'Paid', 'Failed', 'Pending', 'Refunded'], i), date: ago(i * 3.2).slice(0, 10) } }),
  usage: () => mk('use', 12, i => ({ user: P(N, i), plan: P(PLANS, i + 1), messages: 900 + ((i * 3137) % 9000), messagesLimit: P([5000, 10000, 20000], i), contacts: 150 + i * 220, contactsLimit: P([2000, 5000, 10000], i), storageGb: +(0.4 + i * 0.35).toFixed(1), storageLimit: P([5, 10, 25], i), period: 'Nov 2026' })),
  gateways: () => [
    { id: 'gw_razorpay', provider: 'razorpay', name: 'Razorpay', mode: 'Test', enabled: true, isDefault: true, keyId: 'rzp_test_demo1234567', secret: 'rzp_secret_demo_xxxxxxxx', fee: 2, webhook: 'https://your-domain.com/api/payments/razorpay/webhook' },
    { id: 'gw_stripe', provider: 'stripe', name: 'Stripe', mode: 'Test', enabled: false, isDefault: false, keyId: 'pk_test_demo', secret: 'sk_test_demo_xxxxxxxx', fee: 2.9, webhook: 'https://your-domain.com/api/payments/stripe/webhook' },
    { id: 'gw_paytm', provider: 'paytm', name: 'Paytm PG', mode: 'Test', enabled: true, isDefault: false, keyId: 'PAYTM_MID_DEMO', secret: 'paytm_key_demo_xxxx', fee: 1.8, webhook: 'https://your-domain.com/api/payments/paytm/webhook' },
    { id: 'gw_demo', provider: 'demo', name: 'Demo Gateway', mode: 'Test', enabled: true, isDefault: false, keyId: 'demo', secret: 'demo', fee: 0, webhook: '—' },
  ],
  tickets: () => mk('tkt', 10, i => ({ subject: P(['Unable to connect WhatsApp number', 'Invoice not received', 'Template rejected by Meta', 'Need to upgrade plan', 'Webhook not firing', 'Export contacts failing', 'Add extra seats', 'Login OTP delay', 'Broadcast stuck in queue', 'Refund request'], i), user: P(N, i + 4), category: P(['Technical', 'Billing', 'Templates', 'Sales'], i), priority: P(['High', 'Medium', 'Low', 'Urgent'], i), status: P(['Open', 'In progress', 'Resolved', 'Open', 'Closed'], i), assignee: P(['Riya', 'Kabir', 'Unassigned'], i), created: ago(i * 1.4), replies: [{ by: P(N, i + 4), text: 'Hi team, I need help with this as soon as possible.', at: ago(i * 1.4) }, ...(i % 2 ? [{ by: 'Support', text: 'Thanks for reaching out — we are looking into it now.', at: ago(i * 1.4 - 0.2) }] : [])] })),
  enquiries: () => mk('enq', 12, i => ({ name: P(N, i + 9), email: mail(i + 9), phone: phone(i + 11), interest: P(PLANS, i), message: P(['Need a demo for my team of 10.', 'Do you offer white-label?', 'Looking for pricing for 50 users.', 'Can this integrate with Tally?'], i), source: P(['Website', 'Pricing page', 'WhatsApp', 'Referral'], i), status: P(['New', 'New', 'Contacted', 'Qualified', 'Closed'], i), created: ago(i * 0.9) })),
  ...platform('flow'), ...platform('auto'),
  site_credentials: () => mk('sc', 5, i => ({ service: P(['SMTP (Email)', 'Google Analytics', 'reCAPTCHA', 'Meta Pixel', 'Cloudinary'], i), keyName: P(['SMTP_PASS', 'GA_MEASUREMENT_ID', 'RECAPTCHA_SECRET', 'PIXEL_ID', 'CLOUD_API_SECRET'], i), value: `demo_${(5527391 * (i + 2)).toString(36)}${(i * 4421).toString(36)}`, environment: 'Production', status: 'Active', updated: ago(i * 9) })),
  siteTheme: () => [{ id: 'main', brand: 'WhatsCRM', tagline: 'The WhatsApp CRM for growing teams', primary: '#7c3aed', accent: '#22c55e', font: 'Inter', headline: 'Close more deals on WhatsApp', sub: 'Shared inbox, broadcasts, pipelines and automations in one place.', cta: 'Start free trial', radius: 12, darkDefault: true }],
}
