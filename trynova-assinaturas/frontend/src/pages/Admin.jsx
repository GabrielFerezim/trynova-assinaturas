import { useEffect, useRef, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { api } from "../api";

import "../styles/Admin.css";
import "../styles/Assinatura.css";

const logoImg = "/imagens/logo_trynova.png";
const selo33Img = "/imagens/33_anos.png";
const patternImg = "/imagens/pattern.png";

const ADMIN_EMAILS = [
    "gabriel.ferezin@trynova.com.br",
    "mateus.martins@trynova.com.br",
    "emilia.peres@trynova.com.br"
];

const slug = (s) =>
    s
        ? s
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9]+/g, "_")
            .toLowerCase()
        : "colaborador";

export default function Admin() {
    const navigate = useNavigate();

    const [adminUser, setAdminUser] = useState(null);
    const [colaboradores, setColaboradores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [formData, setFormData] = useState({
        nome: "",
        cargo: "",
        area: "",
        email: "",
        telefone: "",
        ramal: "",
        celular: "",
    });

    const [search, setSearch] = useState("");
    const [areaFilter, setAreaFilter] = useState("TODAS");
    const [saving, setSaving] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [toast, setToast] = useState(null);
    const [showNewModal, setShowNewModal] = useState(false);
    const [newColab, setNewColab] = useState({
        nome: "",
        cargo: "",
        area: "",
        email: "",
        telefone: "+55 11 4656-5300",
        ramal: "",
        celular: "",
    });

    const signatureRef = useRef(null);

    // Validacao de autenticacao de administrador
    useEffect(() => {
        try {
            const stored = sessionStorage.getItem("trynova_admin_user");
            if (!stored) {
                navigate("/", { replace: true });
                return;
            }
            const user = JSON.parse(stored);
            if (!user?.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
                sessionStorage.removeItem("trynova_admin_user");
                navigate("/", { replace: true });
                return;
            }
            if (!user?.token) {
                sessionStorage.removeItem("trynova_admin_user");
                navigate("/", { replace: true });
                return;
            }
            setAdminUser(user);
        } catch {
            navigate("/", { replace: true });
            return;
        }

        carregarColaboradores();
    }, []);

    function handleLogout() {
        // Envia logout para invalidar o token no backend
        api("/admin/logout", { method: "POST" }).catch(() => {});
        sessionStorage.removeItem("trynova_admin_user");
        navigate("/");
    }

    async function carregarColaboradores() {
        setLoading(true);
        try {
            const data = await api("/admin/colaboradores");
            setColaboradores(data);
            if (data.length > 0 && !selectedId) {
                selecionar(data[0]);
            }
        } catch (e) {
            showToast("error", "Erro ao carregar colaboradores: " + e.message);
        } finally {
            setLoading(false);
        }
    }

    function selecionar(colab) {
        setSelectedId(colab.id);
        setFormData({
            nome: colab.nome || "",
            cargo: colab.cargo || "",
            area: colab.area || "",
            email: colab.email || "",
            telefone: colab.telefone || "",
            ramal: colab.ramal || "",
            celular: colab.celular || "",
        });
    }

    function handleChange(field, value) {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    }

    function showToast(type, text) {
        setToast({ type, text });
        setTimeout(() => setToast(null), 3500);
    }

    // Salvar alteracoes em tempo real no backend
    async function handleSalvar(e) {
        if (e) e.preventDefault();
        if (!selectedId) return;

        setSaving(true);
        try {
            const res = await api(`/admin/colaboradores/${selectedId}`, {
                method: "PUT",
                body: JSON.stringify(formData),
            });

            // Atualiza na lista local
            setColaboradores((prev) =>
                prev.map((c) => (c.id === selectedId ? res.colaborador : c))
            );

            showToast("success", "Alteracoes salvas com sucesso!");
        } catch (e) {
            showToast("error", e.message || "Erro ao salvar alteracoes.");
        } finally {
            setSaving(false);
        }
    }

    // Baixar assinatura em PNG
    async function handleBaixar() {
        if (!signatureRef.current) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(signatureRef.current, {
                scale: 2,
                backgroundColor: "#f7f7f7",
                useCORS: true,
                width: 600,
                height: 200,
            });

            const a = document.createElement("a");
            a.download = `assinatura_${slug(formData.nome)}.png`;
            a.href = canvas.toDataURL("image/png");
            a.click();
            showToast("success", "PNG gerado com sucesso!");
        } catch (e) {
            showToast("error", "Erro ao gerar imagem.");
        } finally {
            setDownloading(false);
        }
    }

    // Gerar link e abrir em nova aba
    async function handleAbrirLinkPublico() {
        if (!selectedId) return;
        try {
            const res = await api(`/admin/gerar-link/${selectedId}`, {
                method: "POST",
            });
            window.open(res.link, "_blank");
        } catch (e) {
            showToast("error", "Erro ao gerar link de visualizacao.");
        }
    }

    // Excluir colaborador
    async function handleExcluir() {
        if (!selectedId) return;
        const confirmou = window.confirm(
            `Tem certeza que deseja remover ${formData.nome}?`
        );
        if (!confirmou) return;

        try {
            await api(`/admin/colaboradores/${selectedId}`, {
                method: "DELETE",
            });

            const restantes = colaboradores.filter((c) => c.id !== selectedId);
            setColaboradores(restantes);
            if (restantes.length > 0) {
                selecionar(restantes[0]);
            }
            showToast("success", "Colaborador removido.");
        } catch (e) {
            showToast("error", "Erro ao excluir: " + e.message);
        }
    }

    // Criar novo colaborador
    async function handleCriarNovo(e) {
        e.preventDefault();
        try {
            const res = await api("/admin/colaboradores", {
                method: "POST",
                body: JSON.stringify(newColab),
            });

            setColaboradores((prev) => [res.colaborador, ...prev]);
            selecionar(res.colaborador);
            setShowNewModal(false);
            setNewColab({
                nome: "",
                cargo: "",
                area: "",
                email: "",
                telefone: "+55 11 4656-5300",
                ramal: "",
                celular: "",
            });
            showToast("success", "Novo colaborador cadastrado!");
        } catch (e) {
            showToast("error", e.message || "Erro ao cadastrar.");
        }
    }

    // Filtros e Lista
    const areas = useMemo(() => {
        const set = new Set();
        colaboradores.forEach((c) => {
            if (c.area) set.add(c.area.trim());
        });
        return ["TODAS", ...Array.from(set).sort()];
    }, [colaboradores]);

    const filtrados = useMemo(() => {
        const termo = search.toLowerCase().trim();
        return colaboradores.filter((c) => {
            const matchArea = areaFilter === "TODAS" || c.area === areaFilter;
            const matchTexto =
                !termo ||
                c.nome?.toLowerCase().includes(termo) ||
                c.email?.toLowerCase().includes(termo) ||
                c.cargo?.toLowerCase().includes(termo) ||
                c.area?.toLowerCase().includes(termo);
            return matchArea && matchTexto;
        });
    }, [colaboradores, search, areaFilter]);

    return (
        <main className="tn-admin-page">
            {/* Padrao de fundo institucional identico aos outros lugares */}
            <div
                className="tn-pattern-bg"
                style={{ backgroundImage: `url(${patternImg})` }}
                aria-hidden="true"
            />

            {/* Cabecalho do Painel Admin */}
            <header className="tn-admin-header">
                <div className="tn-admin-branding">
                    <img src={logoImg} alt="Trynova Logo" className="tn-admin-logo" />
                    <div className="tn-admin-title-wrap">
                        <h1>Painel Administrativo</h1>
                        <p>Gestao e Edicao em Tempo Real de Assinaturas Corporativas</p>
                    </div>
                </div>

                <div className="tn-admin-top-actions">
                    {adminUser && (
                        <div className="tn-admin-user-badge">
                            <svg viewBox="0 0 24 24" fill="none" width="16" height="16" aria-hidden="true">
                                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
                                <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                            <span>
                                Conectado como: <strong>{adminUser.nome}</strong> ({adminUser.email})
                            </span>
                        </div>
                    )}

                    <button
                        className="tn-btn-nav tn-btn-new-colab"
                        onClick={() => setShowNewModal(true)}
                    >
                        <span>+ Novo Colaborador</span>
                    </button>

                    <Link to="/" className="tn-btn-nav">
                        <span>Pagina Publica</span>
                        <svg viewBox="0 0 24 24" fill="none" width="14" height="14" aria-hidden="true">
                            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>

                    <button
                        type="button"
                        className="tn-btn-logout"
                        onClick={handleLogout}
                        title="Encerrar sessao de administrador"
                    >
                        Sair
                    </button>
                </div>
            </header>

            {/* Container Principal Dividido */}
            <div className="tn-admin-container">
                {/* Coluna 1: Lista e Filtro de Colaboradores */}
                <section className="tn-admin-list-card">
                    <div className="tn-admin-list-header">
                        <div className="tn-search-wrap">
                            <svg className="tn-search-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
                                <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <input
                                type="text"
                                className="tn-search-input"
                                placeholder="Buscar por nome, cargo, e-mail..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="tn-filter-row">
                            <select
                                className="tn-filter-select"
                                value={areaFilter}
                                onChange={(e) => setAreaFilter(e.target.value)}
                            >
                                {areas.map((a) => (
                                    <option key={a} value={a}>
                                        {a === "TODAS" ? "Todas as areas" : a}
                                    </option>
                                ))}
                            </select>
                            <span className="tn-list-count">
                                {filtrados.length} {filtrados.length === 1 ? "registro" : "registros"}
                            </span>
                        </div>
                    </div>

                    <div className="tn-colab-list">
                        {loading ? (
                            <div style={{ padding: "30px", textAlign: "center", color: "#627899" }}>
                                Carregando colaboradores...
                            </div>
                        ) : filtrados.length === 0 ? (
                            <div style={{ padding: "30px", textAlign: "center", color: "#627899" }}>
                                Nenhum colaborador encontrado.
                            </div>
                        ) : (
                            filtrados.map((c) => {
                                const isSelected = c.id === selectedId;
                                const iniciais = c.nome
                                    ? c.nome
                                          .split(" ")
                                          .filter(Boolean)
                                          .map((n) => n[0])
                                          .slice(0, 2)
                                          .join("")
                                          .toUpperCase()
                                    : "TN";

                                return (
                                    <div
                                        key={c.id}
                                        className={`tn-colab-item ${isSelected ? "active" : ""}`}
                                        onClick={() => selecionar(c)}
                                    >
                                        <div className="tn-colab-avatar">{iniciais}</div>
                                        <div className="tn-colab-meta">
                                            <div className="tn-colab-name">{c.nome}</div>
                                            <div className="tn-colab-cargo">{c.cargo}</div>
                                            <div className="tn-colab-email">{c.email}</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

                {/* Coluna 2: Pre-visualizacao ao Vivo + Formulario de Edicao */}
                <section className="tn-admin-editor-card">
                    <div className="tn-editor-top">
                        <div className="tn-editor-headline">
                            <h2>
                                Editando: <span>{formData.nome || "Novo Colaborador"}</span>
                            </h2>
                        </div>
                        <div className="tn-editor-actions">
                            <button
                                className="tn-btn-nav"
                                onClick={handleAbrirLinkPublico}
                                title="Abrir a pagina publica que o colaborador visualiza"
                            >
                                <svg viewBox="0 0 24 24" fill="none" width="14" height="14" aria-hidden="true">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Abrir Link de Acesso
                            </button>
                            <button
                                className="tn-btn-delete"
                                onClick={handleExcluir}
                                title="Remover este colaborador"
                            >
                                <svg viewBox="0 0 24 24" fill="none" width="14" height="14" aria-hidden="true">
                                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Excluir
                            </button>
                        </div>
                    </div>

                    {/* PRE-VISUALIZACAO EM TEMPO REAL DA ASSINATURA */}
                    <div className="tn-admin-preview-section">
                        <div className="tn-section-title">
                            PRE-VISUALIZACAO AO VIVO (ATUALIZACAO EM TEMPO REAL)
                        </div>

                        <div className="tn-admin-signature-wrap">
                            <div className="tn-signature-box" ref={signatureRef}>
                                <div className="tn-sig-logo">
                                    <img src={logoImg} alt="Logo Trynova" />
                                </div>

                                <div className="tn-sig-name">{formData.nome || "NOME DO COLABORADOR"}</div>
                                <div className="tn-sig-cargo">{formData.cargo || "Cargo Corporativo"}</div>
                                <div className="tn-sig-area">{formData.area || "AREA / DEPARTAMENTO"}</div>

                                <div className="tn-sig-email-label">E-mail</div>
                                <div className="tn-sig-email-val">{formData.email || "email@trynova.com.br"}</div>

                                <div className="tn-sig-tel-label">Telefone</div>
                                <div className="tn-sig-tel-val">
                                    {formData.telefone || "+55 11 4656-5300"}
                                    {formData.ramal ? ` | Ramal ${formData.ramal}` : ""}
                                    {formData.celular ? ` | ${formData.celular}` : ""}
                                </div>

                                <img src={selo33Img} alt="33 anos" className="tn-sig-33-img" />
                                <div className="tn-sig-company">Trynova Consultoria Imobiliaria</div>
                                <div className="tn-sig-site">www.trynova.com.br</div>
                            </div>
                        </div>
                    </div>

                    {/* FORMULARIO DE EDICAO */}
                    <form className="tn-admin-form-section" onSubmit={handleSalvar}>
                        <div className="tn-section-title">CAMPOS DE IDENTIFICACAO</div>

                        <div className="tn-form-grid">
                            <div className="tn-admin-field">
                                <label>Nome Completo</label>
                                <input
                                    type="text"
                                    value={formData.nome}
                                    onChange={(e) => handleChange("nome", e.target.value)}
                                    placeholder="Ex: Felipe Rabelo"
                                    required
                                />
                            </div>

                            <div className="tn-admin-field">
                                <label>Cargo / Funcao</label>
                                <input
                                    type="text"
                                    value={formData.cargo}
                                    onChange={(e) => handleChange("cargo", e.target.value)}
                                    placeholder="Ex: Analista de Marketing I"
                                    required
                                />
                            </div>

                            <div className="tn-admin-field tn-field-full">
                                <label>Area / Departamento</label>
                                <input
                                    type="text"
                                    value={formData.area}
                                    onChange={(e) => handleChange("area", e.target.value)}
                                    placeholder="Ex: MARKETING"
                                    required
                                />
                            </div>

                            <div className="tn-admin-field tn-field-full">
                                <label>E-mail Corporativo (@trynova.com.br)</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    placeholder="nome@trynova.com.br"
                                    required
                                />
                            </div>

                            <div className="tn-admin-field">
                                <label>Telefone Principal</label>
                                <input
                                    type="text"
                                    value={formData.telefone}
                                    onChange={(e) => handleChange("telefone", e.target.value)}
                                    placeholder="+55 11 4656-5300"
                                    required
                                />
                            </div>

                            <div className="tn-admin-field">
                                <label>Ramal (opcional)</label>
                                <input
                                    type="text"
                                    value={formData.ramal}
                                    onChange={(e) => handleChange("ramal", e.target.value)}
                                    placeholder="Ex: 0253"
                                />
                            </div>

                            <div className="tn-admin-field tn-field-full">
                                <label>Celular (opcional)</label>
                                <input
                                    type="text"
                                    value={formData.celular}
                                    onChange={(e) => handleChange("celular", e.target.value)}
                                    placeholder="+55 11 99999-9999"
                                />
                            </div>
                        </div>

                        {/* Barra de Salvar e Baixar */}
                        <div className="tn-admin-footer-bar">
                            <span style={{ fontSize: "12px", color: "#627899" }}>
                                As alteracoes sao refletidas no preview enquanto voce digita.
                            </span>

                            <div className="tn-footer-right-buttons">
                                <button
                                    type="button"
                                    className="tn-btn-download"
                                    onClick={handleBaixar}
                                    disabled={downloading}
                                >
                                    {downloading ? "Gerando PNG..." : "Baixar Imagem PNG"}
                                </button>

                                <button
                                    type="submit"
                                    className="tn-btn-save"
                                    disabled={saving}
                                >
                                    {saving ? "Salvando..." : "Salvar Alteracoes"}
                                </button>
                            </div>
                        </div>
                    </form>
                </section>
            </div>

            {/* Modal de Novo Colaborador */}
            {showNewModal && (
                <div
                    className="tn-modal-admin-overlay"
                    onClick={() => setShowNewModal(false)}
                >
                    <div
                        className="tn-modal-admin-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="tn-modal-close"
                            onClick={() => setShowNewModal(false)}
                        >
                            &#10005;
                        </button>

                        <div className="tn-modal-header">
                            <div className="tn-overline">CADASTRO</div>
                            <h2>Novo <span>Colaborador</span></h2>
                        </div>

                        <form onSubmit={handleCriarNovo} style={{ marginTop: "20px" }}>
                            <div className="tn-form-grid">
                                <div className="tn-admin-field tn-field-full">
                                    <label>Nome Completo</label>
                                    <input
                                        type="text"
                                        required
                                        value={newColab.nome}
                                        onChange={(e) =>
                                            setNewColab((p) => ({ ...p, nome: e.target.value }))
                                        }
                                        placeholder="Nome e Sobrenome"
                                    />
                                </div>
                                <div className="tn-admin-field">
                                    <label>Cargo</label>
                                    <input
                                        type="text"
                                        required
                                        value={newColab.cargo}
                                        onChange={(e) =>
                                            setNewColab((p) => ({ ...p, cargo: e.target.value }))
                                        }
                                        placeholder="Ex: Assistente Tecnico I"
                                    />
                                </div>
                                <div className="tn-admin-field">
                                    <label>Area</label>
                                    <input
                                        type="text"
                                        required
                                        value={newColab.area}
                                        onChange={(e) =>
                                            setNewColab((p) => ({ ...p, area: e.target.value }))
                                        }
                                        placeholder="Ex: GESTAO PATRIMONIAL"
                                    />
                                </div>
                                <div className="tn-admin-field tn-field-full">
                                    <label>E-mail Corporativo</label>
                                    <input
                                        type="email"
                                        required
                                        value={newColab.email}
                                        onChange={(e) =>
                                            setNewColab((p) => ({ ...p, email: e.target.value }))
                                        }
                                        placeholder="nome.sobrenome@trynova.com.br"
                                    />
                                </div>
                                <div className="tn-admin-field">
                                    <label>Telefone</label>
                                    <input
                                        type="text"
                                        required
                                        value={newColab.telefone}
                                        onChange={(e) =>
                                            setNewColab((p) => ({ ...p, telefone: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="tn-admin-field">
                                    <label>Ramal</label>
                                    <input
                                        type="text"
                                        value={newColab.ramal}
                                        onChange={(e) =>
                                            setNewColab((p) => ({ ...p, ramal: e.target.value }))
                                        }
                                        placeholder="Ex: 0250"
                                    />
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "12px",
                                    marginTop: "24px",
                                }}
                            >
                                <button
                                    type="button"
                                    className="tn-btn-nav"
                                    onClick={() => setShowNewModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="tn-btn-save">
                                    Cadastrar Colaborador
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className={`tn-toast ${toast.type}`}>
                    {toast.type === "success" ? (
                        <svg viewBox="0 0 24 24" fill="none" width="16" height="16" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                            <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" width="16" height="16" aria-hidden="true">
                            <path d="M12 2L2 22h20L12 2z" stroke="currentColor" strokeWidth="2" fill="none" />
                            <path d="M12 10v4M12 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    )}
                    <span>{toast.text}</span>
                </div>
            )}
        </main>
    );
}
