import "./theme.arv";
import { Button } from "./button.arv";

const styles = Button({ tone: "danger" });
document.querySelector("#app")!.innerHTML = `<button class="${styles.root}">Delete</button>`;
