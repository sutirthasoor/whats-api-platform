'use client'
import type { ReactNode } from 'react'
import { Shell } from './shell'
import { ADMIN_NAV, PANEL_NAV } from './apps'

export const PanelShell = ({ children }: { children: ReactNode }) => <Shell brand="WhatsCRM" badge="User Panel" base="/panel" nav={PANEL_NAV} user={{ name: 'Sutirtha', email: 'owner@whatscrm.demo' }} switchTo={{ label: 'Switch to Admin panel', href: '/admin/dashboard' }}>{children}</Shell>
export const AdminShell = ({ children }: { children: ReactNode }) => <Shell brand="WhatsCRM" badge="Admin Panel" base="/admin" nav={ADMIN_NAV} user={{ name: 'Super Admin', email: 'admin@whatscrm.demo' }} switchTo={{ label: 'Switch to User panel', href: '/panel/dashboard' }}>{children}</Shell>
