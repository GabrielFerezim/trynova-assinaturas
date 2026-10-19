import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

import "../styles/Solicitar.css";

const logoImg = "/imagens/logo_trynova.png";
const selo33Img = "/imagens/33_anos.png";
const patternImg = "/imagens/pattern.png";

const ADMIN_EMAILS = [
  "gabriel.ferezin@trynova.com.br",
  "mateus.martins@trynova.com.br",
  "emilia.peres@trynova.com.br"
];

export default function Solicitar() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados do Modal de Login Admin
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminSenha, setAdminSenha] = useState("");
  const [adminErro, setAdminErro] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

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
      setMsg(r.message);
    } catch (e) {
      setMsg(e.message || "Nao foi possivel solicitar o acesso. Tente novamente.");
      setErro(true);
    } finally {
      setLoading(false);
    }
  }

  // Autenticacao real do Administrador com email + senha
  async function autenticarAdmin(e) {
    e.preventDefault();
    setAdminLoading(true);
    setAdminErro("");

    const emailNorm = adminEmail.trim().toLowerCase();

    if (!emailNorm) {
      setAdminErro("Por favor, informe seu e-mail corporativo.");
      setAdminLoading(false);
      return;
    }

    if (!ADMIN_EMAILS.includes(emailNorm)) {
      setAdminErro("Acesso nao autorizado. Apenas administradores credenciados podem acessar este painel.");
      setAdminLoading(false);
      return;
    }

    if (!adminSenha.trim()) {
      setAdminErro("Por favor, informe a senha corporativa.");
      setAdminLoading(false);
      return;
    }

    try {
      const res = await api("/admin/auth", {
        method: "POST",
        body: JSON.stringify({ email: emailNorm, senha: adminSenha.trim() }),
      });

      sessionStorage.setItem("trynova_admin_user", JSON.stringify(res));
      setShowAdminModal(false);
      navigate("/admin");
    } catch (e) {
      setAdminErro(e.message || "Erro na autenticacao. Verifique suas credenciais.");
    } finally {
      setAdminLoading(false);
    }
  }

  return (
    <main className="tn-page">
      {/* Imagem do padrao de fundo repetido */}
      <div
        className="tn-pattern-bg"
        style={{ backgroundImage: `url(${patternImg})` }}
        aria-hidden="true"
      />

      {/* Curva azul corporativa */}
      <div className="tn-blue-sweep" aria-hidden="true" />

      <header className="tn-header">
        <a className="tn-logo" href="#inicio" aria-label="Inicio">
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
          <p className="tn-intro-copy">Sua assinatura representa quem voce e e tudo o que construimos juntos.</p>

          <div className="tn-anniversary">
            <img src={selo33Img} alt="33 Anos" className="tn-number-33-img" />
            <div className="tn-anniversary-divider" />
            <div className="tn-anniversary-copy">
              <span>CONECTANDO<br />PESSOAS, PROCESSOS<br />E RESULTADOS</span>
            </div>
          </div>
        </div>

        <div className="tn-form-panel">
          <div className="tn-mail-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>
          </div>
          <div className="tn-overline tn-form-overline">AREA DO COLABORADOR</div>
          <h2>Gerar minha assinatura</h2>
          <p className="tn-form-copy">Digite seu e-mail corporativo para receber o link temporario de acesso.</p>

          <form className="tn-form" onSubmit={enviar}>
            <label htmlFor="tn-email">E-MAIL CORPORATIVO</label>
            <div className="tn-input-wrap">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>
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
              {!loading && <span className="tn-arrow" aria-hidden="true">&rarr;</span>}
            </button>
          </form>

          {msg && <div className={`tn-message ${erro ? "tn-error" : ""}`} role={erro ? "alert" : "status"}>{msg}</div>}

          {/* Linha de seguranca com o link discreto do Painel Admin na mesma linha */}
          <div className="tn-security-row">
            <div className="tn-security">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><path d="M12 14v3" /></svg>
              <span>Acesso individual e temporario.</span>
            </div>
            <button
              type="button"
              className="tn-admin-trigger-link"
              onClick={() => {
                setShowAdminModal(true);
                setAdminEmail("");
                setAdminSenha("");
                setAdminErro("");
              }}
            >
              Painel Admin
            </button>
          </div>
        </div>
      </section>

      {/* Modal de Autenticacao Admin com email + senha */}
      {showAdminModal && (
        <div className="tn-modal-overlay" onClick={() => setShowAdminModal(false)}>
          <div className="tn-modal-content tn-admin-login-card" onClick={(e) => e.stopPropagation()}>
            <button className="tn-modal-close" onClick={() => setShowAdminModal(false)} aria-label="Fechar">&#10005;</button>

            <div className="tn-admin-login-header">
              <div className="tn-entra-badge">
                <svg className="tn-ms-logo" viewBox="0 0 21 21">
                  <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                </svg>
                <span>Microsoft Entra ID</span>
              </div>
              <h2>Acesso <span>Administrativo</span></h2>
              <p className="tn-admin-login-sub">Gestao centralizada de assinaturas corporativas Trynova.</p>
            </div>

            {adminErro && (
              <div className="tn-message tn-error" style={{ marginBottom: "18px" }}>
                {adminErro}
              </div>
            )}

            <form onSubmit={autenticarAdmin} className="tn-admin-login-form">
              <div className="tn-admin-login-field">
                <label htmlFor="admin-email-input">E-mail corporativo</label>
                <div className="tn-input-wrap" style={{ marginBottom: "14px" }}>
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>
                  <input
                    id="admin-email-input"
                    type="email"
                    placeholder="seu.email@trynova.com.br"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    disabled={adminLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="tn-admin-login-field">
                <label htmlFor="admin-senha-input">Senha corporativa</label>
                <div className="tn-input-wrap" style={{ marginBottom: "14px" }}>
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><path d="M12 14v3" /></svg>
                  <input
                    id="admin-senha-input"
                    type="password"
                    placeholder="Digite sua senha"
                    value={adminSenha}
                    onChange={(e) => setAdminSenha(e.target.value)}
                    required
                    disabled={adminLoading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="tn-btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                disabled={adminLoading}
              >
                <span>{adminLoading ? "Autenticando..." : "Entrar"}</span>
                {!adminLoading && <span className="tn-arrow" aria-hidden="true">&rarr;</span>}
              </button>
            </form>

            <div className="tn-admin-notice">
              Somente usuarios autorizados do dominio <b>@trynova.com.br</b> possuem permissao de acesso a este modulo.
            </div>
          </div>
        </div>
      )}

      <footer className="tn-footer">
        <span className="tn-footer-rule" />
        <span className="tn-footer-text">Copyrights &copy;Trynova LTDA. Todos os direitos reservados.</span>
      </footer>
    </main>
  );
}