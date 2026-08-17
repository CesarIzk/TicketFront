import { apiClient } from "./client";
import type { ApiSuccess, AuthResponse, User } from "../types/api";

export async function loginRequest(email: string, password: string) {
    const res = await apiClient.post<ApiSuccess<AuthResponse>>("/auth/login", {
        email,
        password,
    });
    return res.data.data;
}

export async function registerRequest(
    email: string,
    password: string,
    full_name: string
) {
    const res = await apiClient.post<ApiSuccess<AuthResponse>>("/auth/register", {
        email,
        password,
        full_name,
    });
    return res.data.data;
}

export async function logoutRequest() {
    await apiClient.post("/auth/logout");
}

export async function fetchMe() {
    const res = await apiClient.get<ApiSuccess<{ user: User }>>("/auth/me");
    return res.data.data.user;
}
