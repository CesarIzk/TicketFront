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

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
    const { register } = useAuth();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleRegister() {
        setError(null);
        setLoading(true);
        try {
            await register(email.trim(), password, fullName.trim());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al registrarte");
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.container}
        >
            <Text style={styles.title}>Crear cuenta</Text>

            <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                value={fullName}
                onChangeText={setFullName}
            />
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
                placeholder="Contraseña (8+ car., mayús., minús. y número)"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable style={styles.button} onPress={handleRegister} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Registrarme</Text>
                )}
            </Pressable>

            <Pressable onPress={() => navigation.navigate("Login")}>
                <Text style={styles.link}>Ya tengo cuenta, iniciar sesión</Text>
            </Pressable>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
    title: { fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 24 },
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
});
