import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEventDetail } from "../hooks/useEvents";
import { useReserveOrder } from "../hooks/useOrders";
import { getApiErrorMessage } from "../api/client";
import type { RootStackParamList } from "../navigation/types";
import type { TicketTier } from "../types/api";

type Props = NativeStackScreenProps<RootStackParamList, "EventDetail">;

export default function EventDetailScreen({ route, navigation }: Props) {
    const { eventId } = route.params;
    const { data: event, isLoading, isError } = useEventDetail(eventId);
    const reserveMutation = useReserveOrder();

    // Cantidad seleccionada por tier: { [tierId]: quantity }
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    function setQuantity(tierId: string, delta: number, max: number) {
        setQuantities((prev) => {
            const current = prev[tierId] || 0;
            const next = Math.min(Math.max(current + delta, 0), Math.min(max, 10));
            return { ...prev, [tierId]: next };
        });
    }

    const selectedItems = Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([ticket_tier_id, quantity]) => ({ ticket_tier_id, quantity }));

    const total = selectedItems.reduce((sum, item) => {
        const tier = event?.ticket_tiers.find((t) => t.id === item.ticket_tier_id);
        return sum + (tier ? parseFloat(tier.price) * item.quantity : 0);
    }, 0);

    async function handleReserve() {
        if (!event || selectedItems.length === 0) return;
        try {
            const order = await reserveMutation.mutateAsync({
                eventId: event.id,
                items: selectedItems,
            });
            navigation.navigate("Checkout", { orderId: order.id, eventId: event.id });
        } catch (err) {
            Alert.alert("No se pudo reservar", getApiErrorMessage(err));
        }
    }

    if (isLoading) {
        return <ActivityIndicator style={{ marginTop: 60 }} size="large" color="#7c3aed" />;
    }
    if (isError || !event) {
        return <Text style={styles.error}>No se pudo cargar el evento.</Text>;
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
                <Text style={styles.title}>{event.title}</Text>
                <Text style={styles.venue}>📍 {event.venue}</Text>
                <Text style={styles.dates}>
                    {new Date(event.start_date).toLocaleDateString("es-MX")} —{" "}
                    {new Date(event.end_date).toLocaleDateString("es-MX")}
                </Text>
                {event.description && <Text style={styles.description}>{event.description}</Text>}

                <Text style={styles.sectionTitle}>Tipos de pase</Text>
                {event.ticket_tiers.map((tier) => (
                    <TierRow
                        key={tier.id}
                        tier={tier}
                        quantity={quantities[tier.id] || 0}
                        onChange={(delta) => setQuantity(tier.id, delta, tier.available_stock)}
                    />
                ))}
            </ScrollView>

            {selectedItems.length > 0 && (
                <View style={styles.footer}>
                    <View>
                        <Text style={styles.footerLabel}>Total</Text>
                        <Text style={styles.footerTotal}>${total.toFixed(2)}</Text>
                    </View>
                    <Pressable
                        style={styles.reserveButton}
                        onPress={handleReserve}
                        disabled={reserveMutation.isPending}
                    >
                        {reserveMutation.isPending ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.reserveButtonText}>Reservar (10 min)</Text>
                        )}
                    </Pressable>
                </View>
            )}
        </View>
    );
}

function TierRow({
    tier,
    quantity,
    onChange,
}: {
    tier: TicketTier;
    quantity: number;
    onChange: (delta: number) => void;
}) {
    const soldOut = tier.available_stock === 0;
    return (
        <View style={[styles.tierRow, soldOut && { opacity: 0.5 }]}>
            <View style={{ flex: 1 }}>
                <Text style={styles.tierName}>{tier.name}</Text>
                {tier.description && <Text style={styles.tierDescription}>{tier.description}</Text>}
                <Text style={styles.tierPrice}>${tier.price}</Text>
                <Text style={styles.tierStock}>
                    {soldOut ? "Agotado" : `${tier.available_stock} disponibles`}
                </Text>
            </View>
            <View style={styles.stepper}>
                <Pressable
                    style={styles.stepperButton}
                    onPress={() => onChange(-1)}
                    disabled={quantity === 0}
                >
                    <Text style={styles.stepperButtonText}>−</Text>
                </Pressable>
                <Text style={styles.stepperValue}>{quantity}</Text>
                <Pressable
                    style={styles.stepperButton}
                    onPress={() => onChange(1)}
                    disabled={soldOut || quantity >= tier.available_stock || quantity >= 10}
                >
                    <Text style={styles.stepperButtonText}>+</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    error: { color: "#dc2626", textAlign: "center", marginTop: 60 },
    title: { fontSize: 24, fontWeight: "700", marginBottom: 6 },
    venue: { color: "#555", marginBottom: 2 },
    dates: { color: "#555", marginBottom: 12 },
    description: { color: "#333", lineHeight: 20, marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
    tierRow: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#eee",
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
    },
    tierName: { fontSize: 16, fontWeight: "600" },
    tierDescription: { color: "#777", fontSize: 13, marginTop: 2 },
    tierPrice: { color: "#7c3aed", fontWeight: "700", marginTop: 6 },
    tierStock: { color: "#999", fontSize: 12, marginTop: 2 },
    stepper: { flexDirection: "row", alignItems: "center", gap: 10 },
    stepperButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#f3f4f6",
        alignItems: "center",
        justifyContent: "center",
    },
    stepperButtonText: { fontSize: 18, fontWeight: "700" },
    stepperValue: { minWidth: 20, textAlign: "center", fontWeight: "600" },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#eee",
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    footerLabel: { color: "#888", fontSize: 12 },
    footerTotal: { fontSize: 20, fontWeight: "700" },
    reserveButton: {
        backgroundColor: "#7c3aed",
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 10,
    },
    reserveButtonText: { color: "#fff", fontWeight: "700" },
});
