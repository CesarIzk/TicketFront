import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "./storage";
import type { ApiSuccess, AuthResponse } from "../types/api";

// Configurable vía app.config.ts / .env (EXPO_PUBLIC_* es lo que Expo
// expone al bundle del cliente).
export const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
});

// Adjunta el Bearer token a cada request saliente
apiClient.interceptors.request.use(async (config) => {
    const token = await tokenStorage.getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Si el access token expiró (401), intentamos refrescarlo UNA vez
// y reintentamos la petición original. Si el refresh también falla,
// dejamos que el error suba tal cual (AuthContext hará logout).
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) return null;

    try {
        const res = await axios.post<ApiSuccess<AuthResponse>>(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken }
        );
        const { accessToken, refreshToken: newRefreshToken, user } = res.data.data;
        await tokenStorage.saveSession(accessToken, newRefreshToken, user);
        return accessToken;
    } catch {
        await tokenStorage.clear();
        return null;
    }
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        const isAuthEndpoint = originalRequest?.url?.includes("/auth/");

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;

            // Si ya hay un refresh en curso (varias requests fallaron a la
            // vez), todas esperan la MISMA promesa en vez de disparar
            // refreshes duplicados.
            if (!refreshPromise) {
                refreshPromise = refreshAccessToken().finally(() => {
                    refreshPromise = null;
                });
            }

            const newToken = await refreshPromise;
            if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(originalRequest);
            }
        }

        return Promise.reject(error);
    }
);

/** Extrae un mensaje de error legible desde cualquier error de axios. */
export function getApiErrorMessage(err: unknown): string {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data as { error?: { message?: string } } | undefined;
        return data?.error?.message || err.message || "Error de red";
    }
    return "Ocurrió un error inesperado";
}
