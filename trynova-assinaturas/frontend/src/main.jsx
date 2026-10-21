import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./styles.css";

const rootElement = document.getElementById("root");

console.log("URL atual:", window.location.href);
console.log("Elemento root:", rootElement);
console.log("HTML carregado:", document.body.innerHTML);

if (!rootElement) {
    throw new Error(
        "Não encontrei #root. Verifique qual index.html está sendo carregado."
    );
}

createRoot(rootElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);
