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
    FlatList,
    RefreshControl,
    Switch,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { fetchEvents } from "../api/events";
import type { EventSummary } from "../types/api";

export default function AdminEventsScreen() {
    const { user } = useAuth();
    const [events, setEvents] = useState<EventSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<"ALL" | "PUBLISHED" | "DRAFT" | "CANCELLED">("ALL");
    const [page, setPage] = useState(1);
    const limit = 20;

    const statuses: Array<"ALL" | "PUBLISHED" | "DRAFT" | "CANCELLED"> = ["ALL", "PUBLISHED", "DRAFT", "CANCELLED"];

    const loadEvents = async (pageNum = 1) => {
        try {
            setLoading(pageNum === 1);
            const { events: data } = await fetchEvents(
                pageNum,
                limit,
                selectedStatus === "ALL" ? undefined : selectedStatus,
                searchText || undefined
            );
            if (pageNum === 1) {
                setEvents(data);
            } else {
                setEvents([...events, ...data]);
            }
            setPage(pageNum);
        } catch (error) {
            Alert.alert("Error", "No se pudieron cargar los eventos");
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        setPage(1);
        await loadEvents(1);
    };

    const handleStatusChange = (status: typeof selectedStatus) => {
        setSelectedStatus(status);
        setPage(1);
    };

    const handleLoadMore = () => {
        loadEvents(page + 1);
    };

    useEffect(() => {
        loadEvents(1);
    }, [selectedStatus, searchText]);

    const filteredCount = events.length;

    const renderEventCard = ({ item: event }: { item: EventSummary }) => (
        <View style={styles.eventCard}>
            <View style={styles.eventCardHeader}>
                <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventVenue}>{event.venue}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
                    <Text style={styles.statusText}>{event.status}</Text>
                </View>
            </View>

            <View style={styles.eventDetails}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Inicio:</Text>
                    <Text style={styles.detailValue}>
                        {new Date(event.start_date).toLocaleDateString('es-ES')}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Stock:</Text>
                    <Text style={styles.detailValue}>{event.total_available_stock} boletos</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Precio desde:</Text>
                    <Text style={styles.detailValue}>${event.min_price}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📍 Eventos</Text>
                <Text style={styles.subtitle}>Gestiona todos tus eventos</Text>
            </View>

            {/* Búsqueda */}
            <View style={styles.searchSection}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar evento..."
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholderTextColor="#999"
                />
            </View>

            {/* Filtros de Estado */}
            <ScrollView horizontal style={styles.filterBar} showsHorizontalScrollIndicator={false}>
                {statuses.map((status) => (
                    <TouchableOpacity
                        key={status}
                        style={[
                            styles.filterButton,
                            selectedStatus === status && styles.filterButtonActive,
                        ]}
                        onPress={() => handleStatusChange(status)}
                    >
                        <Text
                            style={[
                                styles.filterButtonText,
                                selectedStatus === status && styles.filterButtonTextActive,
                            ]}
                        >
                            {status === "ALL" ? "Todos" : status}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Lista de Eventos */}
            {loading && filteredCount === 0 ? (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : events.length === 0 ? (
                <View style={styles.centerContent}>
                    <Text style={styles.emptyText}>No hay eventos que coincidan</Text>
                </View>
            ) : (
                <FlatList
                    data={events}
                    keyExtractor={(item) => item.id}
                    renderItem={renderEventCard}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.1}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    contentContainerStyle={styles.listContent}
                />
            )}

            <View style={styles.footer}>
                <Text style={styles.footerText}>Total: {filteredCount} eventos</Text>
            </View>
        </View>
    );
}

const getStatusColor = (status: string) => {
    switch (status) {
        case "PUBLISHED":
            return "#34C759";
        case "DRAFT":
            return "#FF9500";
        case "CANCELLED":
            return "#FF3B30";
        case "COMPLETED":
            return "#8E8E93";
        default:
            return "#007AFF";
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
    searchSection: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
    },
    searchInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        backgroundColor: "#f9f9f9",
    },
    filterBar: {
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    filterButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: "#f0f0f0",
        borderWidth: 1,
        borderColor: "#ddd",
    },
    filterButtonActive: {
        backgroundColor: "#007AFF",
        borderColor: "#007AFF",
    },
    filterButtonText: {
        fontSize: 12,
        color: "#666",
        fontWeight: "500",
    },
    filterButtonTextActive: {
        color: "#fff",
    },
    listContent: {
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    eventCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: "#007AFF",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    eventCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
        color: "#333",
    },
    eventVenue: {
        fontSize: 12,
        color: "#666",
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    statusText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "bold",
    },
    eventDetails: {
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        paddingTop: 12,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 12,
        color: "#999",
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
        fontSize: 16,
        color: "#999",
        textAlign: "center",
    },
    footer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
        alignItems: "center",
    },
    footerText: {
        fontSize: 12,
        color: "#999",
        fontWeight: "500",
    },
});
