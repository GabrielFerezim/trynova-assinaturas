
export async function api(path, options = {}) {
    let adminToken = "";
    try {
        const stored = sessionStorage.getItem("trynova_admin_user");
        if (stored) {
            adminToken = JSON.parse(stored)?.token || "";
        }
    } catch {}

    const r = await fetch(`/api${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(adminToken ? { "Authorization": `Bearer ${adminToken}` } : {}),
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
