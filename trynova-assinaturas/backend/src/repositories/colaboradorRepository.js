
import { readFile } from "node:fs/promises";

const arquivo = new URL(
    "../data/colaboradores.json",
    import.meta.url
);

let cache;

/**
 * Padroniza os dados de um colaborador.
 */
function limpar(c) {
    return {
        ...c,
        nome: c.nome?.trim(),
        cargo: c.cargo?.trim(),
        area: c.area?.trim(),
        email: c.email?.trim().toLowerCase(),
        telefone: c.telefone?.trim(),
        celular: c.celular?.trim() || null,
        ramal: c.ramal?.trim() || null,
    };
}

/**
 * Lista todos os colaboradores.
 * Os dados são carregados apenas uma vez e mantidos em cache.
 */
export async function listar() {
    if (!cache) {
        const conteudo = await readFile(arquivo, "utf8");
        const colaboradores = JSON.parse(conteudo);

        cache = colaboradores.map(limpar);
    }

    return cache;
}

/**
 * Busca um colaborador pelo e-mail corporativo.
 */
export async function buscarPorEmail(email) {
    const colaboradores = await listar();
    const emailNormalizado = email.trim().toLowerCase();

    return colaboradores.find(
        (colaborador) => colaborador.email === emailNormalizado
    );
}
