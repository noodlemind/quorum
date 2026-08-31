import { createRoot } from "react-dom/client";

import "@quorum/ui/styles.css";
import "./styles.css";

import { App } from "./app";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

createRoot(root).render(<App />);
