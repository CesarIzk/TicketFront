# 📚 Referencia Rápida - AdminDashboard Endpoints

## 🚀 Quick Start

```bash
# 1. Usuario Admin inicia sesión
POST /auth/login
{
  "email": "admin@example.com",
  "password": "Password123!"
}

# 2. Accede al Dashboard
# ProfileScreen → [📊 Ir al Dashboard]

# 3. Usa todas estas funciones:
```

---

## 📋 Todos los Endpoints Usados

### 1️⃣ Listar Eventos (GET)
```
GET /events?page=1&limit=50&status=PUBLISHED&search=Concert
```
**Ubicación en UI:** AdminDashboardScreen → Tab "Eventos"
**Función API:** `fetchEvents(1, 50)`
**Devuelve:** Array de eventos

---

### 2️⃣ Ver Analíticas de Evento (GET - ADMIN ONLY)
```
GET /admin/events/{eventId}/analytics
```
**Ubicación en UI:** AdminDashboardScreen → Tab "Eventos" → [Ver Analíticas]
**Función API:** `fetchEventAnalytics(eventId)`
**Devuelve:**
```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "event_name": "Concert 2024",
  "total_revenue": 15450.50,
  "tickets_sold": 245,
  "tickets_remaining": 55,
  "event_capacity": 300,
  "occupancy_rate": 0.8167
}
```

---

### 3️⃣ Validar Boleto en Entrada (POST - ADMIN/OPERATOR)
```
POST /tickets/validate
{
  "ticket_code": "TCK-28F63888C02069529F2BBA20CF136E38"
}
```
**Ubicación en UI:** AdminDashboardScreen → Tab "Validar"
**Función API:** `validateTicket(ticketCode)`
**Devuelve:**
```json
{
  "ticket_id": "uuid",
  "status": "USED",
  "message": "Boleto validado, acceso permitido",
  "event_name": "Concert 2024"
}
```
**Errores:**
- `404`: Boleto no encontrado
- `409`: Boleto ya fue escaneado
- `403`: No tienes permisos (necesitas ADMIN o OPERATOR)

---

### 4️⃣ Buscar Orden (GET)
```
GET /orders/{orderId}
```
**Ubicación en UI:** AdminDashboardScreen → Tab "Órdenes" → [Buscar Orden]
**Función API:** `fetchOrderById(orderId)`
**Devuelve:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user-uuid",
  "event_id": "event-uuid",
  "status": "PENDING",
  "total_price": 250.00,
  "items": [
    {
      "ticket_tier_id": "tier-uuid",
      "quantity": 2,
      "price_per_unit": 125.00
    }
  ],
  "created_at": "2024-01-15T10:30:00Z",
  "expires_at": "2024-01-15T10:40:00Z"
}
```

---

### 5️⃣ Confirmar Orden (POST)
```
POST /orders/{orderId}/confirm
```
**Ubicación en UI:** AdminDashboardScreen → Tab "Órdenes" → [Confirmar Pago]
**Función API:** `confirmOrder(orderId)`
**Devuelve:**
```json
{
  "id": "order-uuid",
  "status": "CONFIRMED",
  "tickets": [
    {
      "id": "ticket-uuid",
      "code": "TCK-28F63888C02069529F2BBA20CF136E38",
      "status": "VALID"
    }
  ]
}
```
**Solo funciona si:** Estado de la orden es `PENDING`

---

### 6️⃣ Reservar Boletos (POST)
```
POST /orders/reserve
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "items": [
    {
      "ticket_tier_id": "tier-uuid",
      "quantity": 2
    }
  ]
}
```
**Ubicación en UI:** CheckoutScreen (NO en AdminDashboard)
**Función API:** `reserveOrder(eventId, items)`
**Devuelve:** Objeto Order con estado `PENDING`
**Nota:** Reserva válida por 10 minutos

---

## 🔐 Roles y Permisos

```
┌────────────────────────────────────────────────────┐
│ CLIENTE                  │ OPERATOR              │ ADMIN   │
├──────────────────────────┼──────────────────────┼─────────┤
│ • Ver eventos      ✓     │ • Ver eventos   ✓   │ • TODO  │
│ • Reservar boletos ✓     │ • Validar boletos ✓ │ • TODO  │
│ • Comprar boletos  ✓     │ • Ver órdenes   ✗   │ • TODO  │
│ • Ver mis órdenes  ✓     │ • Ver analíticas ✗  │ • TODO  │
│ • Validar boletos  ✗     │                     │         │
│ • Ver analíticas   ✗     │                     │         │
└────────────────────────────────────────────────────┘

