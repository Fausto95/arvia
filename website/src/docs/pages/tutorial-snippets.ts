// Self-contained .arv sources for the tutorial playgrounds. Each one includes a
// theme plus the component being taught, so it compiles and previews on its own.

export const TUTORIAL_THEME = `theme {
  color {
    primary = #635bff;
    text = #1a1a2e;
    muted = #6b7280;
    surface = #ffffff;
    border = #e5e7eb;
  }
  space { 1 = 4px; 2 = 8px; 3 = 12px; 4 = 16px; }
  radius { md = 10px; full = 9999px; }
  font { sm = 13px; md = 15px; lg = 18px; }
}`;

// Chapter 1 (theme): tokens drive a simple surface.
export const THEME_SOURCE = `${TUTORIAL_THEME}

component Surface {
  base {
    padding: space.4;
    background: color.surface;
    border: 1px solid color.border;
    border-radius: radius.md;
    color: color.text;
    font-size: font.md;
  }
}`;

// Chapter 2 (component + base): a Button with a base block only.
export const BUTTON_BASE_SOURCE = `${TUTORIAL_THEME}

component Button {
  base {
    display: inline-flex;
    align-items: center;
    gap: space.2;
    padding: space.2 space.4;
    border: none;
    border-radius: radius.md;
    background: color.primary;
    color: white;
    font-size: font.md;
    cursor: pointer;
  }
}`;

// Chapter 3 (variants + defaults): tone and size axes.
export const BUTTON_VARIANTS_SOURCE = `${TUTORIAL_THEME}

component Button {
  base {
    display: inline-flex;
    align-items: center;
    border: none;
    border-radius: radius.md;
    color: white;
    cursor: pointer;
  }

  variants {
    tone {
      primary { background: color.primary; }
      neutral { background: color.muted; }
    }
    size {
      sm { padding: space.1 space.3; font-size: font.sm; }
      md { padding: space.2 space.4; font-size: font.md; }
    }
  }

  defaults { tone: primary; size: md; }
}`;

// Chapter 4 (slots): a Card with named parts.
export const CARD_SLOTS_SOURCE = `${TUTORIAL_THEME}

component Card {
  slots { root {} avatar {} name {} role {} }

  base {
    display: flex;
    align-items: center;
    gap: space.4;
    padding: space.4;
    background: color.surface;
    border: 1px solid color.border;
    border-radius: radius.md;

    avatar {
      width: 48px;
      height: 48px;
      border-radius: radius.full;
      background: color.primary;
    }
    name { font-size: font.lg; color: color.text; }
    role { font-size: font.sm; color: color.muted; }
  }
}`;

// Chapter 5 (states + responsive + modes): a polished Button.
export const BUTTON_STATES_SOURCE = `theme {
  modes: light | dark;

  color {
    primary = #635bff;
    primaryHover = #5249e6;
    text = #1a1a2e;

    @dark {
      text = #e5e7eb;
    }
  }
  space { 2 = 8px; 4 = 16px; }
  radius { md = 10px; }
  font { md = 15px; lg = 18px; }
  breakpoint { md = 600px; }
}

component Button {
  base {
    padding: space.2 space.4;
    border: none;
    border-radius: radius.md;
    background: color.primary;
    color: white;
    font-size: font.md;
    cursor: pointer;

    &:hover { background: color.primaryHover; }
    &:focus-visible { outline: 2px solid color.text; outline-offset: 2px; }
  }

  variants {
    size {
      md { font-size: font.md; }
      lg { font-size: font.lg; padding: space.4; }
    }
  }

  defaults { size: md; }

  responsive {
    md { size: lg; }
  }
}`;

// Chapter 6 (compose): the finished profile Card with an actions slot.
export const PROFILE_CARD_SOURCE = `${TUTORIAL_THEME}

component Card {
  slots { root {} avatar {} name {} role {} actions {} }

  base {
    display: flex;
    align-items: center;
    gap: space.4;
    padding: space.4;
    background: color.surface;
    border: 1px solid color.border;
    border-radius: radius.md;

    avatar {
      width: 48px;
      height: 48px;
      border-radius: radius.full;
      background: color.primary;
    }
    name { font-size: font.lg; color: color.text; }
    role { font-size: font.sm; color: color.muted; }
    actions { margin-left: auto; }
  }
}`;
