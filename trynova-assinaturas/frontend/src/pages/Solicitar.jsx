import { useState } from "react";
import { api } from "../api";
import logoImg from "../../public/imagens/logo_trynova.png";
import selo33Img from "../../public/imagens/33_anos.png";
import patternImg from "../../public/imagens/pattern.png"; 

import "../styles/Solicitar.css";

export default function Solicitar() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState(false);
  const [loading, setLoading] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setErro(false);

    try {
      const r = await api("/assinaturas/solicitar", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setMsg(r.devLink ? `${r.message} Modo DEV: ${r.devLink}` : r.message);
    } catch (e) {
      setMsg(e.message || "Não foi possível solicitar o acesso. Tente novamente.");
      setErro(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="tn-page">
      {/* Imagem do padrão de fundo repetido */}
      <div 
        className="tn-pattern-bg" 
        style={{ backgroundImage: `url(${patternImg})` }} 
        aria-hidden="true" 
      />

      {/* Curva azul mantida perfeitamente */}
      <div className="tn-blue-sweep" aria-hidden="true" />

      <header className="tn-header">
        <a className="tn-logo" href="#inicio" aria-label="Início">
          <img src={logoImg} alt="Logo Corporativa" className="tn-logo-img" />
        </a>
        <div className="tn-header-tagline">PESSOAS <b>+</b> PROCESSOS <b>+</b> RESULTADOS</div>
      </header>

      <section className="tn-card" id="inicio" aria-label="Solicitar assinatura corporativa">
        <div className="tn-card-intro">
          <div className="tn-card-logo">
            <img src={logoImg} alt="Logo Corporativa" className="tn-card-logo-img" />
          </div>
          <div className="tn-short-line" />
          <h1>Mais do que uma assinatura, <span>um legado de 33 anos.</span></h1>
          <p className="tn-intro-copy">Sua assinatura representa quem você é e tudo o que construímos juntos.</p>

          <div className="tn-anniversary">
            <img src={selo33Img} alt="33 Anos" className="tn-number-33-img" />
            <div className="tn-anniversary-divider" />
            <div className="tn-anniversary-copy">
              <span>CONECTANDO<br />PESSOAS, TECNOLOGIA<br />E RESULTADOS</span>
            </div>
          </div>
        </div>

        <div className="tn-form-panel">
          <div className="tn-mail-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>
          </div>
          <div className="tn-overline tn-form-overline">ÁREA DO COLABORADOR</div>
          <h2>Gerar minha assinatura</h2>
          <p className="tn-form-copy">Digite seu e-mail corporativo para receber o link temporário de acesso.</p>

          <form className="tn-form" onSubmit={enviar}>
            <label htmlFor="tn-email">E-MAIL CORPORATIVO</label>
            <div className="tn-input-wrap">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>
              <input
                id="tn-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@empresa.com.br"
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>
            <button type="submit" disabled={loading}>
              <span>{loading ? "Verificando..." : "Enviar link de acesso"}</span>
              {!loading && <span className="tn-arrow" aria-hidden="true">→</span>}
            </button>
          </form>

          {msg && <div className={`tn-message ${erro ? "tn-error" : ""}`} role={erro ? "alert" : "status"}>{msg}</div>}

          <div className="tn-security">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v3"/></svg>
            <span>Acesso individual e temporário.</span>
          </div>
        </div>
      </section>

      <footer className="tn-footer">
        <span className="tn-footer-rule" />
        <span>Copyrights ©Trynova LTDA. Todos os direitos reservados.</span>
      </footer>
    </main>
  );
}