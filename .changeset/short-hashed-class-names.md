---
"@arviahq/compiler": patch
"@arviahq/vite-plugin": patch
---

Production builds now emit short, identifier-safe hashed class names (e.g. `.k3j9f1a2`) instead of the long readable form. Development builds keep the readable `Component_variant_value_slot_hash` names for debugging. The Vite plugin selects the mode automatically from `command === "build"`. Hashes are derived from the file path and structure (never style content), so the CSS-only HMR and determinism guarantees are unchanged, and `.d.ts` output is unaffected.
