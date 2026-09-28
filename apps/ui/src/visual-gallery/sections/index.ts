import type { ComponentType } from 'react'
import { AppDialogsSection } from './app-dialogs'
import { AppSection } from './app'
import { ButtonsExtraSection } from './buttons-extra'
import { ButtonsSection } from './buttons'
import { CommandCalendarExtraSection } from './command-calendar-extra'
import { CanarySection } from './canary'
import { DataDisplayExtraSection } from './data-display-extra'
import { DataDisplaySection } from './data-display'
import { DisclosureExtraSection } from './disclosure-extra'
import { DisclosureSection } from './disclosure'
import { FeedbackSection } from './feedback'
import { FloatingExtraSection } from './floating-extra'
import { FormsExtraSection } from './forms-extra'
import { FormsSection } from './forms'
import { FormsTogglesSection } from './forms-toggles'
import { OverlaysExtraSection } from './overlays-extra'
import { MenusExtraSection } from './menus-extra'
import { MenubarNavExtraSection } from './menubar-nav-extra'
import { NavBitsExtraSection } from './nav-bits-extra'
import { OverlaysSection } from './overlays'
import { OverlaysSheetDrawerSection } from './overlays-sheet-drawer'
import { SelectComboboxExtraSection } from './select-combobox-extra'
import { SidebarPartsSection } from './sidebar-parts'
import { TokensSection } from './tokens'
import { TypographyExtraSection } from './typography-extra'
import { ToolsFiltersExtraSection } from './tools-filters-extra'
import { TypographySection } from './typography'

export interface GallerySection {
  id: string
  title: string
  Component: ComponentType
}

export const GALLERY_SECTIONS: GallerySection[] = [
  { id: 'typography', title: 'Typography', Component: TypographySection },
  {
    id: 'typography-extra',
    title: 'Typography flow, wrapping and overrides',
    Component: TypographyExtraSection,
  },
  { id: 'buttons', title: 'Buttons, badges and toggles', Component: ButtonsSection },
  {
    id: 'buttons-extra',
    title: 'Button matrix, group edges and interaction targets',
    Component: ButtonsExtraSection,
  },
  { id: 'forms', title: 'Form controls', Component: FormsSection },
  {
    id: 'forms-extra',
    title: 'Field states, adornments and container queries',
    Component: FormsExtraSection,
  },
  {
    id: 'forms-toggles',
    title: 'Checkbox, radio, switch and slider states',
    Component: FormsTogglesSection,
  },
  { id: 'data-display', title: 'Data display', Component: DataDisplaySection },
  {
    id: 'data-display-extra',
    title: 'Card headers, table rows, separators and aspect ratios',
    Component: DataDisplayExtraSection,
  },
  { id: 'disclosure', title: 'Disclosure and panels', Component: DisclosureSection },
  {
    id: 'disclosure-extra',
    title: 'Tab states, accordion bodies, scrollbars and panel handles',
    Component: DisclosureExtraSection,
  },
  {
    id: 'feedback',
    title: 'Progress, skeletons, spinners, empty states and alerts',
    Component: FeedbackSection,
  },
  { id: 'overlays', title: 'Overlays and portals', Component: OverlaysSection },
  {
    id: 'overlays-extra',
    title: 'Dialog shape, alert-dialog matrix and nested overlays',
    Component: OverlaysExtraSection,
  },
  { id: 'sidebar-parts', title: 'Sidebar primitives', Component: SidebarPartsSection },
  { id: 'app', title: 'Application components', Component: AppSection },
  { id: 'app-dialogs', title: 'Application dialogs', Component: AppDialogsSection },
  { id: 'canary', title: 'StyleX canary', Component: CanarySection },
  { id: 'tokens', title: 'Theme tokens and native defaults', Component: TokensSection },
  {
    id: 'overlays-sheet-drawer',
    title: 'Sheet and drawer edges, bare close and overflow',
    Component: OverlaysSheetDrawerSection,
  },
  {
    id: 'floating-extra',
    title: 'Popover, tooltip and hover-card sides, collisions and keyboard',
    Component: FloatingExtraSection,
  },
  {
    id: 'menus-extra',
    title: 'Menu items, submenus and placement',
    Component: MenusExtraSection,
  },
  {
    id: 'menubar-nav-extra',
    title: 'Menubar menus and navigation menu modes',
    Component: MenubarNavExtraSection,
  },
  {
    id: 'select-combobox-extra',
    title: 'Select triggers, popups, combobox inputs and chips',
    Component: SelectComboboxExtraSection,
  },
  {
    id: 'command-calendar-extra',
    title: 'Command palette parts and calendar day states',
    Component: CommandCalendarExtraSection,
  },
  {
    id: 'nav-bits-extra',
    title: 'Avatar sizes, breadcrumb overflow and pagination states',
    Component: NavBitsExtraSection,
  },
  {
    id: 'tools-filters-extra',
    title: 'Tool card data branches and skill-library filter states',
    Component: ToolsFiltersExtraSection,
  },
]
