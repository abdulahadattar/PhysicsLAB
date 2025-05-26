// Dummy sidebar components for app startup and rendering
import * as React from 'react';

export function SidebarProvider({children}: {children: React.ReactNode}) { return <div>{children}</div>; }
export function Sidebar(props: any) { return <aside {...props} />; }
export function SidebarHeader(props: any) { return <div {...props} />; }
export function SidebarContent(props: any) { return <div {...props} />; }
export function SidebarFooter(props: any) { return <div {...props} />; }
export function SidebarMenu(props: any) { return <nav {...props} />; }
export function SidebarMenuButton(props: any) { return <button {...props} />; }
export function SidebarTrigger(props: any) { return <button {...props} style={{display:'none'}} aria-label={props['aria-label']||'SidebarTrigger'} />; }
export function SidebarMenuItem(props: any) { return <div {...props} />; }
export function useSidebar() { return { state: 'expanded', isMobile: false, open: true, setOpen: () => {}, openMobile: false, setOpenMobile: () => {}, toggleSidebar: () => {} }; }