import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 30_000, // 30s: evita refetch agresivo en cada foco de pantalla
        },
    },
});

export default function App() {
    return (
        <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <RootNavigator />
                    <StatusBar style="auto" />
                </AuthProvider>
            </QueryClientProvider>
        </SafeAreaProvider>
    );
}
