import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "TicketsResult">;

export default function TicketsResultScreen({ route, navigation }: Props) {
    const { tickets, eventTitle } = route.params;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.successIcon}>✅</Text>
                <Text style={styles.title}>¡Compra confirmada!</Text>
                <Text style={styles.subtitle}>{eventTitle}</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {tickets.map((ticket) => (
                    <View key={ticket.id} style={styles.ticketCard}>
                        <QRCode value={ticket.ticket_code} size={160} />
                        <Text style={styles.ticketCode}>{ticket.ticket_code}</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusBadgeText}>{ticket.status}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <Pressable style={styles.button} onPress={() => navigation.popToTop()}>
                <Text style={styles.buttonText}>Volver al catálogo</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: { alignItems: "center", paddingTop: 32, paddingBottom: 16 },
    successIcon: { fontSize: 40 },
    title: { fontSize: 22, fontWeight: "700", marginTop: 8 },
    subtitle: { color: "#666", marginTop: 2 },
    ticketCard: {
        backgroundColor: "#f9fafb",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#eee",
    },
    ticketCode: {
        marginTop: 16,
        fontFamily: "monospace",
        fontSize: 13,
        color: "#444",
        textAlign: "center",
    },
    statusBadge: {
        marginTop: 10,
        backgroundColor: "#dcfce7",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
    },
    statusBadgeText: { color: "#16a34a", fontWeight: "700", fontSize: 12 },
    button: {
        backgroundColor: "#7c3aed",
        margin: 16,
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: "center",
    },
    buttonText: { color: "#fff", fontWeight: "700" },
});
