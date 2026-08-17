import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    FlatList,
    RefreshControl,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { fetchEvents } from "../api/events";
import { fetchEventAnalytics } from "../api/admin";
import type { EventSummary } from "../types/api";
import type { EventAnalytics } from "../api/admin";

export default function AdminAnalyticsScreen() {
    const { user } = useAuth();
    const [events, setEvents] = useState<EventSummary[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const { events: data } = await fetchEvents(1, 100, "PUBLISHED");
            setEvents(data);
            if (data.length > 0 && !selectedEventId) {
                setSelectedEventId(data[0].id);
                await loadAnalytics(data[0].id);
            }
        } catch (error) {
            Alert.alert("Error", "No se pudieron cargar los eventos");
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadAnalytics = async (eventId: string) => {
        if (!user || user.role !== "ADMIN") {
            Alert.alert("Acceso denegado", "Solo admins pueden ver analíticas");
            return;
        }

        try {
            setAnalyticsLoading(true);
            const data = await fetchEventAnalytics(eventId);
            setAnalytics(data);
            setSelectedEventId(eventId);
        } catch (error) {
            Alert.alert("Error", "No se pudieron cargar las analíticas");
            console.error(error);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadEvents();
    };

    useEffect(() => {
        loadEvents();
    }, []);

    const renderEventItem = ({ item: event }: { item: EventSummary }) => (
        <TouchableOpacity
            style={[
                styles.eventItem,
                selectedEventId === event.id && styles.eventItemActive,
            ]}
            onPress={() => loadAnalytics(event.id)}
        >
            <Text style={styles.eventItemText}>{event.title}</Text>
            {selectedEventId === event.id && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
    );

    const getMetricCard = (label: string, value: string | number, unit: string = "", color: string = "#007AFF") => (
        <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: color }]} />
            <View style={styles.metricContent}>
                <Text style={styles.metricLabel}>{label}</Text>
                <Text style={styles.metricValue}>
                    {value} <Text style={styles.metricUnit}>{unit}</Text>
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📊 Analíticas</Text>
                <Text style={styles.subtitle}>Métricas de eventos en tiempo real</Text>
            </View>

            {loading ? (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : (
                <ScrollView
                    style={styles.content}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {/* Selector de Evento */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Selecciona un Evento</Text>
                        <FlatList
                            data={events}
                            keyExtractor={(item) => item.id}
                            renderItem={renderEventItem}
                            scrollEnabled={false}
                            nestedScrollEnabled={true}
                        />
                    </View>

                    {/* Analíticas */}
                    {analyticsLoading ? (
                        <View style={styles.centerContent}>
                            <ActivityIndicator size="large" color="#007AFF" />
                        </View>
                    ) : analytics ? (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{analytics.event_name}</Text>

                            {/* Métricas Principales */}
                            <View style={styles.metricsGrid}>
                                {getMetricCard(
                                    "Ingresos Totales",
                                    `$${analytics.total_revenue.toFixed(2)}`,
                                    "",
                                    "#34C759"
                                )}
                                {getMetricCard(
                                    "Boletos Vendidos",
                                    analytics.tickets_sold,
                                    "unidades",
                                    "#007AFF"
                                )}
                                {getMetricCard(
                                    "Boletos Disponibles",
                                    analytics.tickets_remaining,
                                    "unidades",
                                    "#FF9500"
                                )}
                                {getMetricCard(
                                    "Capacidad Total",
                                    analytics.event_capacity,
                                    "lugares",
                                    "#8E8E93"
                                )}
                            </View>

                            {/* Ocupación */}
                            <View style={styles.occupancySection}>
                                <Text style={styles.occupancyLabel}>Tasa de Ocupación</Text>
                                <View style={styles.occupancyBar}>
                                    <View
                                        style={[
                                            styles.occupancyFill,
                                            {
                                                width: `${analytics.occupancy_rate * 100}%`,
                                                backgroundColor: getOccupancyColor(analytics.occupancy_rate),
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.occupancyPercent}>
                                    {(analytics.occupancy_rate * 100).toFixed(1)}%
                                </Text>
                            </View>

                            {/* Detalles */}
                            <View style={styles.detailsCard}>
                                <Text style={styles.detailsTitle}>Resumen Detallado</Text>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Evento:</Text>
                                    <Text style={styles.detailValue}>{analytics.event_name}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Ingresos:</Text>
                                    <Text style={styles.detailValue}>
                                        ${analytics.total_revenue.toFixed(2)}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Vendidos:</Text>
                                    <Text style={styles.detailValue}>
                                        {analytics.tickets_sold} de {analytics.event_capacity}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Disponibles:</Text>
                                    <Text style={styles.detailValue}>
                                        {analytics.tickets_remaining}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Ocupación:</Text>
                                    <Text style={styles.detailValue}>
                                        {(analytics.occupancy_rate * 100).toFixed(1)}%
                                    </Text>
                                </View>

                                {analytics.tickets_sold > 0 && (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Precio Promedio:</Text>
                                        <Text style={styles.detailValue}>
                                            ${(analytics.total_revenue / analytics.tickets_sold).toFixed(2)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ) : (
                        <View style={styles.centerContent}>
                            <Text style={styles.emptyText}>Selecciona un evento para ver analíticas</Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const getOccupancyColor = (rate: number) => {
    if (rate >= 0.8) return "#34C759"; // Verde
    if (rate >= 0.5) return "#FF9500"; // Naranja
    return "#FF3B30"; // Rojo
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
    },
    section: {
        backgroundColor: "#fff",
        marginHorizontal: 12,
        marginVertical: 12,
        borderRadius: 12,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 12,
        color: "#333",
    },
    eventItem: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        marginBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    eventItemActive: {
        backgroundColor: "#E3F2FD",
        borderColor: "#007AFF",
    },
    eventItemText: {
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
        flex: 1,
    },
    checkmark: {
        fontSize: 18,
        color: "#007AFF",
        fontWeight: "bold",
    },
    metricsGrid: {
        marginVertical: 12,
    },
    metricCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
    },
    metricIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        marginRight: 12,
    },
    metricContent: {
        flex: 1,
    },
    metricLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    metricUnit: {
        fontSize: 11,
        color: "#999",
        fontWeight: "normal",
    },
    occupancySection: {
        backgroundColor: "#f9f9f9",
        padding: 12,
        borderRadius: 8,
        marginVertical: 12,
    },
    occupancyLabel: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    occupancyBar: {
        height: 10,
        backgroundColor: "#e0e0e0",
        borderRadius: 5,
        overflow: "hidden",
        marginBottom: 8,
    },
    occupancyFill: {
        height: "100%",
        borderRadius: 5,
    },
    occupancyPercent: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        textAlign: "right",
    },
    detailsCard: {
        backgroundColor: "#f9f9f9",
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: "#007AFF",
    },
    detailsTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    detailLabel: {
        fontSize: 12,
        color: "#666",
        fontWeight: "500",
    },
    detailValue: {
        fontSize: 12,
        color: "#333",
        fontWeight: "bold",
    },
    centerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
    },
});
