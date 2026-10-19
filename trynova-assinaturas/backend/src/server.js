
import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { ZodError } from "zod";

import assinaturas from "./routes/assinaturas.js";
import admin from "./routes/admin.js";

// Inicializa a aplicação Express (Trynova Assinaturas API)
const app = express();

// Configurações de segurança.
app.use(helmet());

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
    })
);

// Configura o processamento de requisições JSON.
app.use(
    express.json({
        limit: "20kb",
    })
);

// Rota para verificar se a API está funcionando.
app.get("/api/health", (_, res) => {
    res.json({
        status: "ok",
    });
});

// Rotas administrativas (gestão de colaboradores e assinaturas).
app.use("/api/admin", admin);

// Rotas de assinaturas com limite de requisições.
app.use(
    "/api/assinaturas",
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 10,
        standardHeaders: true,
        legacyHeaders: false,
    }),
    assinaturas
);

// Tratamento global de erros.
app.use((err, req, res, next) => {
    console.error(err);

    if (err instanceof ZodError) {
        return res.status(400).json({
            message: "Dados inválidos.",
            issues: err.issues,
        });
    }

    res.status(500).json({
        message: "Erro interno.",
    });
});

// Inicializa o servidor.
const port = Number(process.env.PORT || 3001);

app.listen(port, () => {
    console.log(`API em http://localhost:${port}`);
});
