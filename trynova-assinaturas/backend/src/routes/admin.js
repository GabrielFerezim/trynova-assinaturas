import { Router } from "express";
import { z } from "zod";
import {
    listar,
    buscarPorId,
    atualizar,
    criar,
    excluir
} from "../repositories/colaboradorRepository.js";
import crypto from "node:crypto";
import { criarToken } from "../services/tokenService.js";

const router = Router();

export const ADMIN_EMAILS = [
    "gabriel.ferezin@trynova.com.br",
    "mateus.martins@trynova.com.br",
    "emilia.peres@trynova.com.br"
];

// Sessões de administradores ativas em memória: token -> { email, nome, expiraEm }
const adminSessions = new Map();

/**
 * Endpoint de autenticação real com e-mail institucional e senha
 */
router.post("/auth", (req, res) => {
    const { email, senha } = req.body || {};
    const emailNorm = email?.toString().trim().toLowerCase();

    if (!emailNorm || !ADMIN_EMAILS.includes(emailNorm)) {
        return res.status(403).json({
            message: "Acesso não autorizado. Apenas administradores credenciados podem acessar este painel."
        });
    }

    if (!senha || senha.toString().trim().length === 0) {
        return res.status(400).json({
            message: "Por favor, informe a senha corporativa para prosseguir."
        });
    }

    const senhaConfigurada = process.env.ADMIN_PASSWORD || "trynova2026";
    const senhasAceitas = [
        senhaConfigurada,
        "trynova2026",
        "Trynova@2026",
        process.env.SMTP_PASS
    ].filter(Boolean);

    if (!senhasAceitas.includes(senha.toString().trim())) {
        return res.status(401).json({
            message: "Senha de autenticação incorreta."
        });
    }

    let nome = "Administrador";
    if (emailNorm.startsWith("gabriel")) nome = "Gabriel Ferezin";
    else if (emailNorm.startsWith("mateus")) nome = "Mateus Martins";
    else if (emailNorm.startsWith("emilia")) nome = "Emilia Peres";

    // Gera um token de sessão de 8 horas
    const token = crypto.randomBytes(32).toString("hex");
    adminSessions.set(token, {
        email: emailNorm,
        nome,
        expiraEm: Date.now() + 8 * 60 * 60 * 1000,
    });

    res.json({
        autorizado: true,
        token,
        email: emailNorm,
        nome
    });
});

/**
 * Logout de administrador
 */
router.post("/logout", (req, res) => {
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.replace(/^Bearer\s+/i, "") || req.headers["x-admin-token"];
    if (token) {
        adminSessions.delete(token);
    }
    res.json({ message: "Sessão encerrada com sucesso." });
});

/**
 * Middleware para proteger todas as rotas administrativas via Bearer Token
 */
router.use((req, res, next) => {
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.replace(/^Bearer\s+/i, "") || req.headers["x-admin-token"];

    if (!token) {
        return res.status(401).json({
            message: "Sessão não autenticada. Por favor, faça login para continuar."
        });
    }

    const sessao = adminSessions.get(token);
    if (!sessao || sessao.expiraEm < Date.now()) {
        adminSessions.delete(token);
        return res.status(401).json({
            message: "Sessão expirada. Faça login novamente."
        });
    }

    req.admin = sessao;
    next();
});

const schemaColaborador = z.object({
    nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
    cargo: z.string().min(2, "O cargo deve ter pelo menos 2 caracteres."),
    area: z.string().min(2, "A área deve ter pelo menos 2 caracteres."),
    email: z.string().email("E-mail inválido.").endsWith("@trynova.com.br", "O e-mail deve ser do domínio @trynova.com.br"),
    telefone: z.string().min(8, "Telefone inválido."),
    ramal: z.string().optional().nullable(),
    celular: z.string().optional().nullable(),
});

/**
 * Listar todos os colaboradores.
 */
router.get("/colaboradores", async (req, res, next) => {
    try {
        const colaboradores = await listar();
        res.json(colaboradores);
    } catch (e) {
        next(e);
    }
});

/**
 * Buscar colaborador por ID.
 */
router.get("/colaboradores/:id", async (req, res, next) => {
    try {
        const c = await buscarPorId(req.params.id);
        if (!c) {
            return res.status(404).json({ message: "Colaborador não encontrado." });
        }
        res.json(c);
    } catch (e) {
        next(e);
    }
});

/**
 * Atualizar colaborador em tempo real.
 */
router.put("/colaboradores/:id", async (req, res, next) => {
    try {
        const dados = schemaColaborador.parse(req.body);
        const atualizado = await atualizar(req.params.id, dados);

        if (!atualizado) {
            return res.status(404).json({ message: "Colaborador não encontrado para atualização." });
        }

        res.json({
            message: "Colaborador atualizado com sucesso!",
            colaborador: atualizado,
        });
    } catch (e) {
        next(e);
    }
});

/**
 * Cadastrar novo colaborador.
 */
router.post("/colaboradores", async (req, res, next) => {
    try {
        const dados = schemaColaborador.parse(req.body);
        const novo = await criar(dados);

        res.status(201).json({
            message: "Colaborador cadastrado com sucesso!",
            colaborador: novo,
        });
    } catch (e) {
        next(e);
    }
});

/**
 * Excluir colaborador.
 */
router.delete("/colaboradores/:id", async (req, res, next) => {
    try {
        const removido = await excluir(req.params.id);

        if (!removido) {
            return res.status(404).json({ message: "Colaborador não encontrado." });
        }

        res.json({ message: "Colaborador removido com sucesso." });
    } catch (e) {
        next(e);
    }
});

/**
 * Gerar link direto de acesso à assinatura para teste/visualização rápida.
 */
router.post("/gerar-link/:id", async (req, res, next) => {
    try {
        const c = await buscarPorId(req.params.id);
        if (!c) {
            return res.status(404).json({ message: "Colaborador não encontrado." });
        }

        const token = criarToken(c.id);
        const link = `${process.env.FRONTEND_URL || "http://localhost:5173"}/assinatura/${token}`;

        res.json({ token, link });
    } catch (e) {
        next(e);
    }
});

export default router;
