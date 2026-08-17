import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import type { RootStackParamList } from "./types";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import EventsListScreen from "../screens/EventsListScreen";
import EventDetailScreen from "../screens/EventDetailScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import TicketsResultScreen from "../screens/TicketsResultScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color="#7c3aed" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: true }}>
                {isAuthenticated ? (
                    <>
                        <Stack.Screen
                            name="Events"
                            component={EventsListScreen}
                            options={{ title: "Eventos" }}
                        />
                        <Stack.Screen
                            name="EventDetail"
                            component={EventDetailScreen}
                            options={{ title: "Detalle del evento" }}
                        />
                        <Stack.Screen
                            name="Checkout"
                            component={CheckoutScreen}
                            options={{ title: "Confirmar compra" }}
                        />
                        <Stack.Screen
                            name="TicketsResult"
                            component={TicketsResultScreen}
                            options={{ title: "Tus boletos", headerBackVisible: false }}
                        />
                        <Stack.Screen
                            name="Profile"
                            component={ProfileScreen}
                            options={{ title: "Mi perfil" }}
                        />
                        <Stack.Screen
                            name="AdminDashboard"
                            component={AdminDashboardScreen}
                            options={{ title: "Dashboard Admin" }}
                        />
                    </>
                ) : (
                    <>
                        <Stack.Screen
                            name="Login"
                            component={LoginScreen}
                            options={{ title: "Iniciar sesión" }}
                        />
                        <Stack.Screen
                            name="Register"
                            component={RegisterScreen}
                            options={{ title: "Crear cuenta" }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
