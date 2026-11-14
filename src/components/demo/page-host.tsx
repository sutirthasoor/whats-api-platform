'use client'
import { usePathname } from 'next/navigation'
import { ADMIN_PAGES, PANEL_PAGES } from './apps'

/** Resolves the page component on the client (components can't cross the server boundary as props). */
export function PageHost({ k }: { k: string }) {
  const admin = usePathname().startsWith('/admin')
  const C = (admin ? ADMIN_PAGES : PANEL_PAGES)[k]
  return C ? <C /> : <p className="p-10 text-center text-muted-foreground">Page not found.</p>
}
