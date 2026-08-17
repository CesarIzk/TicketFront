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

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

// Validaciones
const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password: string): { valid: boolean; strength: string } => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isLongEnough = password.length >= 8;

    const strength =
        isLongEnough && hasUpperCase && hasLowerCase && hasNumber ? "strong" : "weak";
    const valid = isLongEnough && hasUpperCase && hasLowerCase && hasNumber;

    return { valid, strength };
};

export default function RegisterScreen({ navigation }: Props) {
    const { register } = useAuth();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const isNameValid = fullName.trim().length >= 3;
    const isEmailValid = email.length > 0 && validateEmail(email);
    const passwordValidation = validatePassword(password);
    const passwordsMatch = password.length > 0 && password === confirmPassword;
    const isFormValid =
        isNameValid &&
        isEmailValid &&
        passwordValidation.valid &&
        passwordsMatch &&
        termsAccepted;

    async function handleRegister() {
        setError(null);
        if (!isFormValid) {
            setError("Por favor completa correctamente todos los campos");
            return;
        }

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
                    <Text style={styles.title}>Crear Cuenta</Text>
                    <Text style={styles.subtitle}>Únete a Comic-Con Tickets</Text>
                </View>

                {/* Form Card */}
                <View style={styles.card}>
                    {/* Full Name Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Nombre Completo</Text>
                        <View
                            style={[
                                styles.inputWrapper,
                                fullName.length > 0 &&
                                    (isNameValid
                                        ? styles.inputWrapperSuccess
                                        : styles.inputWrapperError),
                            ]}
                        >
                            <TextInput
                                style={styles.input}
                                placeholder="Juan Pérez"
                                value={fullName}
                                onChangeText={setFullName}
                                editable={!loading}
                                placeholderTextColor="#bbb"
                            />
                            {fullName.length > 0 && (
                                <Text style={styles.inputIcon}>
                                    {isNameValid ? "✓" : "✗"}
                                </Text>
                            )}
                        </View>
                        {fullName.length > 0 && !isNameValid && (
                            <Text style={styles.inputHint}>
                                El nombre debe tener al menos 3 caracteres
                            </Text>
                        )}
                    </View>

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
                        <Text style={styles.inputLabel}>Contraseña</Text>
                        <View
                            style={[
                                styles.inputWrapper,
                                password.length > 0 &&
                                    (passwordValidation.valid
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

                        {/* Password Requirements */}
                        {password.length > 0 && (
                            <View style={styles.requirementsBox}>
                                <RequirementItem
                                    text="Mínimo 8 caracteres"
                                    met={password.length >= 8}
                                />
                                <RequirementItem
                                    text="Una letra mayúscula (A-Z)"
                                    met={/[A-Z]/.test(password)}
                                />
                                <RequirementItem
                                    text="Una letra minúscula (a-z)"
                                    met={/[a-z]/.test(password)}
                                />
                                <RequirementItem
                                    text="Un número (0-9)"
                                    met={/[0-9]/.test(password)}
                                />
                            </View>
                        )}
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Confirmar Contraseña</Text>
                        <View
                            style={[
                                styles.inputWrapper,
                                confirmPassword.length > 0 &&
                                    (passwordsMatch
                                        ? styles.inputWrapperSuccess
                                        : styles.inputWrapperError),
                            ]}
                        >
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                secureTextEntry={!showConfirmPassword}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                editable={!loading}
                                placeholderTextColor="#bbb"
                            />
                            <Pressable
                                onPress={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                style={styles.showPasswordButton}
                            >
                                <Text style={styles.showPasswordIcon}>
                                    {showConfirmPassword ? "👁" : "🙈"}
                                </Text>
                            </Pressable>
                        </View>
                        {confirmPassword.length > 0 && !passwordsMatch && (
                            <Text style={styles.inputHint}>
                                Las contraseñas no coinciden
                            </Text>
                        )}
                    </View>

                    {/* Terms & Conditions */}
                    <View style={styles.termsContainer}>
                        <Pressable
                            style={styles.checkbox}
                            onPress={() => setTermsAccepted(!termsAccepted)}
                        >
                            <Text style={styles.checkboxText}>
                                {termsAccepted ? "✓" : " "}
                            </Text>
                        </Pressable>
                        <Text style={styles.termsText}>
                            Acepto los{" "}
                            <Text style={styles.termsLink}>términos y condiciones</Text> y
                            la{" "}
                            <Text style={styles.termsLink}>política de privacidad</Text>
                        </Text>
                    </View>

                    {/* Error Message */}
                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorIcon}>⚠️</Text>
                            <Text style={styles.error}>{error}</Text>
                        </View>
                    )}

                    {/* Register Button */}
                    <Pressable
                        style={[
                            styles.button,
                            !isFormValid && styles.buttonDisabled,
                            loading && styles.buttonLoading,
                        ]}
                        onPress={handleRegister}
                        disabled={!isFormValid || loading}
                    >
                        {loading ? (
                            <>
                                <ActivityIndicator
                                    color="#fff"
                                    size="small"
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={styles.buttonText}>Registrando...</Text>
                            </>
                        ) : (
                            <Text style={styles.buttonText}>Crear Cuenta</Text>
                        )}
                    </Pressable>

                    {/* Login Link */}
                    <View style={styles.loginSection}>
                        <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
                        <Pressable
                            onPress={() => navigation.navigate("Login")}
                            disabled={loading}
                        >
                            <Text style={styles.loginLink}>Inicia sesión</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

interface RequirementItemProps {
    text: string;
    met: boolean;
}

function RequirementItem({ text, met }: RequirementItemProps) {
    return (
        <View style={styles.requirementItem}>
            <Text style={[styles.requirementIcon, { color: met ? "#34C759" : "#ccc" }]}>
                {met ? "✓" : "○"}
            </Text>
            <Text style={[styles.requirementText, { color: met ? "#34C759" : "#999" }]}>
                {text}
            </Text>
        </View>
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
    },
    header: {
        alignItems: "center",
        marginBottom: 24,
    },
    headerIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 8,
        color: "#1a1a1a",
    },
    subtitle: {
        fontSize: 14,
        textAlign: "center",
        color: "#666",
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
    requirementsBox: {
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        padding: 10,
        marginTop: 8,
        borderLeftWidth: 3,
        borderLeftColor: "#FF9500",
    },
    requirementItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    requirementIcon: {
        fontSize: 12,
        marginRight: 8,
        fontWeight: "bold",
    },
    requirementText: {
        fontSize: 12,
        flex: 1,
    },
    termsContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderWidth: 1.5,
        borderColor: "#ddd",
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
        marginTop: 2,
    },
    checkboxText: {
        fontSize: 14,
        color: "#34C759",
        fontWeight: "bold",
    },
    termsText: {
        flex: 1,
        fontSize: 12,
        color: "#666",
        lineHeight: 18,
    },
    termsLink: {
        color: "#7c3aed",
        fontWeight: "600",
        textDecorationLine: "underline",
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
    loginSection: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
    },
    loginText: {
        color: "#666",
        fontSize: 14,
    },
    loginLink: {
        color: "#7c3aed",
        fontSize: 14,
        fontWeight: "600",
        textDecorationLine: "underline",
    },
});
