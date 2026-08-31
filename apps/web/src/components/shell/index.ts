/**
 * DIVINI exo — Barrel du shell applicatif (LOT 02)
 *
 * Un seul point d'entrée, comme pour les primitives du LOT 01 : les modules
 * des lots 05 à 23 importent le shell sans connaître son découpage interne.
 */

export { AppShell, DEMO_SESSION } from './AppShell';

export { Breadcrumb, ContextBar, ModuleTabs } from './ContextBar';
export type { BreadcrumbSegment, ModuleTab } from './ContextBar';

export { ConnectionStatus } from './ConnectionStatus';

export { ScopeSwitcher } from './ScopeSwitcher';

export { Sidebar, SidebarBrand, SidebarGroup, SidebarItem, UserFooter } from './Sidebar';
export type { DemoSession } from './Sidebar';

export { SearchTrigger, Topbar } from './Topbar';

export { ThemeToggle } from './ThemeToggle';

export { WorkspaceLayout } from './WorkspaceLayout';
