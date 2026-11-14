/**
 * PAYMENT GATEWAY (PG) PROVISION
 * The admin "Payment Gateway" screen and the checkout flow only talk to the
 * `PaymentGateway` interface. Demo mode simulates every provider. To go live:
 *   1. Create server routes, e.g. POST /api/payments/razorpay/create-order and
 *      /api/payments/razorpay/webhook (keep secrets server-side!).
 *   2. Replace `charge` below for that provider with a fetch() to that route
 *      (open the provider's checkout, then confirm via webhook).
 *   3. Or add a brand-new gateway: implement PaymentGateway and call registerGateway().
 */
export interface GatewayConfig { id: string; provider: string; name: string; mode: string; keyId: string; secret: string; [k: string]: any }
export interface PaymentRequest { amount: number; currency: string; description: string; customer: { name: string; email: string }; method?: string }
export interface PaymentResult { ok: boolean; gateway: string; reference: string; status: 'paid' | 'failed' | 'pending'; message?: string }
export interface PaymentGateway {
  id: string
  label: string
  testConnection(cfg: GatewayConfig): Promise<{ ok: boolean; message: string }>
  charge(req: PaymentRequest, cfg: GatewayConfig): Promise<PaymentResult>
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms))
const ref = (p: string) => `${p}_${Date.now().toString(36).toUpperCase()}`

function simulated(id: string, label: string): PaymentGateway {
  return {
    id, label,
    async testConnection(cfg) {
      await wait(700)
      return cfg.keyId && cfg.secret ? { ok: true, message: `${label} credentials look valid (${cfg.mode} mode, simulated)` } : { ok: false, message: 'Key ID and secret are required' }
    },
    async charge(req, cfg) {
      await wait(900)
      // TODO(live): call your server route here instead of simulating.
      const ok = !!cfg.keyId && !!cfg.secret
      return { ok, gateway: label, reference: ref(id.slice(0, 3).toUpperCase()), status: ok ? 'paid' : 'failed', message: ok ? 'Payment captured (demo)' : 'Gateway not configured' }
    },
  }
}

const registry = new Map<string, PaymentGateway>()
export function registerGateway(g: PaymentGateway) { registry.set(g.id, g) }
export function getGateway(id: string): PaymentGateway { return registry.get(id) ?? registry.get('demo')! }
;[['demo', 'Demo Gateway'], ['razorpay', 'Razorpay'], ['stripe', 'Stripe'], ['paytm', 'Paytm PG']].forEach(([i, l]) => registerGateway(simulated(i, l)))
