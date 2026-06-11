import { Button, type ButtonProps } from "./button.arv";

const tone: NonNullable<ButtonProps["tone"]> = "danger";
const styles = Button({ tone });

// Slot results are strings.
styles.root.toUpperCase();
styles.label.toUpperCase();

export {};
