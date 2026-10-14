
export async function api(path, options = {}) {
    const r = await fetch(`/api${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        ...options,
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
        throw new Error(data.message || "Falha na comunicação.");
    }

    return data;
}
