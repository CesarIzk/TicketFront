import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";
import { loginRequest, registerRequest, logoutRequest } from "../api/auth";
import { tokenStorage } from "../api/storage";
import { getApiErrorMessage } from "../api/client";
import type { User } from "../types/api";

interface AuthContextValue {
    user: User | null;
    isLoading: boolean; // true mientras se restaura la sesión guardada al abrir la app
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, fullName: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Al abrir la app, restaura la sesión guardada (si hay) sin obligar
    // al usuario a loguearse de nuevo cada vez.
    useEffect(() => {
        (async () => {
            const savedUser = await tokenStorage.getUser<User>();
            const accessToken = await tokenStorage.getAccessToken();
            if (savedUser && accessToken) {
                setUser(savedUser);
            }
            setIsLoading(false);
        })();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const data = await loginRequest(email, password);
            await tokenStorage.saveSession(data.accessToken, data.refreshToken, data.user);
            setUser(data.user);
        } catch (err) {
            throw new Error(getApiErrorMessage(err));
        }
    }, []);

    const register = useCallback(
        async (email: string, password: string, fullName: string) => {
            try {
                const data = await registerRequest(email, password, fullName);
                await tokenStorage.saveSession(data.accessToken, data.refreshToken, data.user);
                setUser(data.user);
            } catch (err) {
                throw new Error(getApiErrorMessage(err));
            }
        },
        []
    );

    const logout = useCallback(async () => {
        try {
            await logoutRequest();
        } catch {
            // Si el logout en servidor falla (ej. sin conexión), igual
            // limpiamos la sesión local — no queremos dejar al usuario
            // atrapado sin poder salir de su cuenta.
        }
        await tokenStorage.clear();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
    return ctx;
}
