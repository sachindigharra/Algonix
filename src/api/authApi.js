import { api } from "./client";


export function login({ email, password }) {
    return api("/auth/login", {
        method: "POST",
        body: JSON.stringify({
            email,
            password,
        }),
    });
}

export function register(request) {
    return api("/auth/register", {
        method: "POST",
        body: JSON.stringify(request),
    });
}

export function signOut() {
    return api("/auth/logout", {
        method: "POST",
    });
}
export function getUser(){
    {
        data:return api("/auth/me", {
        method: "GET",
        });
    }
}