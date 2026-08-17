import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reserveOrder, confirmOrder, fetchOrderById, ReserveItem } from "../api/orders";

export function useReserveOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ eventId, items }: { eventId: string; items: ReserveItem[] }) =>
            reserveOrder(eventId, items),
        onSuccess: (_data, variables) => {
            // El stock cambió, invalidamos el detalle del evento para que
            // se refresque con los números nuevos la próxima vez que se vea.
            queryClient.invalidateQueries({ queryKey: ["event", variables.eventId] });
        },
    });
}

export function useConfirmOrder() {
    return useMutation({
        mutationFn: (orderId: string) => confirmOrder(orderId),
    });
}

/**
 * Polling ligero del estado de una orden PENDING, útil para mostrar
 * el conteo regresivo y detectar si expiró en otra pestaña/dispositivo.
 */
export function useOrderStatus(orderId: string | undefined, enabled: boolean) {
    return useQuery({
        queryKey: ["order", orderId],
        queryFn: () => fetchOrderById(orderId as string),
        enabled: !!orderId && enabled,
        refetchInterval: enabled ? 5000 : false,
    });
}
