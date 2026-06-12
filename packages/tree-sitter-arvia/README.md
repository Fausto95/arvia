# tree-sitter-arvia

Tree-sitter grammar for the Arvia design-system language (`.arv`).

The block structure is a plain LR grammar; the two raw constructs mirror the
compiler's pull lexer through an external scanner (`src/scanner.c`):
`raw_value` runs to an unnested `;`/`}` (paren/string aware, stops before a
`doc "…"` suffix) and `raw_selector` runs to `{`. Values are opaque in v1 —
token refs inside them are not sub-tokenized.

## Develop

```bash
tree-sitter generate   # grammar.js → src/parser.c
tree-sitter test       # corpus under test/corpus/
tree-sitter parse path/to/file.arv
```

The corpus is seeded from the repo's real `.arv` files; all of
`examples/`, `website/src/` and the compiler fixtures must parse without
errors.

## Neovim

Until the parser is upstreamed to nvim-treesitter, register it locally:

```lua
vim.filetype.add({ extension = { arv = "arvia" } })

local parsers = require("nvim-treesitter.parsers").get_parser_configs()
parsers.arvia = {
  install_info = {
    url = "https://github.com/arviahq/arvia",
    location = "packages/tree-sitter-arvia",
    files = { "src/parser.c", "src/scanner.c" },
  },
  filetype = "arvia",
}
```

Copy `queries/highlights.scm` to
`~/.config/nvim/queries/arvia/highlights.scm` (or your runtimepath
equivalent), then `:TSInstall arvia`.

For the full language server (diagnostics, completion, hover, rename, …):

```lua
vim.lsp.config("arvia", {
  cmd = { "arvia-language-server" }, -- npm i -g @arviahq/language-server
  filetypes = { "arvia" },
  root_markers = { "package.json", ".git" },
})
vim.lsp.enable("arvia")
```

## Zed

See `packages/zed-extension` — it references this grammar by git
repository + revision and launches `arvia-language-server` over stdio.
