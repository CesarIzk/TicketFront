import React from "react";
import {
    View,
    Text,
    FlatList,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEvents } from "../hooks/useEvents";
import type { RootStackParamList } from "../navigation/types";
import type { EventSummary } from "../types/api";

type Props = NativeStackScreenProps<RootStackParamList, "Events">;

export default function EventsListScreen({ navigation }: Props) {
    const { data, isLoading, isError, refetch, isRefetching } = useEvents(1, 20);

    return (
        <View style={styles.container}>
            <Pressable style={styles.profileLink} onPress={() => navigation.navigate("Profile")}>
                <Text style={styles.profileLinkText}>👤 Mi perfil</Text>
            </Pressable>

            {isLoading && <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#7c3aed" />}

            {isError && (
                <Text style={styles.error}>
                    No se pudieron cargar los eventos. Verifica que el backend esté corriendo.
                </Text>
            )}

            {data && (
                <FlatList
                    data={data.events}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                    }
                    renderItem={({ item }) => (
                        <EventCard
                            event={item}
                            onPress={() => navigation.navigate("EventDetail", { eventId: item.id })}
                        />
                    )}
                    ListEmptyComponent={
                        <Text style={styles.empty}>No hay eventos publicados por ahora.</Text>
                    }
                />
            )}
        </View>
    );
}

function EventCard({ event, onPress }: { event: EventSummary; onPress: () => void }) {
    const startDate = new Date(event.start_date).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <Pressable style={styles.card} onPress={onPress}>
            <Text style={styles.cardTitle}>{event.title}</Text>
            <Text style={styles.cardVenue}>📍 {event.venue}</Text>
            <Text style={styles.cardDate}>📅 {startDate}</Text>
            <View style={styles.cardFooter}>
                <Text style={styles.cardPrice}>Desde ${event.min_price}</Text>
                <Text style={styles.cardStock}>
                    {event.total_available_stock > 0
                        ? `${event.total_available_stock} disponibles`
                        : "Agotado"}
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f9fafb" },
    profileLink: { alignSelf: "flex-end", padding: 16 },
    profileLinkText: { color: "#7c3aed", fontWeight: "600" },
    error: { color: "#dc2626", textAlign: "center", marginTop: 40, paddingHorizontal: 24 },
    empty: { textAlign: "center", color: "#888", marginTop: 40 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 18,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
    cardVenue: { color: "#555", marginBottom: 2 },
    cardDate: { color: "#555", marginBottom: 10 },
    cardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#eee",
        paddingTop: 10,
    },
    cardPrice: { fontWeight: "700", color: "#7c3aed", fontSize: 16 },
    cardStock: { color: "#888", fontSize: 12 },
});
