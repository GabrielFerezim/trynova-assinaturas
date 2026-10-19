
import { Routes, Route, Navigate } from "react-router-dom";

import Solicitar from "./pages/Solicitar";
import Assinatura from "./pages/Assinatura";
import Admin from "./pages/Admin";

export default function App() {
    return (
        <Routes>
            <Route
                path="/"
                element={<Solicitar />}
            />

            <Route
                path="/assinatura/:token"
                element={<Assinatura />}
            />

            <Route
                path="/admin"
                element={<Admin />}
            />

            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />
        </Routes>
    );
}
