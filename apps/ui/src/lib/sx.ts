import type * as stylex from '@stylexjs/stylex'

/**
 * The type of an `sx` prop: exactly what `stylex.props` accepts.
 *
 * `stylex.StyleXStyles` is too narrow for this codebase — a style object whose
 * only declarations sit behind an attribute selector compiles to
 * `StyleXClassNameFor<'prop', unknown>` and fails to assign, and a dynamic
 * style is a tuple — so the array form is spelled out instead
 * (`docs/stylex-migration/conventions.md`).
 *
 * A component takes this prop only when a StyleX caller has to override one of
 * its own declarations; the styles are passed as the **last** argument to
 * `stylex.props` so they win.
 */
export type Sx = stylex.StyleXArray<
  | (null | undefined | stylex.CompiledStyles)
  | boolean
  | Readonly<[stylex.CompiledStyles, stylex.InlineStyles]>
>
