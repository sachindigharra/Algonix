// api/client.js

const BASE_URL = "http://localhost:8080/api/v1";

export async function api(url, options = {}) {
    const response = await fetch(BASE_URL + url, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    });

    const data = await response.json().catch(() => ({}));

    console.debug('[api]', options.method || 'GET', url, '→', response.status, response.ok, data);

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
}