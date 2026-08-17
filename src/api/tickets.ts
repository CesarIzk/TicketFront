import { apiClient } from "./client";
import type { ApiSuccess } from "../types/api";

export interface ValidateTicketResponse {
    ticket_id: string;
    status: string;
    message: string;
    event_name: string;
}

export async function validateTicket(ticket_code: string) {
    const res = await apiClient.post<ApiSuccess<ValidateTicketResponse>>(
        "/tickets/validate",
        { ticket_code }
    );
    return res.data.data;
}
