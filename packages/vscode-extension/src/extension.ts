import { createRequire } from "node:module";
import { workspace } from "vscode";
import type { ExtensionContext } from "vscode";
import { LanguageClient, TransportKind } from "vscode-languageclient/node.js";
import type { LanguageClientOptions, ServerOptions } from "vscode-languageclient/node.js";

const require = createRequire(__filename);

let client: LanguageClient | undefined;

export async function activate(context: ExtensionContext): Promise<void> {
  const serverModule = require.resolve("@arviahq/language-server/dist/server.cjs");

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.stdio },
    debug: { module: serverModule, transport: TransportKind.stdio },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "arvia" }],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher("**/*.arv"),
    },
  };

  client = new LanguageClient("arvia", "Arvia Language Server", serverOptions, clientOptions);
  await client.start();
  context.subscriptions.push({ dispose: () => client?.stop() });
}

export function deactivate(): Promise<void> | undefined {
  return client?.stop();
}
