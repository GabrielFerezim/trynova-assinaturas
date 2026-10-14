
import { useState } from "react";
import { api } from "../api";

export default function Solicitar() {
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    async function enviar(e) {
        e.preventDefault();
        setLoading(true);
        setMsg("");

        try {
            const r = await api("/assinaturas/solicitar", {
                method: "POST",
                body: JSON.stringify({ email }),
            });

            setMsg(
                r.devLink
                    ? `${r.message} Modo DEV: ${r.devLink}`
                    : r.message
            );
        } catch (e) {
            setMsg(e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <section className="card small">
                <h1>Gerar minha assinatura</h1>

                <p>
                    Digite seu e-mail corporativo para receber o link temporário.
                </p>

                <form onSubmit={enviar}>
                    <label htmlFor="email">E-mail corporativo</label>

                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nome@trynova.com.br"
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Verificando..." : "Enviar link de acesso"}
                    </button>
                </form>

                {msg && (
                    <div className="message">
                        {msg}
                    </div>
                )}
            </section>
        </main>
    );
}