ADMIN = Acceso completo a TODO
OPERATOR = Solo validación de boletos y consulta de eventos
CLIENTE = Solo compra y consulta de sus órdenes
```

---

## 📊 Estados de Objetos

### Estados de Evento
```
DRAFT      → No publicado aún
PUBLISHED  → Disponible para compra
CANCELLED  → Evento cancelado
COMPLETED  → Evento ya pasó
```

### Estados de Orden
```
PENDING    → Reserva temporal (10 min)
CONFIRMED  → Pago realizado, boletos emitidos
EXPIRED    → Reserva expiró sin confirmar
CANCELLED  → Cancelada manualmente
```

### Estados de Boleto
```
VALID      → Listo para usar en la entrada
USED       → Ya fue validado en la entrada
REVOKED    → Cancelado o no válido
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Admin revisa ventas
```javascript
// 1. Listar eventos
GET /events?page=1&limit=50
// ↓
// Recibe: [Event, Event, Event, ...]

// 2. Ver analíticas del primer evento
GET /admin/events/{firstEventId}/analytics
// ↓
// Recibe: { total_revenue: $15,450, tickets_sold: 245, ... }
```

### Ejemplo 2: Operador valida entrada
```javascript
// 1. Usuario escanea código
POST /tickets/validate
{
  "ticket_code": "TCK-28F63888C02069529F2BBA20CF136E38"
}
// ↓
// Respuesta: { status: "USED", message: "Acceso permitido" }
```

### Ejemplo 3: Cliente compra boletos
```javascript
// 1. Ver eventos disponibles
GET /events?status=PUBLISHED

// 2. Ver detalles (en EventDetailScreen)
GET /events/{eventId}

// 3. Reservar boletos (en CheckoutScreen)
POST /orders/reserve
{
  "event_id": "{eventId}",
  "items": [{ "ticket_tier_id": "{tierId}", "quantity": 2 }]
}
// ↓ Recibe orden con estado PENDING

// 4. Confirmar pago
POST /orders/{orderId}/confirm
// ↓ Recibe boletos emitidos

// 5. (Opcional) Ver estado de la orden
GET /orders/{orderId}
```

---

## 🛠️ Estructura de Carpetas

```
TicketFront/src/
├── api/
│   ├── admin.ts          ← fetchEventAnalytics()
│   ├── tickets.ts        ← validateTicket()
│   ├── orders.ts         ← reserveOrder(), confirmOrder(), fetchOrderById()
│   ├── events.ts         ← fetchEvents(), fetchEventById()
│   ├── auth.ts           ← loginRequest(), registerRequest(), etc.
│   └── client.ts         ← Instancia axios con interceptors
│
└── screens/
    ├── AdminDashboardScreen.tsx    ← 👈 NUEVA PANTALLA
    └── ...
```

---

## 🔗 Cómo se Conectan los Endpoints

```
┌─────────────────────────────────────────────────────────────┐
│                   FLUJO COMPLETO                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Usuario hace LOGIN                                       │
│     POST /auth/login → Recibe tokens                         │
│                                                              │
│  2. Ve lista de EVENTOS                                      │
│     GET /events → Recibe array de eventos                    │
│                                                              │
│  3. Selecciona un evento (Admin)                             │
│     GET /admin/events/{id}/analytics → Analíticas            │
│                                                              │
│  4. Cliente selecciona evento y compra                       │
│     POST /orders/reserve → Orden PENDING                     │
│     POST /orders/{id}/confirm → Orden CONFIRMED             │
│     Recibe boletos emitidos                                  │
│                                                              │
│  5. En la entrada, operador valida                           │
│     POST /tickets/validate → Boleto → USED                   │
│                                                              │
│  6. Admin consulta órdenes                                   │
│     GET /orders/{id} → Detalles de la orden                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ⏱️ Tiempos Importantes

| Elemento | Duración |
|----------|----------|
| Reserva temporal | 10 minutos |
| Token access | 15 minutos (configurable) |
| Token refresh | 7 días (configurable) |
| Sesión vigente | Mientras haya refresh token |

---

## ❌ Errores Comunes

```
Error 401 - Unauthorized
└─ Token expirado o no válido
└─ Solución: Refrescar token o hacer login nuevamente

Error 403 - Forbidden
└─ No tienes permisos para esta acción
└─ Solución: Verifica tu rol (ADMIN, OPERATOR, CLIENT)

Error 404 - Not Found
└─ El recurso no existe (evento, orden, boleto)
└─ Solución: Verifica el ID que estás usando

Error 409 - Conflict
└─ Boleto ya fue validado o stock insuficiente
└─ Solución: No puedes validar el mismo boleto dos veces

Error 410 - Gone
└─ La reserva expiró (más de 10 minutos)
└─ Solución: Hacer una nueva reserva
```

---

## 📱 Cómo Acceder a AdminDashboard

1. **Login como ADMIN**
   ```
   Email: admin@example.com
   Password: (la que hayas registrado)
   ```

2. **Ir a ProfileScreen**
   ```
   Barra inferior → Perfil
   ```

3. **Click en "📊 Ir al Dashboard"**
   ```
   Botón naranja que dice "Ir al Dashboard"
   ```

4. **¡Ya estás en AdminDashboard!**
   ```
   Tres tabs: Eventos | Validar | Órdenes
   ```

---

**Última actualización:** 2024
**Versión:** 1.0
