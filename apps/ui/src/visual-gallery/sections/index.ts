import type { ComponentType } from 'react'
import { AppDialogsSection } from './app-dialogs'
import { AppSection } from './app'
import { ButtonsExtraSection } from './buttons-extra'
import { ButtonsSection } from './buttons'
import { CanarySection } from './canary'
import { DataDisplayExtraSection } from './data-display-extra'
import { DataDisplaySection } from './data-display'
import { DisclosureSection } from './disclosure'
import { FeedbackSection } from './feedback'
import { FormsExtraSection } from './forms-extra'
import { FormsSection } from './forms'
import { FormsTogglesSection } from './forms-toggles'
import { OverlaysSection } from './overlays'
import { SidebarPartsSection } from './sidebar-parts'
import { TokensSection } from './tokens'
import { TypographyExtraSection } from './typography-extra'
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
    id: 'feedback',
    title: 'Progress, skeletons, spinners, empty states and alerts',
    Component: FeedbackSection,
  },
  { id: 'overlays', title: 'Overlays and portals', Component: OverlaysSection },
  { id: 'sidebar-parts', title: 'Sidebar primitives', Component: SidebarPartsSection },
  { id: 'app', title: 'Application components', Component: AppSection },
  { id: 'app-dialogs', title: 'Application dialogs', Component: AppDialogsSection },
  { id: 'canary', title: 'StyleX canary', Component: CanarySection },
  { id: 'tokens', title: 'Theme tokens and native defaults', Component: TokensSection },
]
