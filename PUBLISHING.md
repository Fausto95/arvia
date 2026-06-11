# Publishing `@arviahq` packages

Manual steps required before the first release (cannot be automated in CI setup alone).

## 1. Create the npm organization

1. Sign in at [npmjs.com](https://www.npmjs.com/).
2. Create org **`arviahq`**: [npmjs.com/org/create](https://www.npmjs.com/org/create).
3. Confirm these package names are available under `@arviahq/`:
   - `compiler`, `vite-plugin`, `typescript-plugin`, `language-server`, `docs`, `storybook`, `vite-plugin-react`

## 2. GitHub secrets

Add repository secrets (Settings → Secrets and variables → Actions):

| Secret      | Purpose                                            |
| ----------- | -------------------------------------------------- |
| `NPM_TOKEN` | Automation token with publish access to `@arviahq` |
| `VSCE_PAT`  | Visual Studio Marketplace publish token            |
| `OVSX_PAT`  | (Optional) Open VSX publish token                  |

## 3. Visual Studio Marketplace publisher

1. Create publisher **`arviahq`** at [marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage).
2. Publish extension id: **`arviahq.arvia`**.

## 4. Release workflow

```bash
pnpm changeset          # describe changes
# merge Version Packages PR (or pnpm version)
git push && pnpm release   # build + npm publish (via CI on main)
```

Extension publish runs after npm packages are live:

```bash
node scripts/prepare-extension-publish.mjs
cd packages/vscode-extension && pnpm install --prod
pnpm package:release   # full dependency tree from npm
pnpm publish:marketplace
```

For a local `.vsix` from the monorepo (workspace-linked deps), use `pnpm package` (`--no-dependencies`).
