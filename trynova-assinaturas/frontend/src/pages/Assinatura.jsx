
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import html2canvas from "html2canvas";

import { api } from "../api";

// Converte o nome em um formato adequado para o nome do arquivo.
const slug = (s) =>
    s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .toLowerCase();

export default function Assinatura() {
    const { token } = useParams();

    const [c, setC] = useState(null);
    const [erro, setErro] = useState("");

    const ref = useRef();

    // Busca os dados do colaborador usando o token da URL.
    useEffect(() => {
        api(`/assinaturas/${token}`)
            .then(setC)
            .catch((e) => setErro(e.message));
    }, [token]);

    // Gera e baixa a assinatura como imagem PNG.
    async function baixar() {
        const canvas = await html2canvas(ref.current, {
            scale: 3,
            backgroundColor: "#f7f7f7",
            useCORS: true,
        });

        const a = document.createElement("a");

        a.download = `assinatura_${slug(c.nome)}.png`;
        a.href = canvas.toDataURL("image/png");

        a.click();
    }

    // Exibe uma mensagem caso ocorra um erro.
    if (erro) {
        return (
            <main>
                <section className="card error">
                    {erro}
                </section>
            </main>
        );
    }

    // Exibe o carregamento enquanto os dados não chegam.
    if (!c) {
        return (
            <main>
                <section className="card small">
                    Carregando...
                </section>
            </main>
        );
    }

    return (
        <main>
            <section className="card">
                <h1>Sua assinatura corporativa</h1>

                <p>
                    Confira os dados e baixe a imagem em PNG.
                </p>

                <div className="preview">
                    <div className="signature" ref={ref}>
                        {/* Logo da Trynova */}
                        <div className="logo">
                            <img
                                src="/imagens/logo_trynova.svg"
                                alt="Logo Trynova"
                            />
                        </div>

                        {/* Informações do colaborador */}
                        <div className="info">
                            <h2>{c.nome}</h2>

                            <div>{c.cargo}</div>

                            <strong>{c.area}</strong>

                            <p>
                                <b>E-mail</b>
                                <br />
                                {c.email}
                                <br />

                                <b>Telefone</b>
                                <br />
                                {c.telefone}

                                {c.ramal && ` | Ramal ${c.ramal}`}

                                {c.celular && (
                                    <>
                                        <br />
                                        {c.celular}
                                    </>
                                )}
                            </p>
                        </div>

                        <div className="brand">
                            <img
                                src="/imagens/33_anos.svg"
                                alt="33 anos"
                            />

                            <b>Trynova Consultoria Imobiliária</b>

                            <span>www.trynova.com.br</span>
                        </div>
                    </div>
                </div>

                <button onClick={baixar}>
                    Baixar assinatura em PNG
                </button>
            </section>
        </main>
    );
}
