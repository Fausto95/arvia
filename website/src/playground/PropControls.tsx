import type { ReactNode } from "react";
import { Button } from "../components/button.arv";
import { PropControl } from "./playground-layout.arv";

export function PropPicker<T extends string>(props: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  const control = PropControl();
  return (
    <div className={control.root}>
      <span className={control.label}>{props.label}</span>
      <div className={control.options}>
        {props.options.map((option) => {
          const styles = Button({
            tone: props.value === option ? "primary" : "ghost",
            size: "sm",
          });
          return (
            <button
              key={option}
              type="button"
              className={styles.root}
              onClick={() => props.onChange(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PropToggle(props: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const control = PropControl();
  const styles = Button({
    tone: props.checked ? "primary" : "ghost",
    size: "sm",
  });
  return (
    <div className={control.root}>
      <span className={control.label}>{props.label}</span>
      <div className={control.options}>
        <button
          type="button"
          className={styles.root}
          onClick={() => props.onChange(!props.checked)}
        >
          {props.checked ? "on" : "off"}
        </button>
      </div>
    </div>
  );
}

export function PropRow(props: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-end" }}>
      {props.children}
    </div>
  );
}
