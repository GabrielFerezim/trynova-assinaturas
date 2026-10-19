
import { readFile, writeFile } from "node:fs/promises";
import crypto from "node:crypto";

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
 * Salva o cache atualizado no arquivo JSON.
 */
async function salvar() {
    if (!cache) return;
    await writeFile(arquivo, JSON.stringify(cache, null, 2), "utf8");
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
 * Busca um colaborador pelo ID.
 */
export async function buscarPorId(id) {
    const colaboradores = await listar();
    return colaboradores.find((c) => c.id === id) || null;
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

/**
 * Atualiza os dados de um colaborador existente e persiste no arquivo JSON.
 */
export async function atualizar(id, dadosNovos) {
    const colaboradores = await listar();
    const index = colaboradores.findIndex((c) => c.id === id);

    if (index === -1) {
        return null;
    }

    const atualizado = limpar({
        ...colaboradores[index],
        ...dadosNovos,
        id, // Mantém o ID original inalterado
    });

    colaboradores[index] = atualizado;
    await salvar();

    return atualizado;
}

/**
 * Cria um novo colaborador e persiste no arquivo JSON.
 */
export async function criar(dados) {
    const colaboradores = await listar();
    const novo = limpar({
        id: crypto.randomUUID(),
        ...dados,
    });

    colaboradores.unshift(novo);
    await salvar();

    return novo;
}

/**
 * Exclui um colaborador pelo ID e persiste no arquivo JSON.
 */
export async function excluir(id) {
    const colaboradores = await listar();
    const index = colaboradores.findIndex((c) => c.id === id);

    if (index === -1) {
        return false;
    }

    colaboradores.splice(index, 1);
    await salvar();

    return true;
}
