export type EditorTemplate = {
  id: string;
  label: string;
  source: string;
};

export const EDITOR_TEMPLATES: EditorTemplate[] = [
  {
    id: "button",
    label: "Button",
    source: `component Button {
  base {
    display: inline-flex;
    align-items: center;
    gap: space.2;
    padding: space.2 space.4;
    border: none;
    border-radius: radius.md;
    background: color.primary;
    color: white;
    font: inherit;
    cursor: pointer;
    use FocusRing;

    &:hover {
      background: color.primaryHover;
    }
  }
}
`,
  },
  {
    id: "badge",
    label: "Badge",
    source: `component Badge {
  display: inline-flex;
  padding: space.1 space.3;
  border-radius: radius.full;
  font-size: font.sm;
  font-weight: 600;
  background: color.border;
  color: color.text;

  variants {
    tone {
      success { background: color.success; color: white; }
      danger { background: color.danger; color: white; }
    }
  }

  defaults {
    tone: success;
  }
}
`,
  },
  {
    id: "variants",
    label: "Variants",
    source: `component Pill {
  base {
    display: inline-flex;
    padding: space.1 space.3;
    border-radius: radius.full;
    font-size: font.sm;
    border: none;
    cursor: pointer;
  }

  variants {
    tone {
      primary { background: color.primary; color: white; }
      ghost {
        background: transparent;
        color: color.text;
        border: 1px solid color.border;
      }
    }
    size {
      sm { font-size: font.sm; }
      lg { font-size: font.lg; padding: space.2 space.4; }
    }
  }

  defaults {
    tone: primary;
    size: sm;
  }
}
`,
  },
  {
    id: "slots",
    label: "Slots",
    source: `component IconButton {
  base {
    display: inline-flex;
    align-items: center;
    gap: space.2;
    padding: space.2 space.4;
    border-radius: radius.md;
    background: color.primary;
    color: white;
    border: none;
    font: inherit;
    icon { flex-shrink: 0; }
  }

  slots {
    root {}
    icon {}
    label { font-weight: 500; }
  }
}
`,
  },
  {
    id: "responsive",
    label: "Responsive",
    source: `component ResponsiveButton {
  base {
    display: inline-flex;
    border: none;
    border-radius: radius.md;
    background: color.primary;
    color: white;
    font: inherit;
    cursor: pointer;
  }

  variants {
    size {
      sm { padding: space.1 space.3; font-size: font.sm; }
      lg { padding: space.3 space.5; font-size: font.lg; }
    }
  }

  defaults {
    size: sm;
  }

  responsive {
    md { size: lg; }
  }
}
`,
  },
];

export const DEFAULT_TEMPLATE = EDITOR_TEMPLATES[0]!;
