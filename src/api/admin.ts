import { apiClient } from "./client";
import type { ApiSuccess } from "../types/api";

export interface EventAnalytics {
    event_id: string;
    event_name: string;
    total_revenue: number;
    tickets_sold: number;
    tickets_remaining: number;
    event_capacity: number;
    occupancy_rate: number;
}

export async function fetchEventAnalytics(eventId: string) {
    const res = await apiClient.get<ApiSuccess<EventAnalytics>>(
        `/admin/events/${eventId}/analytics`
    );
    return res.data.data;
}
