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
    ScrollView,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

// Validación de email
const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export default function LoginScreen({ navigation }: Props) {
    const { login } = useAuth();
    const [email, setEmail] = useState("client1@comiccon.demo");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isEmailValid = email.length > 0 && validateEmail(email);
    const isPasswordValid = password.length >= 8;
    const isFormValid = isEmailValid && isPasswordValid;

    async function handleLogin() {
        setError(null);
        if (!isFormValid) {
            setError("Por favor completa correctamente todos los campos");
            return;
        }

        setLoading(true);
        try {
            await login(email.trim(), password);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerIcon}>🎟️</Text>
                    <Text style={styles.title}>Comic-Con Tickets</Text>
                    <Text style={styles.subtitle}>
                        Inicia sesión para comprar tus boletos
                    </Text>
                </View>

                {/* Form Card */}
                <View style={styles.card}>
                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <View
                            style={[
                                styles.inputWrapper,
                                email.length > 0 &&
                                    (isEmailValid
                                        ? styles.inputWrapperSuccess
                                        : styles.inputWrapperError),
                            ]}
                        >
                            <TextInput
                                style={styles.input}
                                placeholder="tu@email.com"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                                editable={!loading}
                                placeholderTextColor="#bbb"
                            />
                            {email.length > 0 && (
                                <Text style={styles.inputIcon}>
                                    {isEmailValid ? "✓" : "✗"}
                                </Text>
                            )}
                        </View>
                        {email.length > 0 && !isEmailValid && (
                            <Text style={styles.inputHint}>
                                Por favor ingresa un email válido
                            </Text>
                        )}
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <View style={styles.passwordLabelRow}>
                            <Text style={styles.inputLabel}>Contraseña</Text>
                            <Text style={styles.passwordRequirement}>
                                Mín. 8 caracteres
                            </Text>
                        </View>
                        <View
                            style={[
                                styles.inputWrapper,
                                password.length > 0 &&
                                    (isPasswordValid
                                        ? styles.inputWrapperSuccess
                                        : styles.inputWrapperError),
                            ]}
                        >
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                                editable={!loading}
                                placeholderTextColor="#bbb"
                            />
                            <Pressable
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.showPasswordButton}
                            >
                                <Text style={styles.showPasswordIcon}>
                                    {showPassword ? "👁" : "🙈"}
                                </Text>
                            </Pressable>
                        </View>
                        {password.length > 0 && !isPasswordValid && (
                            <Text style={styles.inputHint}>
                                La contraseña debe tener al menos 8 caracteres
                            </Text>
                        )}
                    </View>

                    {/* Error Message */}
                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorIcon}>⚠️</Text>
                            <Text style={styles.error}>{error}</Text>
                        </View>
                    )}

                    {/* Login Button */}
                    <Pressable
                        style={[
                            styles.button,
                            !isFormValid && styles.buttonDisabled,
                            loading && styles.buttonLoading,
                        ]}
                        onPress={handleLogin}
                        disabled={!isFormValid || loading}
                    >
                        {loading ? (
                            <>
                                <ActivityIndicator
                                    color="#fff"
                                    size="small"
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={styles.buttonText}>Iniciando sesión...</Text>
                            </>
                        ) : (
                            <Text style={styles.buttonText}>Entrar</Text>
                        )}
                    </Pressable>

                    {/* Register Link */}
                    <View style={styles.registerSection}>
                        <Text style={styles.registerText}>¿No tienes cuenta? </Text>
                        <Pressable
                            onPress={() => navigation.navigate("Register")}
                            disabled={loading}
                        >
                            <Text style={styles.registerLink}>Regístrate aquí</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Demo Credentials */}
                <View style={styles.demoBox}>
                    <Text style={styles.demoTitle}>💡 Demo Credentials</Text>
                    <View style={styles.demoItem}>
                        <Text style={styles.demoLabel}>Email:</Text>
                        <Text style={styles.demoValue}>client1@comiccon.demo</Text>
                    </View>
                    <View style={styles.demoItem}>
                        <Text style={styles.demoLabel}>Pass:</Text>
                        <Text style={styles.demoValue}>Password123!</Text>
                    </View>
                    <View style={styles.demoItem}>
                        <Text style={styles.demoLabel}>Admin:</Text>
                        <Text style={styles.demoValue}>admin@comiccon.demo</Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        justifyContent: "center",
        minHeight: "100%",
    },
    header: {
        alignItems: "center",
        marginBottom: 32,
    },
    headerIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 8,
        color: "#1a1a1a",
    },
    subtitle: {
        fontSize: 14,
        textAlign: "center",
        color: "#666",
        lineHeight: 20,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 18,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    passwordLabelRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    passwordRequirement: {
        fontSize: 11,
        color: "#999",
        fontStyle: "italic",
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#ddd",
        borderRadius: 10,
        paddingHorizontal: 12,
        backgroundColor: "#fafafa",
        height: 44,
    },
    inputWrapperSuccess: {
        borderColor: "#34C759",
        backgroundColor: "#f0fdf4",
    },
    inputWrapperError: {
        borderColor: "#FF3B30",
        backgroundColor: "#fef2f2",
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: "#333",
        paddingVertical: 8,
    },
    inputIcon: {
        fontSize: 16,
        marginLeft: 8,
    },
    showPasswordButton: {
        padding: 8,
        marginLeft: 4,
    },
    showPasswordIcon: {
        fontSize: 16,
    },
    inputHint: {
        fontSize: 11,
        color: "#FF3B30",
        marginTop: 4,
        marginLeft: 4,
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#fef2f2",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        borderLeftWidth: 3,
        borderLeftColor: "#FF3B30",
    },
    errorIcon: {
        fontSize: 16,
        marginRight: 8,
        marginTop: 2,
    },
    error: {
        flex: 1,
        color: "#C41E3A",
        fontSize: 13,
        fontWeight: "500",
        lineHeight: 18,
    },
    button: {
        backgroundColor: "#7c3aed",
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        marginTop: 8,
        shadowColor: "#7c3aed",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonDisabled: {
        opacity: 0.5,
        shadowOpacity: 0.1,
    },
    buttonLoading: {
        opacity: 0.9,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
    registerSection: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
    },
    registerText: {
        color: "#666",
        fontSize: 14,
    },
    registerLink: {
        color: "#7c3aed",
        fontSize: 14,
        fontWeight: "600",
        textDecorationLine: "underline",
    },
    demoBox: {
        backgroundColor: "#E3F2FD",
        borderRadius: 12,
        padding: 14,
        borderLeftWidth: 4,
        borderLeftColor: "#2196F3",
    },
    demoTitle: {
        fontSize: 13,
        fontWeight: "600",
        color: "#1565C0",
        marginBottom: 10,
    },
    demoItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(21, 101, 192, 0.1)",
    },
    demoLabel: {
        fontSize: 11,
        color: "#1976D2",
        fontWeight: "500",
    },
    demoValue: {
        fontSize: 11,
        color: "#0D47A1",
        fontWeight: "600",
        fontFamily: "monospace",
    },
});
