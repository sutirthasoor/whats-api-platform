import { AdminShell } from '@/components/demo/layouts'
export const metadata = { title: 'Admin Panel (demo)' }
export default function Layout({ children }: { children: React.ReactNode }) { return <AdminShell>{children}</AdminShell> }
