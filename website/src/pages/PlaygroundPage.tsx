import { useState } from "react";
import { Button, DocsShell, Heading, Text } from "../components/ui";
import { Editor } from "../playground/editor/Editor";
import { Gallery } from "../playground/Gallery";
import { PlaygroundTabBar } from "../playground/playground-layout.arv";
import { Recipes } from "../playground/Recipes";

type Tab = "gallery" | "recipes" | "editor";

function TabButton(props: { active: boolean; onClick: () => void; children: string }) {
  const styles = Button({ tone: props.active ? "primary" : "ghost", size: "sm" });
  return (
    <button type="button" className={styles.root} onClick={props.onClick}>
      {props.children}
    </button>
  );
}

export function PlaygroundPage() {
  const [tab, setTab] = useState<Tab>("gallery");
  const tabBar = PlaygroundTabBar();

  return (
    <DocsShell>
      <header style={{ marginBottom: 32 }}>
        <h1 className={Heading({ level: "h1" }).root}>Playground</h1>
        <p className={Text({ tone: "muted", size: "lg" }).root}>
          Interactive demos, language recipes, and a live <code>.arv</code> editor — every style
          compiled at build time, zero runtime CSS.
        </p>
        <div className={tabBar.root} style={{ marginTop: 20 }}>
          <TabButton active={tab === "gallery"} onClick={() => setTab("gallery")}>
            Gallery
          </TabButton>
          <TabButton active={tab === "recipes"} onClick={() => setTab("recipes")}>
            Recipes
          </TabButton>
          <TabButton active={tab === "editor"} onClick={() => setTab("editor")}>
            Editor
          </TabButton>
        </div>
      </header>

      {tab === "gallery" ? <Gallery /> : tab === "recipes" ? <Recipes /> : <Editor />}
    </DocsShell>
  );
}
