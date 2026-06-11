# Arvia for VS Code

Syntax highlighting, bracket behavior and a file icon for `.arv` design system files.

## Develop

Open this repository in VS Code and press <kbd>F5</kbd> (the "Run Arvia VS Code Extension"
launch configuration starts an Extension Development Host rooted at `examples/demo`).
Open any `.arv` file to see the grammar in action.

## Features

- Highlighting for `theme`, `global`, `recipe`, `component`, `slots`, `variants`,
  `defaults`, `compound` and `use`
- Token references (`color.primary`), hex colors, numbers/units and strings
- `&:state` selector highlighting
- Line (`//`) and block (`/* */`) comment toggling, auto-closing pairs, folding
