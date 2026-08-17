import type { IssuedTicket } from "../types/api";

export type RootStackParamList = {
    // Stack de autenticación (usuario no logueado)
    Login: undefined;
    Register: undefined;

    // Stack principal (usuario logueado)
    Events: undefined;
    EventDetail: { eventId: string };
    Checkout: { orderId: string; eventId: string };
    TicketsResult: { tickets: IssuedTicket[]; eventTitle: string };
    Profile: undefined;
};
