import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    TextInput,
    RefreshControl,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { fetchEvents } from "../api/events";
import { fetchEventAnalytics } from "../api/admin";
import { validateTicket } from "../api/tickets";
import { fetchOrderById, reserveOrder, confirmOrder } from "../api/orders";
import type { EventSummary, Order } from "../types/api";
import type { EventAnalytics } from "../api/admin";

export default function AdminDashboardScreen() {
    const { user, isLoading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<"events" | "validate" | "orders">(
        "events"
    );
    const [events, setEvents] = useState<EventSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Validación de tickets
    const [ticketCode, setTicketCode] = useState("");
    const [validationResult, setValidationResult] = useState<any>(null);
    const [validating, setValidating] = useState(false);

    // Búsqueda de órdenes
    const [orderId, setOrderId] = useState("");
    const [orderData, setOrderData] = useState<Order | null>(null);
    const [orderLoading, setOrderLoading] = useState(false);

    // Cargar eventos
    const loadEvents = async () => {
        try {
            setLoading(true);
            const { events } = await fetchEvents(1, 50);
            setEvents(events);
        } catch (error) {
            Alert.alert("Error", "No se pudieron cargar los eventos");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Cargar analíticas de evento
    const loadAnalytics = async (eventId: string) => {
        if (!user || user.role !== "ADMIN") {
            Alert.alert("Acceso denegado", "Solo admins pueden ver analíticas");
            return;
        }

        try {
            setAnalyticsLoading(true);
            setSelectedEventId(eventId);
            const data = await fetchEventAnalytics(eventId);
            setAnalytics(data);
        } catch (error) {
            Alert.alert("Error", "No se pudieron cargar las analíticas");
            console.error(error);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    // Validar ticket
    const handleValidateTicket = async () => {
        if (!ticketCode.trim()) {
            Alert.alert("Error", "Ingresa un código de boleto");
            return;
        }

        try {
            setValidating(true);
            const result = await validateTicket(ticketCode);
            setValidationResult(result);
            Alert.alert("Éxito", `Boleto validado: ${result.message}`);
            setTicketCode("");
        } catch (error: any) {
            const errorMsg =
                error.response?.data?.error || "Error validando boleto";
            Alert.alert("Error", errorMsg);
            setValidationResult(null);
        } finally {
            setValidating(false);
        }
    };

    // Obtener orden por ID
    const handleFetchOrder = async () => {
        if (!orderId.trim()) {
            Alert.alert("Error", "Ingresa un ID de orden");
            return;
        }

        try {
            setOrderLoading(true);
            const order = await fetchOrderById(orderId);
            setOrderData(order);
        } catch (error: any) {
            const errorMsg =
                error.response?.data?.error || "Error obteniendo la orden";
            Alert.alert("Error", errorMsg);
            setOrderData(null);
        } finally {
            setOrderLoading(false);
        }
    };

    // Confirmar orden
    const handleConfirmOrder = async () => {
        if (!orderData) {
            Alert.alert("Error", "Primero selecciona una orden");
            return;
        }

        try {
            setOrderLoading(true);
            const confirmed = await confirmOrder(orderData.id);
            Alert.alert("Éxito", "Orden confirmada");
            setOrderData(null);
            setOrderId("");
        } catch (error: any) {
            const errorMsg =
                error.response?.data?.error || "Error confirmando la orden";
            Alert.alert("Error", errorMsg);
        } finally {
            setOrderLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadEvents();
        setRefreshing(false);
    };

    useEffect(() => {
        loadEvents();
    }, []);

    if (authLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Dashboard</Text>
                {user && (
                    <Text style={styles.subtitle}>
                        Bienvenido, {user.full_name} ({user.role})
                    </Text>
                )}
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {["events", "validate", "orders"].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.tab,
                            activeTab === tab && styles.tabActive,
                        ]}
                        onPress={() => setActiveTab(tab as any)}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === tab && styles.tabTextActive,
                            ]}
                        >
                            {tab === "events"
                                ? "Eventos"
                                : tab === "validate"
                                ? "Validar"
                                : "Órdenes"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Tab: Eventos y Analíticas */}
            {activeTab === "events" && (
                <View style={styles.tabContent}>
                    {loading ? (
                        <ActivityIndicator
                            size="large"
                            color="#0000ff"
                            style={{ marginTop: 20 }}
                        />
                    ) : events.length === 0 ? (
                        <Text style={styles.emptyText}>No hay eventos</Text>
                    ) : (
                        events.map((event) => (
                            <View key={event.id} style={styles.eventCard}>
                                <View style={styles.eventHeader}>
                                    <View>
                                        <Text style={styles.eventTitle}>
                                            {event.title}
                                        </Text>
                                        <Text style={styles.eventStatus}>
                                            Estado: {event.status}
                                        </Text>
                                    </View>
                                </View>

                                {user?.role === "ADMIN" && (
                                    <>
                                        <TouchableOpacity
                                            style={styles.analyticsButton}
                                            onPress={() =>
                                                loadAnalytics(event.id)
                                            }
                                            disabled={analyticsLoading}
                                        >
                                            <Text
                                                style={
                                                    styles.analyticsButtonText
                                                }
                                            >
                                                {analyticsLoading &&
                                                selectedEventId === event.id
                                                    ? "Cargando..."
                                                    : "Ver Analíticas"}
                                            </Text>
                                        </TouchableOpacity>

                                        {selectedEventId === event.id &&
                                            analytics && (
                                                <View
                                                    style={
                                                        styles.analyticsCard
                                                    }
                                                >
                                                    <Text
                                                        style={
                                                            styles.analyticsTitle
                                                        }
                                                    >
                                                        Analíticas
                                                    </Text>
                                                    <View
                                                        style={
                                                            styles.analyticsRow
                                                        }
                                                    >
                                                        <Text
                                                            style={
                                                                styles.analyticsLabel
                                                            }
                                                        >
                                                            Ingresos:
                                                        </Text>
                                                        <Text
                                                            style={
                                                                styles.analyticsValue
                                                            }
                                                        >
                                                            ${analytics.total_revenue.toFixed(2)}
                                                        </Text>
                                                    </View>
                                                    <View
                                                        style={
                                                            styles.analyticsRow
                                                        }
                                                    >
                                                        <Text
                                                            style={
                                                                styles.analyticsLabel
                                                            }
                                                        >
                                                            Boletos Vendidos:
                                                        </Text>
                                                        <Text
                                                            style={
                                                                styles.analyticsValue
                                                            }
                                                        >
                                                            {
                                                                analytics.tickets_sold
                                                            }
                                                        </Text>
                                                    </View>
                                                    <View
                                                        style={
                                                            styles.analyticsRow
                                                        }
                                                    >
                                                        <Text
                                                            style={
                                                                styles.analyticsLabel
                                                            }
                                                        >
                                                            Boletos Restantes:
                                                        </Text>
                                                        <Text
                                                            style={
                                                                styles.analyticsValue
                                                            }
                                                        >
                                                            {
                                                                analytics.tickets_remaining
                                                            }
                                                        </Text>
                                                    </View>
                                                    <View
                                                        style={
                                                            styles.analyticsRow
                                                        }
                                                    >
                                                        <Text
                                                            style={
                                                                styles.analyticsLabel
                                                            }
                                                        >
                                                            Ocupación:
                                                        </Text>
                                                        <Text
                                                            style={
                                                                styles.analyticsValue
                                                            }
                                                        >
                                                            {(
                                                                analytics.occupancy_rate *
                                                                100
                                                            ).toFixed(1)}
                                                            %
                                                        </Text>
                                                    </View>
                                                </View>
                                            )}
                                    </>
                                )}
                            </View>
                        ))
                    )}
                </View>
            )}

            {/* Tab: Validar Ticket */}
            {activeTab === "validate" && (
                <View style={styles.tabContent}>
                    <Text style={styles.sectionTitle}>
                        Validar Boleto (Escanear Entrada)
                    </Text>
                    <Text style={styles.description}>
                        Ingresa el código del boleto para validarlo en la
                        entrada
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Código de boleto (TCK-...)"
                        value={ticketCode}
                        onChangeText={setTicketCode}
                        placeholderTextColor="#999"
                    />

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleValidateTicket}
                        disabled={validating}
                    >
                        <Text style={styles.primaryButtonText}>
                            {validating ? "Validando..." : "Validar Boleto"}
                        </Text>
                    </TouchableOpacity>

                    {validationResult && (
                        <View style={styles.resultCard}>
                            <Text style={styles.resultTitle}>
                                Resultado de Validación
                            </Text>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>
                                    Boleto ID:
                                </Text>
                                <Text style={styles.resultValue}>
                                    {validationResult.ticket_id}
                                </Text>
                            </View>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Estado:</Text>
                                <Text style={styles.resultValue}>
                                    {validationResult.status}
                                </Text>
                            </View>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Evento:</Text>
                                <Text style={styles.resultValue}>
                                    {validationResult.event_name}
                                </Text>
                            </View>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Mensaje:</Text>
                                <Text style={styles.resultValue}>
                                    {validationResult.message}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            )}

            {/* Tab: Órdenes */}
            {activeTab === "orders" && (
                <View style={styles.tabContent}>
                    <Text style={styles.sectionTitle}>Consultar Órdenes</Text>
                    <Text style={styles.description}>
                        Busca y gestiona órdenes de boletos
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="ID de la orden (UUID)"
                        value={orderId}
                        onChangeText={setOrderId}
                        placeholderTextColor="#999"
                    />

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleFetchOrder}
                        disabled={orderLoading}
                    >
                        <Text style={styles.primaryButtonText}>
                            {orderLoading ? "Buscando..." : "Buscar Orden"}
                        </Text>
                    </TouchableOpacity>

                    {orderData && (
                        <View style={styles.resultCard}>
                            <Text style={styles.resultTitle}>
                                Detalles de la Orden
                            </Text>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>ID:</Text>
                                <Text style={styles.resultValue}>
                                    {orderData.id}
                                </Text>
                            </View>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Estado:</Text>
                                <Text style={styles.resultValue}>
                                    {orderData.status}
                                </Text>
                            </View>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Total:</Text>
                                <Text style={styles.resultValue}>
                                    ${typeof orderData.total_amount === 'string' 
                                        ? parseFloat(orderData.total_amount).toFixed(2) 
                                        : (orderData.total_amount as number).toFixed(2)}
                                </Text>
                            </View>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Boletos:</Text>
                                <Text style={styles.resultValue}>
                                    {orderData.items?.length || 0}
                                </Text>
                            </View>

                            {orderData.status === "PENDING" && (
                                <TouchableOpacity
                                    style={styles.confirmButton}
                                    onPress={handleConfirmOrder}
                                    disabled={orderLoading}
                                >
                                    <Text
                                        style={
                                            styles.confirmButtonText
                                        }
                                    >
                                        Confirmar Pago
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Info sobre reservas */}
                    <View style={styles.infoCard}>
                        <Text style={styles.infoTitle}>Flujo de Órdenes</Text>
                        <Text style={styles.infoText}>
                            1. Reserve: Crea una reserva temporal (10 min)
                        </Text>
                        <Text style={styles.infoText}>
                            2. Confirm: Confirma el pago y emite boletos
                        </Text>
                        <Text style={styles.infoText}>
                            3. Get: Consulta el estado de la orden
                        </Text>
                    </View>
                </View>
            )}

            {/* Footer con resumen de endpoints */}
            <View style={styles.footer}>
                <Text style={styles.footerTitle}>Endpoints Disponibles</Text>
                <Text style={styles.footerText}>
                    ✓ GET /events - Listar eventos
                </Text>
                <Text style={styles.footerText}>
                    ✓ GET /events/(id) - Detalle del evento
                </Text>
                <Text style={styles.footerText}>
                    ✓ GET /admin/events/(id)/analytics - Analíticas
                </Text>
                <Text style={styles.footerText}>
                    ✓ POST /orders/reserve - Reservar boletos
                </Text>
                <Text style={styles.footerText}>
                    ✓ POST /orders/(id)/confirm - Confirmar orden
                </Text>
                <Text style={styles.footerText}>
                    ✓ GET /orders/(id) - Obtener orden
                </Text>
                <Text style={styles.footerText}>
                    ✓ POST /tickets/validate - Validar boleto
                </Text>
                <Text style={styles.footerText}>
                    ✓ POST /auth/login - Iniciar sesión
                </Text>
                <Text style={styles.footerText}>
                    ✓ POST /auth/register - Registrarse
                </Text>
                <Text style={styles.footerText}>
                    ✓ GET /auth/me - Perfil del usuario
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
    },
    tabsContainer: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        borderBottomWidth: 3,
        borderBottomColor: "transparent",
    },
    tabActive: {
        borderBottomColor: "#007AFF",
    },
    tabText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    tabTextActive: {
        color: "#007AFF",
        fontWeight: "bold",
    },
    tabContent: {
        padding: 20,
        minHeight: 400,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 10,
    },
    description: {
        fontSize: 14,
        color: "#666",
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 15,
        fontSize: 14,
        backgroundColor: "#fff",
    },
    primaryButton: {
        backgroundColor: "#007AFF",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 20,
    },
    primaryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    confirmButton: {
        backgroundColor: "#34C759",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 15,
    },
    confirmButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
    eventCard: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        borderLeftWidth: 4,
        borderLeftColor: "#007AFF",
    },
    eventHeader: {
        marginBottom: 15,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    eventStatus: {
        fontSize: 12,
        color: "#666",
    },
    analyticsButton: {
        backgroundColor: "#FF9500",
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: "center",
        marginTop: 10,
    },
    analyticsButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
    analyticsCard: {
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    analyticsTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    analyticsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    analyticsLabel: {
        fontSize: 12,
        color: "#666",
    },
    analyticsValue: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#333",
    },
    resultCard: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 15,
        marginTop: 15,
        borderWidth: 1,
        borderColor: "#34C759",
    },
    resultTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 12,
        color: "#333",
    },
    resultRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    resultLabel: {
        fontSize: 13,
        color: "#666",
        fontWeight: "500",
    },
    resultValue: {
        fontSize: 13,
        color: "#333",
        fontWeight: "bold",
        flex: 1,
        textAlign: "right",
    },
    infoCard: {
        backgroundColor: "#E3F2FD",
        borderRadius: 8,
        padding: 15,
        marginTop: 20,
        borderLeftWidth: 4,
        borderLeftColor: "#007AFF",
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#1976D2",
    },
    infoText: {
        fontSize: 12,
        color: "#1565C0",
        marginBottom: 5,
    },
    emptyText: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
        marginTop: 20,
    },
    footer: {
        backgroundColor: "#f9f9f9",
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
        marginTop: 20,
    },
    footerTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    footerText: {
        fontSize: 12,
        color: "#666",
        marginBottom: 5,
        lineHeight: 18,
    },
});
