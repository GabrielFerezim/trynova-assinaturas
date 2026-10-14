import { Router } from "express";
import { z } from "zod";
import { buscarPorEmail, listar } from "../repositories/colaboradorRepository.js";
import { criarToken, consumirToken } from "../services/tokenService.js";
import { enviarLink } from "../services/emailService.js";

const router = Router();
router.post("/solicitar", async (req, res, next) => {
    try {
        const { email } = z.object({ email: z.string().email().endsWith("@trynova.com.br") }).parse(req.body);
        const c = await buscarPorEmail(email);
        const resposta = { message: "Se o e-mail estiver cadastrado, o link será enviado." };

        if (!c) return res.json(resposta);
        const token = criarToken(c.id);
        const link = `${process.env.FRONTEND_URL}/assinatura/${token}`;
        const envio = await enviarLink({
            para: c.email,
            nome: c.nome,
            link,
        });
        res.json(resposta);

        if (envio.dev) resposta.devLink = link;
        res.json(resposta);
    } catch (e) {
        next(e);
    }
});

router.get("/:token", async (req, res, next) => {
    try {
        const id = consumirToken(req.params.token);
        if (!id) return res.status(404).json({ message: "Link inválido ou expirado." });

        const c = (await listar()).find(x => x.id === id); if (!c)
            return res.status(404).json({ message: "Colaborador não encontrado." });
        res.json(c);
    } catch (e) {
        next(e);
    }
});
export default router;
