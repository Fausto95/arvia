import { Button } from "./button.arv";

// Invalid variant value: must fail typechecking.
Button({ tone: "warning" });

export {};
