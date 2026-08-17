import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * AsyncStorage funciona tanto en iOS/Android (SQLite nativo) como en
 * web (usa localStorage por debajo), así que no necesitamos ramificar
 * por plataforma. Para producción "de verdad" en móvil se recomendaría
 * expo-secure-store (cifrado), pero ese NO funciona en web — como este
 * proyecto corre en ambos, AsyncStorage es el común denominador simple.
 */
const KEYS = {
    accessToken: "auth:accessToken",
    refreshToken: "auth:refreshToken",
    user: "auth:user",
} as const;

export const tokenStorage = {
    async getAccessToken() {
        return AsyncStorage.getItem(KEYS.accessToken);
    },
    async getRefreshToken() {
        return AsyncStorage.getItem(KEYS.refreshToken);
    },
    async saveSession(accessToken: string, refreshToken: string, user: object) {
        await AsyncStorage.setMany({
            [KEYS.accessToken]: accessToken,
            [KEYS.refreshToken]: refreshToken,
            [KEYS.user]: JSON.stringify(user),
        });
    },
    async getUser<T>(): Promise<T | null> {
        const raw = await AsyncStorage.getItem(KEYS.user);
        return raw ? (JSON.parse(raw) as T) : null;
    },
    async clear() {
        await AsyncStorage.removeMany([KEYS.accessToken, KEYS.refreshToken, KEYS.user]);
    },
};
