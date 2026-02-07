# UI Components

SkillForge uses a component library built on shadcn/ui (Radix Nova style) with Tailwind CSS. All components are located in `apps/ui/src/components/`.

## Component Structure

- **`ui/`** — Base UI components (shadcn/ui primitives)
- **`typography/`** — Typography elements
- **Custom components** — Application-specific components (AgentList, SkillList, etc.)

## Typography Components

Located in `components/typography/`. All typography components support variant props and can be customized with className.

### Headings

- **`H1`** — Main page heading (text-4xl lg:text-5xl, font-extrabold)
- **`H2`** — Section heading (text-3xl, font-semibold, with bottom border)
- **`H3`** — Subsection heading (text-2xl, font-semibold)
- **`H4`** — Minor heading (text-xl, font-semibold)
- **`H5`** — Small heading (text-lg, font-semibold)
- **`H6`** — Smallest heading (text-base, font-semibold)

### Text Elements

- **`P`** — Paragraph (leading-7, with spacing)
- **`Lead`** — Lead text (text-xl, muted foreground)
- **`Large`** — Large text (text-lg, font-semibold)
- **`Small`** — Small text (text-sm, font-medium)
- **`Muted`** — Muted text (text-sm, muted foreground)

### Special Elements

- **`Blockquote`** — Blockquote (border-l-2, italic, with padding)
- **`Code`** — Inline or block code
  - `variant="default"` — Inline code (rounded bg-muted)
  - `variant="block"` — Block code (full width, border, padding)

### Usage

```tsx
import { H1, H2, P, Code, Blockquote } from "@/components/typography"

<H1>Main Title</H1>
<H2>Section Title</H2>
<P>Regular paragraph text.</P>
<Code>inline code</Code>
<Code variant="block">block code</Code>
<Blockquote>Quote text</Blockquote>
```

## UI Components (`components/ui/`)

### Form & Input

- **`Button`** — Button with multiple variants (default, outline, secondary, ghost, destructive, link) and sizes
- **`Input`** — Text input field
- **`Textarea`** — Multi-line text input
- **`Label`** — Form label
- **`Checkbox`** — Checkbox input
- **`RadioGroup`** — Radio button group
- **`Switch`** — Toggle switch
- **`Slider`** — Range slider
- **`Select`** — Dropdown select
- **`Combobox`** — Searchable combobox
- **`Field`** — Form field wrapper with label and error handling
- **`InputGroup`** — Input with addon elements
- **`ButtonGroup`** — Grouped buttons

### Feedback & Overlays

- **`Dialog`** — Modal dialog
- **`AlertDialog`** — Confirmation dialog
- **`Sheet`** — Side sheet/drawer
- **`Drawer`** — Bottom drawer
- **`Popover`** — Popover tooltip
- **`Tooltip`** — Tooltip
- **`HoverCard`** — Hover card
- **`Alert`** — Alert banner
- **`Empty`** — Empty state component
- **`Skeleton`** — Loading skeleton
- **`Spinner`** — Loading spinner
- **`Progress`** — Progress bar
- **`Sonner`** — Toast notifications

### Navigation

- **`Sidebar`** — Collapsible sidebar
- **`NavigationMenu`** — Navigation menu
- **`Menubar`** — Menu bar
- **`Breadcrumb`** — Breadcrumb navigation
- **`Tabs`** — Tab navigation
- **`Pagination`** — Pagination controls
- **`Command`** — Command palette

### Data Display

- **`Table`** — Data table
- **`Card`** — Card container
- **`Badge`** — Badge/tag
- **`Avatar`** — User avatar
- **`Calendar`** — Calendar picker
- **`Carousel`** — Image/content carousel
- **`AspectRatio`** — Aspect ratio container

### Layout & Structure

- **`Separator`** — Horizontal/vertical divider
- **`Accordion`** — Collapsible accordion
- **`Collapsible`** — Collapsible content
- **`Resizable`** — Resizable panels
- **`ScrollArea`** — Custom scroll area
- **`ContextMenu`** — Right-click context menu
- **`DropdownMenu`** — Dropdown menu

## Component Patterns

All components follow these patterns:

1. **Variants** — Use `class-variance-authority` (cva) for variant styling
2. **ForwardRef** — All components use `React.forwardRef` for ref forwarding
3. **TypeScript** — Full TypeScript support with exported prop types
4. **Composition** — Components can be composed and extended
5. **Accessibility** — Built on Radix UI primitives for accessibility

## Import Paths

Components can be imported using the `@/components` alias:

```tsx
import { Button } from '@/components/ui/button'
import { H1, P } from '@/components/typography'
```

## Styling

Components use Tailwind CSS with CSS variables for theming. The theme is defined in `src/index.css` and supports light/dark modes.
