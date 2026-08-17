import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
    const { login } = useAuth();
    const [email, setEmail] = useState("client1@comiccon.demo");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        setError(null);
        setLoading(true);
        try {
            await login(email.trim(), password);
            // La navegación a "Events" ocurre sola: RootNavigator reacciona
            // a isAuthenticated y cambia de stack automáticamente.
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.container}
        >
            <Text style={styles.title}>🎟️ Comic-Con Tickets</Text>
            <Text style={styles.subtitle}>Inicia sesión para comprar tus boletos</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Contraseña"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Entrar</Text>
                )}
            </Pressable>

            <Pressable onPress={() => navigation.navigate("Register")}>
                <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
            </Pressable>

            <Text style={styles.hint}>
                Demo: client1@comiccon.demo / Password123!
            </Text>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
    title: { fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 4 },
    subtitle: { textAlign: "center", color: "#666", marginBottom: 32 },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 14,
        marginBottom: 12,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#7c3aed",
        borderRadius: 10,
        padding: 16,
        alignItems: "center",
        marginTop: 8,
    },
    buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
    link: { color: "#7c3aed", textAlign: "center", marginTop: 20 },
    error: { color: "#dc2626", textAlign: "center", marginBottom: 8 },
    hint: { color: "#999", textAlign: "center", marginTop: 24, fontSize: 12 },
});
