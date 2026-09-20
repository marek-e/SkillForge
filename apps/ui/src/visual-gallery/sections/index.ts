import type { ComponentType } from 'react'
import { AppDialogsSection } from './app-dialogs'
import { AppSection } from './app'
import { ButtonsSection } from './buttons'
import { CanarySection } from './canary'
import { DataDisplaySection } from './data-display'
import { DisclosureSection } from './disclosure'
import { FormsSection } from './forms'
import { OverlaysSection } from './overlays'
import { SidebarPartsSection } from './sidebar-parts'
import { TokensSection } from './tokens'
import { TypographySection } from './typography'

export interface GallerySection {
  id: string
  title: string
  Component: ComponentType
}

export const GALLERY_SECTIONS: GallerySection[] = [
  { id: 'typography', title: 'Typography', Component: TypographySection },
  { id: 'buttons', title: 'Buttons, badges and toggles', Component: ButtonsSection },
  { id: 'forms', title: 'Form controls', Component: FormsSection },
  { id: 'data-display', title: 'Data display', Component: DataDisplaySection },
  { id: 'disclosure', title: 'Disclosure and panels', Component: DisclosureSection },
  { id: 'overlays', title: 'Overlays and portals', Component: OverlaysSection },
  { id: 'sidebar-parts', title: 'Sidebar primitives', Component: SidebarPartsSection },
  { id: 'app', title: 'Application components', Component: AppSection },
  { id: 'app-dialogs', title: 'Application dialogs', Component: AppDialogsSection },
  { id: 'canary', title: 'StyleX canary', Component: CanarySection },
  { id: 'tokens', title: 'Theme tokens and native defaults', Component: TokensSection },
]
