import { PanelShell } from '@/components/demo/layouts'
export const metadata = { title: 'User Panel (demo)' }
export default function Layout({ children }: { children: React.ReactNode }) { return <PanelShell>{children}</PanelShell> }
