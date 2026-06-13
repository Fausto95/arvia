import { Playground } from "../Playground";

/**
 * An editable example: the source on the left, a live preview / compiled CSS /
 * types on the right. Used in the tutorial so every example can be tweaked in
 * place. The `source` must be a complete, self-contained `.arv` file (a theme
 * plus at least one component or style) so it compiles on its own.
 */
export function DocPlayground(props: { source: string; height?: number }) {
  return (
    <div style={{ margin: "1.5rem 0" }}>
      <Playground initialSource={props.source} height={props.height ?? 260} />
    </div>
  );
}
