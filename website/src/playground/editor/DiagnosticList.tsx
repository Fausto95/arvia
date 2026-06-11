import type { Diagnostic } from "@arviahq/compiler";
import { Text } from "../../components/text.arv";

export function DiagnosticList(props: { diagnostics: Diagnostic[] }) {
  if (props.diagnostics.length === 0) {
    return (
      <p className={Text({ size: "sm", tone: "muted" }).root}>No issues — compile succeeded.</p>
    );
  }

  return (
    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {props.diagnostics.map((d, i) => (
        <li
          key={i}
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            fontSize: 13,
            fontFamily: "ui-monospace, monospace",
            background:
              d.severity === "error"
                ? "color-mix(in srgb, var(--arvia-color-danger) 12%, transparent)"
                : "color-mix(in srgb, var(--arvia-color-warning) 12%, transparent)",
            color:
              d.severity === "error" ? "var(--arvia-color-danger)" : "var(--arvia-color-warning)",
            border: `1px solid color-mix(in srgb, ${d.severity === "error" ? "var(--arvia-color-danger)" : "var(--arvia-color-warning)"} 25%, transparent)`,
          }}
        >
          <strong>{d.severity}</strong>
          {` [${d.line}:${d.col}]`}: {d.message}
        </li>
      ))}
    </ul>
  );
}
