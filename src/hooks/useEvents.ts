import { useQuery } from "@tanstack/react-query";
import { fetchEvents, fetchEventById } from "../api/events";

export function useEvents(page = 1, limit = 10) {
    return useQuery({
        queryKey: ["events", page, limit],
        queryFn: () => fetchEvents(page, limit),
    });
}

export function useEventDetail(eventId: string | undefined) {
    return useQuery({
        queryKey: ["event", eventId],
        queryFn: () => fetchEventById(eventId as string),
        enabled: !!eventId, // no dispara la query hasta tener un id real
    });
}
