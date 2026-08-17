import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const navigation = useNavigation<ProfileScreenNavigationProp>();

    return (
        <View style={styles.container}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.full_name?.[0]?.toUpperCase() || "?"}</Text>
            </View>
            <Text style={styles.name}>{user?.full_name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{user?.role}</Text>
            </View>

            {user?.role === "ADMIN" && (
                <Pressable
                    style={styles.adminButton}
                    onPress={() => navigation.navigate("AdminDashboard")}
                >
                    <Text style={styles.adminButtonText}>📊 Ir al Dashboard</Text>
                </Pressable>
            )}

            <Pressable style={styles.logoutButton} onPress={logout}>
                <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", paddingTop: 48, backgroundColor: "#fff" },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "#7c3aed",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    avatarText: { color: "#fff", fontSize: 28, fontWeight: "700" },
    name: { fontSize: 20, fontWeight: "700" },
    email: { color: "#666", marginTop: 4 },
    roleBadge: {
        marginTop: 12,
        backgroundColor: "#ede9fe",
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderRadius: 999,
    },
    roleBadgeText: { color: "#7c3aed", fontWeight: "700", fontSize: 12 },
    adminButton: {
        marginTop: 24,
        backgroundColor: "#FF9500",
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 40,
    },
    adminButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
    logoutButton: {
        marginTop: 20,
        borderWidth: 1,
        borderColor: "#dc2626",
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 40,
    },
    logoutButtonText: { color: "#dc2626", fontWeight: "700" },
});
