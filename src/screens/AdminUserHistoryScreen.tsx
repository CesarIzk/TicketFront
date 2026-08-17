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
    RefreshControl,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { fetchUsers, fetchUserDetails, type UserSummary, type UserDetailWithOrders } from "../api/users";

export default function AdminUserHistoryScreen() {
    const { user } = useAuth();
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserDetailWithOrders | null>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);

    // Cargar usuarios
    const loadUsers = async (pageNum: number = 1, search?: string) => {
        try {
            setLoading(pageNum === 1);
            const data = await fetchUsers(pageNum, 20, search);
            if (pageNum === 1) {
                setUsers(data.users || []);
            } else {
                setUsers((prev) => [...prev, ...(data.users || [])]);
            }
            setPage(pageNum);
        } catch (error: any) {
            const errorMsg =
                error.response?.data?.error?.message ||
                "Error obteniendo usuarios";
            Alert.alert("Error", errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Cargar detalles del usuario
    const handleSelectUser = async (userId: string) => {
        try {
            setLoading(true);
            const details = await fetchUserDetails(userId);
            setSelectedUser(details);
        } catch (error: any) {
            const errorMsg =
                error.response?.data?.error?.message ||
                "Error obteniendo detalles del usuario";
            Alert.alert("Error", errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Pull to refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await loadUsers(1, searchText || undefined);
        setRefreshing(false);
    };

    // Load more (pagination)
    const handleLoadMore = () => {
        if (!loadingMore && users.length >= 20) {
            setLoadingMore(true);
            loadUsers(page + 1, searchText || undefined).finally(() =>
                setLoadingMore(false)
            );
        }
    };

    // Buscar usuarios
    const handleSearch = (text: string) => {
        setSearchText(text);
        if (text.length > 2 || text.length === 0) {
            loadUsers(1, text || undefined);
        }
    };

    useEffect(() => {
        loadUsers(1);
    }, []);

    const renderUserItem = ({ item }: { item: UserSummary }) => (
        <TouchableOpacity
            style={styles.userItem}
            onPress={() => handleSelectUser(item.id)}
        >
            <View style={styles.userContent}>
                <View style={styles.userHeader}>
                    <Text style={styles.userName}>{item.full_name}</Text>
                    <View
                        style={[
                            styles.roleBadge,
                            {
                                backgroundColor:
                                    item.role === "ADMIN"
                                        ? "#FF3B30"
                                        : item.role === "OPERATOR"
                                        ? "#FF9500"
                                        : "#34C759",
                            },
                        ]}
                    >
                        <Text style={styles.roleBadgeText}>{item.role}</Text>
                    </View>
                </View>
                <Text style={styles.userEmail}>{item.email}</Text>
                <View style={styles.userStats}>
                    <Text style={styles.userStat}>
                        📦 {item.orders_count || 0} órdenes
                    </Text>
                    <Text style={styles.userStat}>
                        💰 ${
                            typeof item.total_spent === "string"
                                ? parseFloat(item.total_spent).toFixed(2)
                                : (item.total_spent || 0).toFixed(2)
                        }
                    </Text>
                </View>
                <Text style={styles.userDate}>
                    Registrado: {new Date(item.created_at).toLocaleDateString("es-ES")}
                </Text>
            </View>
            <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>
    );

    const renderOrderItem = ({ item }: { item: any }) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>{item.id.slice(0, 8)}...</Text>
                <View
                    style={[
                        styles.orderStatusBadge,
                        {
                            backgroundColor:
                                item.status === "PAID"
                                    ? "#34C759"
                                    : item.status === "PENDING"
                                    ? "#FF9500"
                                    : "#FF3B30",
                        },
                    ]}
                >
                    <Text style={styles.orderStatusText}>{item.status}</Text>
                </View>
            </View>
            <View style={styles.orderDetails}>
                <View style={styles.orderDetailRow}>
                    <Text style={styles.orderDetailLabel}>Monto:</Text>
                    <Text style={styles.orderDetailValue}>
                        ${
                            typeof item.total_amount === "string"
                                ? parseFloat(item.total_amount).toFixed(2)
                                : (item.total_amount as number).toFixed(2)
                        }
                    </Text>
                </View>
                <View style={styles.orderDetailRow}>
                    <Text style={styles.orderDetailLabel}>Fecha:</Text>
                    <Text style={styles.orderDetailValue}>
                        {new Date(item.created_at).toLocaleString("es-ES")}
                    </Text>
                </View>
            </View>
        </View>
    );

    if (selectedUser) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setSelectedUser(null)}
                    >
                        <Text style={styles.backButtonText}>← Atrás</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>👤 Historial del Usuario</Text>
                </View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* User Info */}
                    <View style={styles.section}>
                        <View style={styles.userInfoCard}>
                            <View style={styles.userInfoHeader}>
                                <View>
                                    <Text style={styles.userInfoName}>
                                        {selectedUser.full_name}
                                    </Text>
                                    <Text style={styles.userInfoEmail}>
                                        {selectedUser.email}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        styles.roleBadgeLarge,
                                        {
                                            backgroundColor:
                                                selectedUser.role === "ADMIN"
                                                    ? "#FF3B30"
                                                    : selectedUser.role === "OPERATOR"
                                                    ? "#FF9500"
                                                    : "#34C759",
                                        },
                                    ]}
                                >
                                    <Text style={styles.roleBadgeTextLarge}>
                                        {selectedUser.role}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.userInfoDivider} />

                            <View style={styles.userInfoStats}>
                                <View style={styles.infoStat}>
                                    <Text style={styles.infoStatLabel}>Total de Órdenes</Text>
                                    <Text style={styles.infoStatValue}>
                                        {selectedUser.orders?.length || 0}
                                    </Text>
                                </View>
                                <View style={styles.infoStat}>
                                    <Text style={styles.infoStatLabel}>Total Invertido</Text>
                                    <Text style={styles.infoStatValue}>
                                        $
                                        {(
                                            selectedUser.orders?.reduce(
                                                (sum, order) => {
                                                    const amount =
                                                        typeof order.total_amount ===
                                                        "string"
                                                            ? parseFloat(
                                                                  order.total_amount
                                                              )
                                                            : (order.total_amount as number);
                                                    return sum + amount;
                                                },
                                                0
                                            ) || 0
                                        ).toFixed(2)}
                                    </Text>
                                </View>
                                <View style={styles.infoStat}>
                                    <Text style={styles.infoStatLabel}>Miembro Desde</Text>
                                    <Text style={styles.infoStatValue}>
                                        {new Date(
                                            selectedUser.created_at
                                        ).toLocaleDateString("es-ES")}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Orders List */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            📦 Historial de Órdenes
                        </Text>
                        {selectedUser.orders && selectedUser.orders.length > 0 ? (
                            <FlatList
                                data={selectedUser.orders}
                                keyExtractor={(item) => item.id}
                                renderItem={renderOrderItem}
                                scrollEnabled={false}
                                nestedScrollEnabled={false}
                            />
                        ) : (
                            <Text style={styles.emptyText}>
                                Este usuario no tiene órdenes registradas
                            </Text>
                        )}
                    </View>
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>👥 Usuarios Registrados</Text>
                <Text style={styles.subtitle}>Historial y actividad de clientes</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por email o nombre..."
                    value={searchText}
                    onChangeText={handleSearch}
                    placeholderTextColor="#999"
                />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#7c3aed" />
                    <Text style={styles.loadingText}>Cargando usuarios...</Text>
                </View>
            ) : users.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>👥</Text>
                    <Text style={styles.emptyTitle}>Sin usuarios</Text>
                    <Text style={styles.emptyText}>
                        No hay usuarios registrados aún
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id}
                    renderItem={renderUserItem}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={["#7c3aed"]}
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={
                        loadingMore ? (
                            <View style={styles.footerLoader}>
                                <ActivityIndicator
                                    size="small"
                                    color="#7c3aed"
                                />
                            </View>
                        ) : null
                    }
                    contentContainerStyle={styles.listContent}
                />
            )}
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
    backButton: {
        marginBottom: 8,
        paddingVertical: 4,
    },
    backButtonText: {
        fontSize: 14,
        color: "#7c3aed",
        fontWeight: "600",
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
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
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
    content: {
        flex: 1,
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: "#666",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 4,
        color: "#333",
    },
    emptyText: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
    },
    listContent: {
        paddingVertical: 8,
    },
    userItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: "#7c3aed",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    userContent: {
        flex: 1,
    },
    userHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    userName: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
        flex: 1,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        marginLeft: 8,
    },
    roleBadgeText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "bold",
    },
    userEmail: {
        fontSize: 12,
        color: "#666",
        marginBottom: 6,
    },
    userStats: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 4,
    },
    userStat: {
        fontSize: 11,
        color: "#999",
    },
    userDate: {
        fontSize: 10,
        color: "#bbb",
        fontStyle: "italic",
    },
    arrowIcon: {
        fontSize: 24,
        color: "#ddd",
    },
    userInfoCard: {
        backgroundColor: "#f9f9f9",
        borderRadius: 10,
        padding: 16,
    },
    userInfoHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    userInfoName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    userInfoEmail: {
        fontSize: 13,
        color: "#666",
    },
    roleBadgeLarge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginLeft: 8,
    },
    roleBadgeTextLarge: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "bold",
    },
    userInfoDivider: {
        height: 1,
        backgroundColor: "#e0e0e0",
        marginBottom: 12,
    },
    userInfoStats: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    infoStat: {
        alignItems: "center",
        flex: 1,
    },
    infoStatLabel: {
        fontSize: 11,
        color: "#999",
        marginBottom: 4,
    },
    infoStatValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    orderCard: {
        backgroundColor: "#f9f9f9",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: "#FF9500",
    },
    orderHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    orderId: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#333",
        fontFamily: "monospace",
    },
    orderStatusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    orderStatusText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "bold",
    },
    orderDetails: {
        gap: 4,
    },
    orderDetailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    orderDetailLabel: {
        fontSize: 11,
        color: "#999",
    },
    orderDetailValue: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#333",
    },
    footerLoader: {
        paddingVertical: 16,
        alignItems: "center",
    },
});
