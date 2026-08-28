import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

const city = import.meta.env.VITE_CITY || "mtl";
const titleByCity: Record<string, string> = {
  mtl: "Arbres publics de Montréal",
  qc: "Arbres publics de la ville de Québec",
};

const descriptionByCity: Record<string, string> = {
  mtl: "Explorez les arbres publics de Montréal à travers une carte interactive, découvrez les espèces, leur répartition et leur nombre.",
  qc: "Explorez les arbres publics de la ville de Québec à travers une carte interactive, découvrez les espèces, leur répartition et leur nombre.",
};

document.title = titleByCity[city] || "Arbres publics";
document
  .querySelector('meta[name="description"]')!
  .setAttribute("content", descriptionByCity[city] || "");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
