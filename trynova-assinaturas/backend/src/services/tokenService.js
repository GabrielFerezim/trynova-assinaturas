
import crypto from "node:crypto";

// Armazena os tokens temporários em memória.
const tokens = new Map();

// Tempo de validade do token em milissegundos.
const ttl =
    Number(process.env.TOKEN_TTL_MINUTES || 30) * 60 * 1000;

/**
 * Cria um token temporário para um colaborador.
 */
export function criarToken(colaboradorId) {
    const token = crypto.randomBytes(32).toString("hex");

    tokens.set(token, {
        colaboradorId,
        expiraEm: Date.now() + ttl,
    });

    return token;
}

/**
 * Valida o token e retorna o ID do colaborador.
 * Retorna null se o token for inválido ou estiver expirado.
 */
export function consumirToken(token) {
    const item = tokens.get(token);

    if (!item || item.expiraEm < Date.now()) {
        tokens.delete(token);
        return null;
    }

    return item.colaboradorId;
}

/**
 * Remove tokens expirados a cada minuto.
 */
setInterval(() => {
    const agora = Date.now();

    for (const [token, dados] of tokens) {
        if (dados.expiraEm < agora) {
            tokens.delete(token);
        }
    }
}, 60000).unref();
