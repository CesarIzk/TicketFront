import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useOrderStatus, useConfirmOrder } from "../hooks/useOrders";
import { useEventDetail } from "../hooks/useEvents";
import { getApiErrorMessage } from "../api/client";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;

export default function CheckoutScreen({ route, navigation }: Props) {
    const { orderId, eventId } = route.params;
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
    const [expired, setExpired] = useState(false);

    const { data: order, isLoading } = useOrderStatus(orderId, !expired);
    const { data: event } = useEventDetail(eventId);
    const confirmMutation = useConfirmOrder();

    // Cuenta regresiva local basada en expires_at del servidor (fuente
    // de verdad real), no en un contador arbitrario del cliente.
    useEffect(() => {
        if (!order?.expires_at) return;
        const expiresAt = new Date(order.expires_at).getTime();

        const tick = () => {
            const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
            setSecondsLeft(diff);
            if (diff <= 0) setExpired(true);
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [order?.expires_at]);

    useEffect(() => {
        if (order?.status === "EXPIRED") setExpired(true);
    }, [order?.status]);

    async function handleConfirm() {
        try {
            const result = await confirmMutation.mutateAsync(orderId);
            navigation.replace("TicketsResult", {
                tickets: result.tickets,
                eventTitle: event?.title || "Tu evento",
            });
        } catch (err) {
            Alert.alert("No se pudo confirmar la compra", getApiErrorMessage(err));
        }
    }

    if (isLoading || !order) {
        return <ActivityIndicator style={{ marginTop: 60 }} size="large" color="#7c3aed" />;
    }

    const minutes = secondsLeft !== null ? Math.floor(secondsLeft / 60) : 0;
    const seconds = secondsLeft !== null ? secondsLeft % 60 : 0;

    return (
        <View style={styles.container}>
            {expired ? (
                <View style={styles.expiredBox}>
                    <Text style={styles.expiredTitle}>⏰ La reserva expiró</Text>
                    <Text style={styles.expiredText}>
                        No se confirmó el pago a tiempo y el stock fue liberado. Vuelve al evento
                        para intentarlo de nuevo.
                    </Text>
                    <Pressable
                        style={styles.button}
                        onPress={() => navigation.navigate("EventDetail", { eventId })}
                    >
                        <Text style={styles.buttonText}>Volver al evento</Text>
                    </Pressable>
                </View>
            ) : (
                <>
                    <Text style={styles.timer}>
                        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                    </Text>
                    <Text style={styles.timerLabel}>tiempo restante para pagar</Text>

                    <View style={styles.summary}>
                        <Text style={styles.summaryTitle}>Resumen de tu orden</Text>
                        {order.items.map((item, idx) => (
                            <View key={idx} style={styles.summaryRow}>
                                <Text style={styles.summaryItemName}>
                                    {item.tier_name || "Pase"} × {item.quantity}
                                </Text>
                                <Text style={styles.summaryItemPrice}>
                                    ${Number(item.subtotal).toFixed(2)}
                                </Text>
                            </View>
                        ))}
                        <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                            <Text style={styles.summaryTotalLabel}>Total</Text>
                            <Text style={styles.summaryTotalValue}>
                                ${Number(order.total_amount).toFixed(2)}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.disclaimer}>
                        Esto es un demo — al confirmar se marca como pagada directamente, sin
                        pasarela de pago real.
                    </Text>

                    <Pressable
                        style={styles.button}
                        onPress={handleConfirm}
                        disabled={confirmMutation.isPending}
                    >
                        {confirmMutation.isPending ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Confirmar y pagar</Text>
                        )}
                    </Pressable>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 24, alignItems: "center" },
    timer: { fontSize: 48, fontWeight: "800", color: "#7c3aed", marginTop: 24 },
    timerLabel: { color: "#888", marginBottom: 32 },
    summary: { width: "100%", backgroundColor: "#f9fafb", borderRadius: 14, padding: 18 },
    summaryTitle: { fontWeight: "700", fontSize: 16, marginBottom: 12 },
    summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    summaryItemName: { color: "#333" },
    summaryItemPrice: { color: "#333", fontWeight: "600" },
    summaryTotalRow: { borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 10, marginTop: 4 },
    summaryTotalLabel: { fontWeight: "700" },
    summaryTotalValue: { fontWeight: "800", fontSize: 18, color: "#7c3aed" },
    disclaimer: { color: "#999", fontSize: 12, textAlign: "center", marginTop: 20, marginBottom: 16 },
    button: {
        backgroundColor: "#7c3aed",
        borderRadius: 10,
        paddingVertical: 16,
        paddingHorizontal: 32,
        width: "100%",
        alignItems: "center",
        marginTop: "auto",
    },
    buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    expiredBox: { flex: 1, justifyContent: "center", alignItems: "center" },
    expiredTitle: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
    expiredText: { textAlign: "center", color: "#666", marginBottom: 24 },
});
