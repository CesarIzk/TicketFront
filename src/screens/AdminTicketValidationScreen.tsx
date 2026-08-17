import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    TextInput,
    ActivityIndicator,
    FlatList,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { validateTicket } from "../api/tickets";

interface ValidationResult {
    ticket_id: string;
    status: string;
    message: string;
    event_name: string;
    timestamp: string;
}

export default function AdminTicketValidationScreen() {
    const { user } = useAuth();
    const [ticketCode, setTicketCode] = useState("");
    const [validating, setValidating] = useState(false);
    const [validationHistory, setValidationHistory] = useState<ValidationResult[]>([]);
    const [lastResult, setLastResult] = useState<ValidationResult | null>(null);

    const handleValidateTicket = async () => {
        if (!ticketCode.trim()) {
            Alert.alert("Error", "Ingresa un código de boleto");
            return;
        }

        try {
            setValidating(true);
            const result = await validateTicket(ticketCode);
            const resultWithTime: ValidationResult = {
                ...result,
                timestamp: new Date().toLocaleTimeString('es-ES'),
            };
            setLastResult(resultWithTime);
            setValidationHistory([resultWithTime, ...validationHistory]);
            setTicketCode("");
            Alert.alert("✓ Éxito", `Boleto validado: ${result.message}`);
        } catch (error: any) {
            const errorMsg = error.response?.data?.error?.message || "Error validando boleto";
            setLastResult(null);
            Alert.alert("✗ Error", errorMsg);
        } finally {
            setValidating(false);
        }
    };

    const clearHistory = () => {
        Alert.alert("Confirmar", "¿Limpiar historial de validaciones?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Limpiar",
                style: "destructive",
                onPress: () => {
                    setValidationHistory([]);
                    setLastResult(null);
                },
            },
        ]);
    };

    const renderHistoryItem = ({ item }: { item: ValidationResult }) => (
        <View style={[styles.historyItem, getStatusStyle(item.status)]}>
            <View style={styles.historyHeader}>
                <Text style={styles.historyTime}>{item.timestamp}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusBadgeText}>{item.status}</Text>
                </View>
            </View>
            <Text style={styles.historyEvent}>{item.event_name}</Text>
            <Text style={styles.historyCode}>Código: {item.ticket_code}</Text>
            <Text style={styles.historyMessage}>{item.message}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>✓ Validar Boletos</Text>
                <Text style={styles.subtitle}>Escanea boletos en la entrada</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Sección de Entrada */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Escanear Boleto</Text>

                    <TextInput
                        style={styles.codeInput}
                        placeholder="Ingresa o escanea código TCK-..."
                        value={ticketCode}
                        onChangeText={setTicketCode}
                        placeholderTextColor="#999"
                        editable={!validating}
                        autoCapitalize="characters"
                    />

                    <TouchableOpacity
                        style={[styles.validateButton, validating && styles.validateButtonDisabled]}
                        onPress={handleValidateTicket}
                        disabled={validating}
                    >
                        <Text style={styles.validateButtonText}>
                            {validating ? "Validando..." : "✓ Validar Boleto"}
                        </Text>
                    </TouchableOpacity>

                    {validating && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#007AFF" />
                            <Text style={styles.loadingText}>Procesando...</Text>
                        </View>
                    )}
                </View>

                {/* Último Resultado */}
                {lastResult && (
                    <View style={[styles.section, styles.resultSection]}>
                        <Text style={styles.sectionTitle}>Resultado</Text>

                        <View
                            style={[
                                styles.resultCard,
                                {
                                    borderLeftColor:
                                        lastResult.status === "USED" ? "#34C759" : "#FF3B30",
                                },
                            ]}
                        >
                            <View style={styles.resultHeader}>
                                <Text style={styles.resultTitle}>{lastResult.event_name}</Text>
                                <View
                                    style={[
                                        styles.resultStatusBadge,
                                        {
                                            backgroundColor: getStatusColor(lastResult.status),
                                        },
                                    ]}
                                >
                                    <Text style={styles.resultStatusText}>{lastResult.status}</Text>
                                </View>
                            </View>

                            <Text style={styles.resultMessage}>{lastResult.message}</Text>

                            <View style={styles.resultDetails}>
                                <View style={styles.resultDetailRow}>
                                    <Text style={styles.resultDetailLabel}>ID Boleto:</Text>
                                    <Text style={styles.resultDetailValue}>{lastResult.ticket_id}</Text>
                                </View>
                                <View style={styles.resultDetailRow}>
                                    <Text style={styles.resultDetailLabel}>Validado:</Text>
                                    <Text style={styles.resultDetailValue}>{lastResult.timestamp}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Historial */}
                <View style={styles.section}>
                    <View style={styles.historyHeader2}>
                        <Text style={styles.sectionTitle}>Historial de Validaciones</Text>
                        {validationHistory.length > 0 && (
                            <TouchableOpacity onPress={clearHistory}>
                                <Text style={styles.clearButton}>Limpiar</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {validationHistory.length === 0 ? (
                        <Text style={styles.emptyText}>
                            No hay validaciones aún. Comienza escaneando boletos.
                        </Text>
                    ) : (
                        <FlatList
                            data={validationHistory}
                            keyExtractor={(item, index) => `${item.ticket_id}-${index}`}
                            renderItem={renderHistoryItem}
                            scrollEnabled={false}
                            nestedScrollEnabled={false}
                        />
                    )}
                </View>

                {/* Info */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>💡 Información</Text>
                    <Text style={styles.infoText}>
                        • Escanea el código QR o ingresa manualmente el código
                    </Text>
                    <Text style={styles.infoText}>
                        • Los boletos se marcan como USED al validar
                    </Text>
                    <Text style={styles.infoText}>
                        • No puedes validar el mismo boleto dos veces
                    </Text>
                    <Text style={styles.infoText}>
                        • El historial se mantiene durante la sesión
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const getStatusColor = (status: string) => {
    switch (status) {
        case "USED":
            return "#34C759";
        case "VALID":
            return "#007AFF";
        default:
            return "#FF3B30";
    }
};

const getStatusStyle = (status: string) => {
    switch (status) {
        case "USED":
            return { borderLeftColor: "#34C759" };
        case "VALID":
            return { borderLeftColor: "#007AFF" };
        default:
            return { borderLeftColor: "#FF3B30" };
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: "#999",
    },
    content: {
        flex: 1,
        paddingVertical: 12,
    },
    section: {
        backgroundColor: "#fff",
        marginHorizontal: 12,
        marginVertical: 8,
        borderRadius: 12,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 12,
        color: "#333",
    },
    codeInput: {
        borderWidth: 2,
        borderColor: "#ddd",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 14,
        fontSize: 16,
        backgroundColor: "#f9f9f9",
        fontFamily: "monospace",
        marginBottom: 12,
    },
    validateButton: {
        backgroundColor: "#34C759",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    validateButtonDisabled: {
        opacity: 0.6,
    },
    validateButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
    },
    loadingText: {
        fontSize: 14,
        color: "#007AFF",
        marginLeft: 8,
        fontWeight: "500",
    },
    resultSection: {
        borderLeftWidth: 4,
        borderLeftColor: "#34C759",
    },
    resultCard: {
        backgroundColor: "#f9f9f9",
        padding: 14,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: "#34C759",
    },
    resultHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    resultTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
        flex: 1,
    },
    resultStatusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    resultStatusText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "bold",
    },
    resultMessage: {
        fontSize: 14,
        color: "#333",
        marginBottom: 10,
        fontWeight: "500",
    },
    resultDetails: {
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
        paddingTop: 10,
    },
    resultDetailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    resultDetailLabel: {
        fontSize: 12,
        color: "#666",
    },
    resultDetailValue: {
        fontSize: 12,
        color: "#333",
        fontWeight: "bold",
        flex: 1,
        textAlign: "right",
    },
    historyHeader2: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    clearButton: {
        fontSize: 12,
        color: "#FF3B30",
        fontWeight: "bold",
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    historyItem: {
        backgroundColor: "#f9f9f9",
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 3,
    },
    historyHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    historyTime: {
        fontSize: 11,
        color: "#999",
        fontWeight: "500",
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    statusBadgeText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "bold",
    },
    historyEvent: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    historyCode: {
        fontSize: 11,
        color: "#666",
        marginBottom: 4,
        fontFamily: "monospace",
    },
    historyMessage: {
        fontSize: 12,
        color: "#666",
        fontStyle: "italic",
    },
    emptyText: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
        paddingVertical: 20,
        fontStyle: "italic",
    },
    infoSection: {
        backgroundColor: "#E3F2FD",
        marginHorizontal: 12,
        marginVertical: 12,
        marginBottom: 20,
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: "#007AFF",
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#1976D2",
        marginBottom: 8,
    },
    infoText: {
        fontSize: 12,
        color: "#1565C0",
        marginBottom: 4,
        lineHeight: 18,
    },
});
