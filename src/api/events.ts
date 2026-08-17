import { apiClient } from "./client";
import type { ApiSuccess, EventDetail, EventSummary, Pagination } from "../types/api";

export async function fetchEvents(page = 1, limit = 10) {
    const res = await apiClient.get<ApiSuccess<EventSummary[]> & { pagination: Pagination }>(
        "/events",
        { params: { page, limit } }
    );
    return { events: res.data.data, pagination: res.data.pagination };
}

export async function fetchEventById(id: string) {
    const res = await apiClient.get<ApiSuccess<EventDetail>>(`/events/${id}`);
    return res.data.data;
}
