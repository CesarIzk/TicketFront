// Formas base de respuesta, iguales a como responde el backend Express
export interface ApiSuccess<T> {
    success: true;
    data: T;
    pagination?: Pagination;
}

export interface ApiErrorBody {
    success: false;
    error: {
        code: string;
        message: string;
        details?: { field: string; message: string }[];
    };
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export type UserRole = "ADMIN" | "OPERATOR" | "CLIENT";

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    created_at?: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

export interface EventSummary {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    venue: string;
    start_date: string;
    end_date: string;
    status: EventStatus;
    min_price: string;
    total_available_stock: number;
}

export interface TicketTier {
    id: string;
    name: string;
    description: string | null;
    price: string;
    total_stock: number;
    available_stock: number;
    reserved_stock: number;
}

export interface EventDetail extends Omit<EventSummary, "min_price" | "total_available_stock"> {
    ticket_tiers: TicketTier[];
}

export type OrderStatus = "PENDING" | "PAID" | "EXPIRED" | "CANCELLED";

export interface OrderItem {
    ticket_tier_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    tier_name?: string;
}

export interface Order {
    id: string;
    status: OrderStatus;
    total_amount: number | string;
    expires_at: string;
    created_at: string;
    items: OrderItem[];
}

export interface IssuedTicket {
    id: string;
    ticket_code: string;
    status: "VALID" | "USED" | "REVOKED";
    created_at: string;
}

export interface ConfirmOrderResponse {
    orderId: string;
    status: "PAID";
    tickets: IssuedTicket[];
}
