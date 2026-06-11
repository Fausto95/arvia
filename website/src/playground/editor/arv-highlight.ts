import {
  Decoration,
  EditorView,
  MatchDecorator,
  ViewPlugin,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";

const keywordRe =
  /\b(component|recipe|theme|global|keyframes|style|base|slots|variants|defaults|compound|responsive|container|tokens|modes|use|doc)\b|@dark\b|&:(?:hover|focus-visible|active|disabled|focus)\b/g;

const tokenRefRe =
  /\b(?:color|space|radius|font|duration|easing|breakpoint|keyframes)\.[a-zA-Z0-9]+\b/g;

const hexColorRe = /#[0-9a-fA-F]{3,8}\b/g;
const stringRe = /"(?:[^"\\]|\\.)*"/g;
const commentRe = /\/\/.*$/gm;
const propertyRe = /\b[a-zA-Z-]+(?=\s*:)/g;

const keywordMark = Decoration.mark({ class: "cm-arv-keyword" });
const propertyMark = Decoration.mark({ class: "cm-arv-property" });
const tokenRefMark = Decoration.mark({ class: "cm-arv-token" });
const hexMark = Decoration.mark({ class: "cm-arv-hex" });
const stringMark = Decoration.mark({ class: "cm-arv-string" });
const commentMark = Decoration.mark({ class: "cm-arv-comment" });

const keywordDecorator = new MatchDecorator({
  regexp: keywordRe,
  decoration: keywordMark,
});

const tokenRefDecorator = new MatchDecorator({
  regexp: tokenRefRe,
  decoration: tokenRefMark,
});

const hexDecorator = new MatchDecorator({
  regexp: hexColorRe,
  decoration: hexMark,
});

const stringDecorator = new MatchDecorator({
  regexp: stringRe,
  decoration: stringMark,
});

const commentDecorator = new MatchDecorator({
  regexp: commentRe,
  decoration: commentMark,
});

const propertyDecorator = new MatchDecorator({
  regexp: propertyRe,
  decoration: propertyMark,
});

function pluginFromDecorator(decorator: MatchDecorator) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      constructor(view: EditorView) {
        this.decorations = decorator.createDeco(view);
      }
      update(update: ViewUpdate) {
        this.decorations = decorator.updateDeco(update, this.decorations);
      }
    },
    { decorations: (v) => v.decorations },
  );
}

export const arvHighlightTheme = EditorView.baseTheme({
  ".cm-arv-keyword": { color: "#cf222e" },
  ".cm-arv-token": { color: "#953800" },
  ".cm-arv-hex": { color: "#0550ae" },
  ".cm-arv-string": { color: "#0a3069" },
  ".cm-arv-comment": { color: "#6e7781", fontStyle: "italic" },
  ".cm-arv-property": { color: "#116329" },
  "&dark .cm-arv-keyword": { color: "#ff7b72" },
  "&dark .cm-arv-token": { color: "#ffa657" },
  "&dark .cm-arv-hex": { color: "#79c0ff" },
  "&dark .cm-arv-string": { color: "#a5d6ff" },
  "&dark .cm-arv-comment": { color: "#8b949e" },
  "&dark .cm-arv-property": { color: "#7ee787" },
});

export const arvHighlight = [
  arvHighlightTheme,
  pluginFromDecorator(keywordDecorator),
  pluginFromDecorator(tokenRefDecorator),
  pluginFromDecorator(hexDecorator),
  pluginFromDecorator(stringDecorator),
  pluginFromDecorator(commentDecorator),
  pluginFromDecorator(propertyDecorator),
];
