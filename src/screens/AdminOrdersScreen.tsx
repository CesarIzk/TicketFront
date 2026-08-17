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
import { fetchOrderById, confirmOrder } from "../api/orders";
import type { Order } from "../types/api";

export default function AdminOrdersScreen() {
    const { user } = useAuth();
    const [orderId, setOrderId] = useState("");
    const [orderData, setOrderData] = useState<Order | null>(null);
    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [searchHistory, setSearchHistory] = useState<Order[]>([]);

    const handleFetchOrder = async () => {
        if (!orderId.trim()) {
            Alert.alert("Error", "Ingresa un ID de orden");
            return;
        }

        try {
            setLoading(true);
            const order = await fetchOrderById(orderId);
            setOrderData(order);
            if (!searchHistory.find((o) => o.id === order.id)) {
                setSearchHistory([order, ...searchHistory.slice(0, 9)]);
            }
        } catch (error: any) {
            const errorMsg =
                error.response?.data?.error?.message || "Error obteniendo la orden";
            Alert.alert("Error", errorMsg);
            setOrderData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmOrder = async () => {
        if (!orderData) {
            Alert.alert("Error", "Primero selecciona una orden");
            return;
        }

        Alert.alert(
            "Confirmar Pago",
            `¿Confirmar pago de la orden ${orderData.id.slice(0, 8)}...?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Confirmar",
                    style: "default",
                    onPress: async () => {
                        try {
                            setConfirming(true);
                            await confirmOrder(orderData.id);
                            Alert.alert("✓ Éxito", "Orden confirmada. Boletos emitidos.");
                            setOrderData(null);
                            setOrderId("");
                        } catch (error: any) {
                            const errorMsg =
                                error.response?.data?.error?.message ||
                                "Error confirmando la orden";
                            Alert.alert("Error", errorMsg);
                        } finally {
                            setConfirming(false);
                        }
                    },
                },
            ]
        );
    };

    const renderHistoryItem = ({ item }: { item: Order }) => (
        <TouchableOpacity
            style={styles.historyItem}
            onPress={() => {
                setOrderData(item);
                setOrderId(item.id);
            }}
        >
            <View style={styles.historyLeft}>
                <Text style={styles.historyOrderId}>
                    {item.id.slice(0, 8)}...
                </Text>
                <Text style={styles.historyStatus}>{item.status}</Text>
            </View>
            <View style={styles.historyRight}>
                <Text style={styles.historyAmount}>
                    ${typeof item.total_amount === "string"
                        ? parseFloat(item.total_amount).toFixed(2)
                        : (item.total_amount as number).toFixed(2)}
                </Text>
                <Text style={styles.historyItems}>{item.items?.length || 0} items</Text>
            </View>
        </TouchableOpacity>
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "#FF9500";
            case "PAID":
            case "CONFIRMED":
                return "#34C759";
            case "EXPIRED":
                return "#FF3B30";
            case "CANCELLED":
                return "#8E8E93";
            default:
                return "#007AFF";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "PENDING":
                return "Pendiente de Pago";
            case "PAID":
                return "Pagada";
            case "CONFIRMED":
                return "Confirmada";
            case "EXPIRED":
                return "Expirada";
            case "CANCELLED":
                return "Cancelada";
            default:
                return status;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📦 Órdenes</Text>
                <Text style={styles.subtitle}>Gestión de órdenes de compra</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Sección de Búsqueda */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Buscar Orden</Text>

                    <TextInput
                        style={styles.searchInput}
                        placeholder="Ingresa ID de la orden (UUID)"
                        value={orderId}
                        onChangeText={setOrderId}
                        placeholderTextColor="#999"
                    />

                    <TouchableOpacity
                        style={[styles.searchButton, loading && styles.buttonDisabled]}
                        onPress={handleFetchOrder}
                        disabled={loading}
                    >
                        <Text style={styles.searchButtonText}>
                            {loading ? "Buscando..." : "🔍 Buscar Orden"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Detalles de la Orden */}
                {orderData && (
                    <View style={styles.section}>
                        <View style={styles.orderHeader}>
                            <View>
                                <Text style={styles.orderTitle}>Detalles de la Orden</Text>
                                <Text style={styles.orderId}>{orderData.id}</Text>
                            </View>
                            <View
                                style={[
                                    styles.orderStatusBadge,
                                    { backgroundColor: getStatusColor(orderData.status) },
                                ]}
                            >
                                <Text style={styles.orderStatusText}>
                                    {getStatusLabel(orderData.status)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.orderDetailsCard}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Estado:</Text>
                                <Text style={styles.detailValue}>{orderData.status}</Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Total:</Text>
                                <Text style={[styles.detailValue, styles.detailAmount]}>
                                    ${typeof orderData.total_amount === "string"
                                        ? parseFloat(orderData.total_amount).toFixed(2)
                                        : (orderData.total_amount as number).toFixed(2)}
                                </Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Cantidad de Ítems:</Text>
                                <Text style={styles.detailValue}>
                                    {orderData.items?.length || 0}
                                </Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Creada:</Text>
                                <Text style={styles.detailValue}>
                                    {new Date(orderData.created_at).toLocaleString("es-ES")}
                                </Text>
                            </View>

                            {orderData.expires_at && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Expira:</Text>
                                    <Text style={styles.detailValue}>
                                        {new Date(orderData.expires_at).toLocaleString("es-ES")}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Items */}
                        {orderData.items && orderData.items.length > 0 && (
                            <View style={styles.itemsSection}>
                                <Text style={styles.itemsTitle}>Boletos Comprados</Text>
                                {orderData.items.map((item, index) => (
                                    <View key={index} style={styles.itemCard}>
                                        <View style={styles.itemRow}>
                                            <Text style={styles.itemName}>
                                                {item.tier_name || "Boleto"}
                                            </Text>
                                            <Text style={styles.itemQty}>
                                                x {item.quantity}
                                            </Text>
                                        </View>
                                        <View style={styles.itemRow}>
                                            <Text style={styles.itemPrice}>
                                                ${typeof item.unit_price === "string"
                                                    ? parseFloat(item.unit_price).toFixed(2)
                                                    : (item.unit_price as number).toFixed(2)}{" "}
                                                c/u
                                            </Text>
                                            <Text style={styles.itemSubtotal}>
                                                ${typeof item.subtotal === "string"
                                                    ? parseFloat(item.subtotal).toFixed(2)
                                                    : (item.subtotal as number).toFixed(2)}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Acciones */}
                        {orderData.status === "PENDING" && (
                            <TouchableOpacity
                                style={[
                                    styles.confirmButton,
                                    confirming && styles.buttonDisabled,
                                ]}
                                onPress={handleConfirmOrder}
                                disabled={confirming}
                            >
                                <Text style={styles.confirmButtonText}>
                                    {confirming ? "Confirmando..." : "✓ Confirmar Pago"}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Historial de Búsquedas */}
                {searchHistory.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Búsquedas Recientes</Text>
                        <FlatList
                            data={searchHistory}
                            keyExtractor={(item) => item.id}
                            renderItem={renderHistoryItem}
                            scrollEnabled={false}
                            nestedScrollEnabled={false}
                        />
                    </View>
                )}

                {/* Info */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>ℹ️ Estados de Orden</Text>
                    <View style={styles.statusInfo}>
                        <Text style={styles.statusInfoText}>
                            🟠 <Text style={{ fontWeight: "bold" }}>PENDING:</Text> Esperando
                            confirmación de pago (10 min)
                        </Text>
                        <Text style={styles.statusInfoText}>
                            🟢 <Text style={{ fontWeight: "bold" }}>PAID/CONFIRMED:</Text> Pago
                            confirmado, boletos emitidos
                        </Text>
                        <Text style={styles.statusInfoText}>
                            🔴 <Text style={{ fontWeight: "bold" }}>EXPIRED:</Text> Reserva expiró
                            sin confirmar
                        </Text>
                        <Text style={styles.statusInfoText}>
                            ⚫ <Text style={{ fontWeight: "bold" }}>CANCELLED:</Text> Orden
                            cancelada
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

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
    searchInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        backgroundColor: "#f9f9f9",
        marginBottom: 12,
        fontFamily: "monospace",
    },
    searchButton: {
        backgroundColor: "#007AFF",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    searchButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    orderHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    orderTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    orderId: {
        fontSize: 12,
        color: "#999",
        fontFamily: "monospace",
    },
    orderStatusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginLeft: 8,
    },
    orderStatusText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    orderDetailsCard: {
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: "#007AFF",
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    detailLabel: {
        fontSize: 13,
        color: "#666",
        fontWeight: "500",
    },
    detailValue: {
        fontSize: 13,
        color: "#333",
        fontWeight: "bold",
    },
    detailAmount: {
        fontSize: 16,
        color: "#34C759",
    },
    itemsSection: {
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    itemsTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    itemCard: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 6,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: "#FF9500",
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    itemName: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#333",
    },
    itemQty: {
        fontSize: 12,
        color: "#666",
    },
    itemPrice: {
        fontSize: 11,
        color: "#999",
    },
    itemSubtotal: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#FF9500",
    },
    confirmButton: {
        backgroundColor: "#34C759",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    confirmButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    historyItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: "#007AFF",
    },
    historyLeft: {
        flex: 1,
    },
    historyRight: {
        alignItems: "flex-end",
    },
    historyOrderId: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
        fontFamily: "monospace",
    },
    historyStatus: {
        fontSize: 11,
        color: "#666",
    },
    historyAmount: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#34C759",
    },
    historyItems: {
        fontSize: 11,
        color: "#999",
    },
    infoSection: {
        backgroundColor: "#FEF3C7",
        marginHorizontal: 12,
        marginVertical: 12,
        marginBottom: 20,
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: "#FF9500",
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#D97706",
        marginBottom: 10,
    },
    statusInfo: {
        gap: 8,
    },
    statusInfoText: {
        fontSize: 12,
        color: "#B45309",
        lineHeight: 18,
    },
});
