import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { compile, formatArv } from "../src/index.js";

const repoRoot = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function allArvFiles(): string[] {
  return execSync("find examples website/src packages/compiler/tests/fixtures -name '*.arv'", {
    cwd: repoRoot,
    encoding: "utf8",
  })
    .trim()
    .split("\n")
    .map((f) => path.join(repoRoot, f));
}

describe("formatArv", () => {
  it("normalizes a messy component", () => {
    const messy = `component   Button{
      base{color:red;
        padding:  4px   8px;
            &:hover{color:blue;}
      }
    variants{tone{primary{color:red;}
    }}
      defaults{tone:primary;}
    }`;
    expect(formatArv(messy)).toBe(`component Button {
  base {
    color: red;
    padding: 4px 8px;
    &:hover { color: blue; }
  }
  variants {
    tone {
      primary { color: red; }
    }
  }
  defaults { tone: primary; }
}
`);
  });

  it("formats theme blocks with modes, pipes and doc strings", () => {
    // Source kept `color { … }` on one line → it stays inline.
    const messy = `theme{modes:light|dark;
color{primary=#635bff   doc   "Brand";@dark{primary=#aaa;}}}`;
    expect(formatArv(messy)).toBe(`theme {
  modes: light | dark;
  color { primary = #635bff doc "Brand"; @dark { primary = #aaa; } }
}
`);

    // Multiline in source → multiline out.
    const multiline = `theme{modes:light|dark;
color{primary=#635bff   doc   "Brand";
@dark{primary=#aaa;}}}`;
    expect(formatArv(multiline)).toBe(`theme {
  modes: light | dark;
  color {
    primary = #635bff doc "Brand";
    @dark { primary = #aaa; }
  }
}
`);
  });

  it("preserves comments: own-line, trailing and inside values", () => {
    const source = `// header comment
component X {
  /* block
     comment */
  base {
    color: red; // trailing
    background: red /* inline */ ;
  }
}
`;
    const formatted = formatArv(source);
    expect(formatted).toContain("// header comment");
    expect(formatted).toContain("/* block\n     comment */");
    expect(formatted).toContain("color: red; // trailing");
    expect(formatted).toContain("background: red /* inline */;");
  });

  it("collapses repeated blank lines to one and separates top-level items", () => {
    const formatted = formatArv(`component A {}


component B {}`);
    expect(formatted).toBe("component A {}\n\ncomponent B {}\n");
  });

  it("respects source line decisions: single-line stays, multiline stays", () => {
    const single = "component X {\n  defaults { tone: primary; }\n}\n";
    expect(formatArv(single)).toBe(single);
    const multi = "component X {\n  defaults {\n    tone: primary;\n  }\n}\n";
    expect(formatArv(multi)).toBe(multi);
  });

  it("breaks single-line blocks that exceed the print width", () => {
    const long = `component X { base { padding: 1px 2px 3px 4px; margin: 1px 2px 3px 4px; border: 1px solid red; color: red; background: blue; } }`;
    const formatted = formatArv(long);
    expect(formatted.split("\n").length).toBeGreaterThan(3);
    expect(formatted).toContain("  base {");
  });

  it("returns sources with parse errors unchanged", () => {
    const broken = "component X { color red }";
    expect(formatArv(broken)).toBe(broken);
  });

  it("preserves strings verbatim (no whitespace collapse inside)", () => {
    const source = 'component X { base { content: "a   b"; } }\n';
    expect(formatArv(source)).toContain('"a   b"');
  });

  it("never alters selector or value semantics", () => {
    const source = `component X {
  base {
    font: 12px/1.5 sans-serif;
    grid-area: 1 / 2;
    & > svg { fill: red; }
    & .child { color: red; }
    &:hover, &:focus { color: blue; }
  }
}
`;
    const formatted = formatArv(source);
    expect(formatted).toContain("font: 12px/1.5 sans-serif;");
    expect(formatted).toContain("grid-area: 1 / 2;");
    expect(formatted).toContain("& > svg { fill: red; }");
    expect(formatted).toContain("& .child { color: red; }");
    expect(formatted).toContain("&:hover, &:focus { color: blue; }");
  });

  describe("properties over every .arv in the repo", () => {
    const files = allArvFiles();
    it("found repo fixtures", () => {
      expect(files.length).toBeGreaterThan(10);
    });

    it.each(files.map((f) => [path.relative(repoRoot, f)] as const))(
      "%s: idempotent and compile-equivalent",
      (rel) => {
        const source = readFileSync(path.join(repoRoot, rel), "utf8");
        const once = formatArv(source);
        // Idempotency.
        expect(formatArv(once)).toBe(once);
        // Compilation output unchanged by formatting.
        const before = compile(source, { filename: "x.arv", sharedEnvFile: true });
        const after = compile(once, { filename: "x.arv", sharedEnvFile: true });
        expect(after.css).toBe(before.css);
        expect(after.js).toBe(before.js);
        expect(after.dts).toBe(before.dts);
      },
    );
  });
});
