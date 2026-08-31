import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

document.title = "MMX Mission Map";
document
  .querySelector('meta[name="description"]')!
  .setAttribute(
    "content",
    "Interactive map to explore the sampling grid for the MMX project",
  );

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
