import { apiClient } from "./client";

export interface UserSummary {
    id: string;
    email: string;
    full_name: string;
    role: "ADMIN" | "OPERATOR" | "CLIENT";
    created_at: string;
    orders_count?: number;
    total_spent?: number;
}

export interface UserDetailWithOrders {
    id: string;
    email: string;
    full_name: string;
    role: "ADMIN" | "OPERATOR" | "CLIENT";
    created_at: string;
    orders: Array<{
        id: string;
        event_id: string;
        status: string;
        total_amount: string | number;
        created_at: string;
    }>;
}

/**
 * Obtiene lista de usuarios registrados (solo para ADMIN)
 * GET /admin/users?page=1&limit=20&search=email
 */
export async function fetchUsers(
    page: number = 1,
    limit: number = 20,
    search?: string
) {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    if (search) {
        params.append("search", search);
    }

    const response = await apiClient.get(`/admin/users?${params.toString()}`);
    return response.data.data;
}

/**
 * Obtiene detalles de un usuario incluyendo sus órdenes
 * GET /admin/users/:id
 */
export async function fetchUserDetails(userId: string): Promise<UserDetailWithOrders> {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data.data;
}
