import { apiClient } from "./client";
import type { ApiSuccess, ConfirmOrderResponse, Order } from "../types/api";

export interface ReserveItem {
    ticket_tier_id: string;
    quantity: number;
}

export async function reserveOrder(event_id: string, items: ReserveItem[]) {
    const res = await apiClient.post<ApiSuccess<Order>>("/orders/reserve", {
        event_id,
        items,
    });
    return res.data.data;
}

export async function confirmOrder(orderId: string) {
    const res = await apiClient.post<ApiSuccess<ConfirmOrderResponse>>(
        `/orders/${orderId}/confirm`
    );
    return res.data.data;
}

export async function fetchOrderById(orderId: string) {
    const res = await apiClient.get<ApiSuccess<Order>>(`/orders/${orderId}`);
    return res.data.data;
}
