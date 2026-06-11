import { describe, expect, it } from "vitest";
import { compile } from "../src/index.js";

const SOURCE = `
component Button {
  base { color: red; }
  variants {
    tone {
      danger { background: crimson; }
    }
  }
}
`;

describe("determinism", () => {
  it("compiles to byte-identical output across runs", () => {
    const a = compile(SOURCE, { filename: "src/button.arv", root: "/proj" });
    const b = compile(SOURCE, { filename: "src/button.arv", root: "/proj" });
    expect(a.css).toBe(b.css);
    expect(a.js).toBe(b.js);
    expect(a.dts).toBe(b.dts);
  });

  it("keeps js and dts byte-identical across pure style edits (HMR guarantee)", () => {
    const edited = SOURCE.replace("color: red;", "color: blue;").replace(
      "background: crimson;",
      "background: tomato;",
    );
    const a = compile(SOURCE, { filename: "src/button.arv" });
    const b = compile(edited, { filename: "src/button.arv" });
    expect(a.js).toBe(b.js);
    expect(a.dts).toBe(b.dts);
    expect(a.css).not.toBe(b.css);
  });

  it("hashes from the root-relative path, not the absolute path", () => {
    const a = compile(SOURCE, {
      filename: "/home/alice/proj/src/button.arv",
      root: "/home/alice/proj",
    });
    const b = compile(SOURCE, {
      filename: "C:\\Users\\bob\\proj\\src\\button.arv",
      root: "C:\\Users\\bob\\proj",
    });
    expect(a.js).toBe(b.js);
  });
});
