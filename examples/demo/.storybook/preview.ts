import type { Preview } from "@storybook/react";
import { setTheme } from "../src/arvia-theme";

const preview: Preview = {
  parameters: {
    layout: "centered",
  },
  globalTypes: {
    arviaTheme: {
      description: "Arvia theme mode",
      toolbar: {
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      setTheme((context.globals.arviaTheme as string) ?? "light");
      return Story();
    },
  ],
};

export default preview;
