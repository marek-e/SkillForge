# Final removal: overlays and composed controls

Removed the remaining Tailwind styling classes and `cn` calls from dialogs,
alert dialogs, floating overlays, dropdown/context menus, menubar, navigation
menu, select, combobox, breadcrumbs, tabs, accordion, command, calendar and
pagination. Removed the unused navigation-menu and tabs `cva` helpers. Added
`sx` composition to the styled exports and to carousel and scroll-area controls
where their gallery callers needed overrides.

Inherited small-text line heights use the exact unitless values in
`typography.smLineHeight` and `typography.xsLineHeight`. The declarations remain
custom-property values so the CSS optimizer cannot round the ratios. Icon and
descendant rules now belong to StyleX. Existing group markers remain selector
hooks; the `size-explicit` and `w-explicit` markers preserve the former literal
class-name tests without generating any utility CSS.

Calendar navigation buttons compose `getButtonStyles` with their own cell size
and padding overrides. The calendar declares its own cell variables with literal
values. Modifier classes from react-day-picker still identify day states, and
the equivalent radius, muted-text, focused-day and range-edge rules belong to
StyleX. Command dialogs preserve both centering axes explicitly. Command's
radius and pagination's leading/trailing padding compose last to preserve their
former forced overrides.

The frozen reference remains `ee0f797`, Playwright 1.63.0 and Chromium
153.0.8010.12, build v1243. Existing originals were not edited. The new shell
originals and row 20 checks are documented in `pr-20.md`.

Validation during integration:

- UI production build passed with the remaining component bridges removed.
- Targeted lint passed on all 24 files touched by this agent, with zero warnings
  or errors.
- Twelve desktop computed-style cases cover dialogs, floating overlays, dropdown
  and context menus against their immutable JSON references. Eleven passed on
  the first run; a development-server reload interrupted the remaining case,
  which passed when rerun separately.
- The parent migration owns the full development/production comparison, build
  packaging, original-inventory audit and native Electron checks.

No new product behavior or visual redesign belongs to these changes.

## Integration findings

- A child-only declaration in an `sx` object still replaces the component's
  whole property. Calendar day buttons must retain their own 14px font size
  beside the child span size; combobox trigger overrides must retain their
  own flex display. Input-group child padding now compiles separately so a
  command's addon override cannot erase the input's six-pixel padding.
- `data-pressed` is a boolean presence selector, not one of the custom
  state/value alternatives. Its background rule must beat the expanded-state
  button background.
- Selected calendar cells at a row boundary round the nested range-middle
  button. The child-state condition must have the same priority as the
  button's own selected-state radius. Nested condition order also matters:
  the emitted descendant selector ends with the outer attribute condition.
- A destructive context-menu icon keeps its destructive color during focus.
  The default focus color therefore excludes destructive rows.

## Animation fixture audit

The same-machine comparison found two capture races, reproduced or checked
against the untouched original app. No committed original image or comparison
tolerance changed.

The navigation viewport can attach before Radix mounts its content. The original
committed zero-millisecond frame contains the links; the first temporary capture
had an empty viewport. The fixture now waits for the content to attach before
seeking animations. Original and migrated apps each passed all four navigation
tests and twelve frames after this change. Only the temporary desktop light
zero-millisecond reference changed; the other eleven files were byte-identical.

A blocking modal also interrupts its trigger's hover transition. The temporary
mobile dark alert-dialog reference captured the hovered background at pixel
`150,180`, RGB `82,36,37`. Both the committed original and fresh captures from
the original and migrated apps have RGB `59,28,29` there. For dialog and alert-dialog cases, the fixture parks the pointer away and
finishes only the covered trigger's incidental `CSSTransition` instances before
seeking the overlay animation. Sheets retain their trigger transitions because
their expanded-state background is part of the timed capture. Overlay keyframes and the 0/100/200ms timestamps stay
unchanged.

The original app ran in `/tmp/skillforge-frozen-baseline`, with exact legacy
styling packages isolated in `/tmp/skillforge-old-deps`. Its navigation source
SHA256 is `6a5710d0c8b87477457d8b19365da4fc5c706465ac9624409bf5b08953f573d6`;
its original stylesheet SHA256 is
`e64cc0ac2dc96687c745b075fed682b1f1f82521c3ce5fe59a117f686cf01a11`.
Both equal the files at `ee0f797`. Corrected temporary references came only from
this original app. Their previous versions remain under
`/tmp/skillforge-nav-reference-backup` and `/tmp/skillforge-alert-reference-backup`.

The alert audit changed only the temporary mobile dark 0ms and 100ms references;
its 200ms reference was byte-identical. The final migrated run passed all sixteen
dialog, alert-dialog, sheet and navigation tests, forty-eight frames across both
themes and viewport projects. The desktop overlay and animation sweep passed
269 cases initially, with four desktop-only skips; four corrected styling cases
passed on the scoped rerun. Its remaining navigation failure was the temporary
fixture race audited above.
