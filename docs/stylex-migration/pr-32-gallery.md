# Final migration: gallery and remaining sidebar dependencies

The test gallery's 287 literal utility class usages now use local `galleryStyles`
objects and the standard StyleX `sx` prop. Native elements receive `stylex.props`;
component overrides compose after their defaults. The conversion preserves DOM,
data attributes, fixture names, and frozen-original paths.

Typography retains unitless inherited metrics through project-owned StyleX
variables. Input and textarea overrides preserve their original medium-width font
size. Caller font-size and padding overrides preserve the original resolved
line heights and physical padding sides. Space-between-child
rules retain their logical start/end margins. Group, peer, border, and explicit
size/width markers remain only where an existing selector reads their class text.

The accompanying final conversions in `sheet`, `card`, `table`, `empty`, and
`spinner` remove their utility bridges and add `sx` overrides. Sheet transitions
retain their exact property list through a project-owned custom property, avoiding
minifier removal of the prefixed backdrop-filter name. Card image rounding and
conditional header padding, table inherited typography, empty-state foreign icons
and links, and spinner explicit sizing remain unchanged.

No existing PNG or JSON original was refreshed. Final dev/production comparisons,
source audits, and host-rendering findings are recorded by the orchestrating audit.

## Scoped verification

The gallery conversion passes TypeScript checking and independent StyleX compilation
of all 135 TSX modules. Lint passes for all 43 files owned by this migration task.
After removal of the Tailwind pipeline, all 24 scoped frozen computed-style
cases pass for sidebar geometry, data-display, and feedback components across
desktop/mobile and light/dark. The run is logged at
`/tmp/skillforge-sidebar-no-tailwind-computed.log`.

Full screenshot comparisons remain subject to the documented Darwin host change.

The first same-machine desktop gallery pass completed with 109 of 124 tests
passing. Its failures identified integration corrections in overlays, editor
selection, calendar/combobox, badges, form focus styling, and the canary's caller
padding. Both canary cases pass after correcting the physical padding overrides.
The remaining integration corrections are verified by their owning tasks.
