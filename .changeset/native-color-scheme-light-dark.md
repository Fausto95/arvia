---
"@arviahq/compiler": minor
---

Emit `color-scheme` + `light-dark()` for `light | dark` themes.

When a theme's modes are exactly `light | dark`, color tokens now compile to a
single `light-dark(lightValue, darkValue)` declaration on `:root` with
`color-scheme: light dark`, instead of being duplicated across `:root`,
`@media (prefers-color-scheme: dark)`, and `[data-arvia-theme]` blocks. The
theme follows the OS by default, the `data-arvia-theme` attribute just flips
`color-scheme`, and native UA widgets (scrollbars, form controls, focus rings)
follow the active scheme. Mode-varying tokens that aren't colors (e.g.
`box-shadow`) keep their per-mode override blocks, and any other mode shape
falls back to the previous four-block emission.

This changes the generated CSS for existing light/dark themes. Requires a
Baseline-2024 browser (Chrome 123+, Safari 17.5+, Firefox 120+) for
`light-dark()`.
