import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import html2canvas from "html2canvas";

import { api } from "../api";
const logoImg = "/imagens/logo_trynova.png";
const selo33Img = "/imagens/33_anos.png";
const patternImg = "/imagens/pattern.png";

import "../styles/Assinatura.css";

const slug = (s) =>
  s
    ? s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .toLowerCase()
    : "colaborador";

export default function Assinatura() {
  const { token } = useParams();

  const [c, setC] = useState(null);
  const [erro, setErro] = useState("");
  const [loadingDownload, setLoadingDownload] = useState(false);

  // Estado para controlar o Guia Interativo
  const [showTutorial, setShowTutorial] = useState(false);
  const [step, setStep] = useState(1);

  const ref = useRef();

  useEffect(() => {
    api(`/assinaturas/${token}`)
      .then(setC)
      .catch((e) => setErro(e.message || "Erro ao carregar dados."));
  }, [token]);

  async function baixar() {
    setLoadingDownload(true);
    try {
      const canvas = await html2canvas(ref.current, {
        scale: 2,
        backgroundColor: "#f7f7f7",
        useCORS: true,
        width: 600,
        height: 200,
      });

      const a = document.createElement("a");
      a.download = `assinatura_${slug(c?.nome)}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    } catch (e) {
      alert("Não foi possível gerar a imagem da assinatura. Tente novamente.");
    } finally {
      setLoadingDownload(false);
    }
  }

  if (erro) {
    return (
      <main className="tn-page">
        <div className="tn-pattern-bg" style={{ backgroundImage: `url(${patternImg})` }} aria-hidden="true" />
        <div className="tn-blue-sweep" aria-hidden="true" />
        <header className="tn-header">
          <a className="tn-logo" href="#inicio"><img src={logoImg} alt="Logo" className="tn-logo-img" /></a>
        </header>
        <section className="tn-card tn-card-center">
          <div className="tn-message tn-error">{erro}</div>
        </section>
      </main>
    );
  }

  if (!c) {
    return (
      <main className="tn-page">
        <div className="tn-pattern-bg" style={{ backgroundImage: `url(${patternImg})` }} aria-hidden="true" />
        <div className="tn-blue-sweep" aria-hidden="true" />
        <header className="tn-header">
          <a className="tn-logo" href="#inicio"><img src={logoImg} alt="Logo" className="tn-logo-img" /></a>
        </header>
        <section className="tn-card tn-card-center">
          <div className="tn-loading-spinner">Carregando sua assinatura...</div>
        </section>
      </main>
    );
  }

  return (
    <main className="tn-page">
      <div className="tn-pattern-bg" style={{ backgroundImage: `url(${patternImg})` }} aria-hidden="true" />
      <div className="tn-blue-sweep" aria-hidden="true" />

      <header className="tn-header">
        <a className="tn-logo" href="#inicio">
          <img src={logoImg} alt="Logo Corporativa" className="tn-logo-img" />
        </a>
        <div className="tn-header-tagline">
          PESSOAS <b>+</b> PROCESSOS <b>+</b> RESULTADOS
        </div>
      </header>

      <section className="tn-card tn-card-preview-page" id="inicio">
        <div className="tn-card-header">
          <div className="tn-overline">SUA ASSINATURA CORPORATIVA</div>
          <h1>Pronta para <span>utilização.</span></h1>
          <p className="tn-intro-copy">
            Confira abaixo os seus dados atualizados, baixe a imagem e veja o guia de instalação no Outlook.
          </p>
        </div>

        {/* Pré-visualização da Assinatura */}
        <div className="tn-signature-container">
          <div className="tn-signature-box" ref={ref}>
            <div className="tn-sig-logo">
              <img src={logoImg} alt="Logo Trynova" />
            </div>

            <div className="tn-sig-name">{c.nome}</div>
            <div className="tn-sig-cargo">{c.cargo}</div>
            <div className="tn-sig-area">{c.area}</div>

            <div className="tn-sig-email-label">E-mail</div>
            <div className="tn-sig-email-val">{c.email}</div>

            <div className="tn-sig-tel-label">Telefone</div>
            <div className="tn-sig-tel-val">
              {c.telefone}
              {c.ramal ? ` | Ramal ${c.ramal}` : ""}
              {c.celular ? ` | ${c.celular}` : ""}
            </div>

            <img src={selo33Img} alt="33 anos" className="tn-sig-33-img" />
            <div className="tn-sig-company">Trynova Consultoria Imobiliária</div>
            <div className="tn-sig-site">www.trynova.com.br</div>
          </div>
        </div>

        {/* Grupo de Botões Ação + Guia */}
        <div className="tn-actions">
          <button className="tn-btn-secondary" onClick={() => { setShowTutorial(true); setStep(1); }}>
            <span>Como colocar no Outlook?</span>
          </button>

          <button className="tn-btn-primary" onClick={baixar} disabled={loadingDownload}>
            <span>{loadingDownload ? "Gerando..." : "Baixar assinatura em PNG"}</span>
            {!loadingDownload && <span className="tn-arrow">↓</span>}
          </button>
        </div>
      </section>

      {/* Modal / Carrossel Interativo do Tutorial */}
      {showTutorial && (
        <div className="tn-modal-overlay" onClick={() => setShowTutorial(false)}>
          <div className="tn-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="tn-modal-close" onClick={() => setShowTutorial(false)}>&#10005;</button>

            <div className="tn-modal-header">
              <div className="tn-overline">TUTORIAL RÁPIDO</div>
              <h2>Como configurar no <span>Outlook</span></h2>
            </div>

            {/* Passos Animados */}
            <div className="tn-stepper-indicators">
              <div className={`tn-step-dot ${step === 1 ? "active" : step > 1 ? "completed" : ""}`}>1</div>
              <div className="tn-step-line" />
              <div className={`tn-step-dot ${step === 2 ? "active" : step > 2 ? "completed" : ""}`}>2</div>
              <div className="tn-step-line" />
              <div className={`tn-step-dot ${step === 3 ? "active" : ""}`}>3</div>
            </div>

            <div className="tn-step-body">
              {step === 1 && (
                <div className="tn-step-content fade-in">
                  <div className="tn-step-badge">Passo 01</div>
                  <h3>Baixe a Imagem</h3>
                  <p>Clique no botão azul <b>"Baixar assinatura em PNG"</b> para salvar o arquivo no seu computador.</p>
                  <div className="tn-step-illustration">Arquivo salvo na pasta Downloads</div>
                </div>
              )}

              {step === 2 && (
                <div className="tn-step-content fade-in">
                  <div className="tn-step-badge">Passo 02</div>
                  <h3>Acesse as Configurações do Outlook</h3>
                  <p>No Outlook, vá em <b>Arquivo &gt; Opções &gt; Email &gt; Assinaturas</b> (ou no ícone de engrenagem na versão Web).</p>
                  <div className="tn-step-illustration">Configuracoes &gt; Assinatura de E-mail</div>
                </div>
              )}

              {step === 3 && (
                <div className="tn-step-content fade-in">
                  <div className="tn-step-badge">Passo 03</div>
                  <h3>Insira e Salve</h3>
                  <p>Crie uma nova assinatura, clique no icone de <b>Inserir Imagem</b>, selecione o PNG baixado e salve!</p>
                  <div className="tn-step-illustration">Pronto! Sua assinatura corporativa esta ativa.</div>
                </div>
              )}
            </div>

            {/* Controles do Stepper */}
            <div className="tn-modal-footer">
              {step > 1 ? (
                <button className="tn-btn-step-prev" onClick={() => setStep(step - 1)}>
                  Anterior
                </button>
              ) : <div />}

              {step < 3 ? (
                <button className="tn-btn-primary" onClick={() => setStep(step + 1)}>
                  Próximo Passo →
                </button>
              ) : (
                <button className="tn-btn-primary tn-btn-success" onClick={() => setShowTutorial(false)}>
                  Entendi! Fechar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="tn-footer">
        <span className="tn-footer-rule" />
        <span className="tn-footer-text" >Copyrights ©Trynova LTDA. Todos os direitos reservados.</span>
      </footer>
    </main>
  );
}