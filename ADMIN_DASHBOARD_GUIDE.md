# AdminDashboardScreen - Documentación Completa

## 📋 Descripción General

El `AdminDashboardScreen` es una pantalla integral en TicketFront que integra **todos los endpoints disponibles** del backend TicketBack. Proporciona una interfaz unificada para:

- ✅ Listar y ver detalles de eventos
- ✅ Ver analíticas de eventos (solo admins)
- ✅ Validar boletos en la entrada
- ✅ Consultar y confirmar órdenes de compra
- ✅ Gestionar reservas de boletos

## 🎯 Endpoints Utilizados

### 1. **Eventos** (GET)
- **Endpoint**: `GET /api/v1/events`
- **Descripción**: Lista todos los eventos con paginación
- **Parámetros**: `page`, `limit`, `status`, `search`
- **Localización en UI**: Tab "Eventos"
- **Archivo API**: `src/api/events.ts` → `fetchEvents()`

### 2. **Detalle de Evento** (GET)
- **Endpoint**: `GET /api/v1/events/{id}`
- **Descripción**: Obtiene los detalles completos de un evento
- **Localización en UI**: Se puede expandir desde la lista
- **Archivo API**: `src/api/events.ts` → `fetchEventById()`

### 3. **Analíticas de Evento** (GET - SOLO ADMIN)
- **Endpoint**: `GET /api/v1/admin/events/{id}/analytics`
- **Descripción**: Obtiene métricas de ingresos, boletos vendidos y ocupación
- **Datos devueltos**:
  - `total_revenue`: Ingresos totales en USD
  - `tickets_sold`: Cantidad de boletos vendidos
  - `tickets_remaining`: Boletos disponibles
  - `occupancy_rate`: Porcentaje de ocupación (0-1)
- **Localización en UI**: Tab "Eventos" → Botón "Ver Analíticas"
- **Archivo API**: `src/api/admin.ts` → `fetchEventAnalytics()`
- **Permisos**: Solo usuarios con rol `ADMIN`

### 4. **Validar Boleto** (POST - STAFF ONLY)
- **Endpoint**: `POST /api/v1/tickets/validate`
- **Descripción**: Escanea un boleto y marca como USED
- **Request Body**:
  ```json
  {
    "ticket_code": "TCK-28F63888C02069529F2BBA20CF136E38"
  }
  ```
- **Response**:
  ```json
  {
    "ticket_id": "uuid",
    "status": "USED",
    "message": "Boleto validado",
    "event_name": "Concert 2024"
  }
  ```
- **Localización en UI**: Tab "Validar"
- **Archivo API**: `src/api/tickets.ts` → `validateTicket()`
- **Permisos**: Solo usuarios con rol `ADMIN` o `OPERATOR`

### 5. **Reservar Orden** (POST)
- **Endpoint**: `POST /api/v1/orders/reserve`
- **Descripción**: Reserva temporal de boletos (10 minutos de hold)
- **Request Body**:
  ```json
  {
    "event_id": "uuid",
    "items": [
      {
        "ticket_tier_id": "uuid",
        "quantity": 2
      }
    ]
  }
  ```
- **Response**: Objeto Order con estado `PENDING` y `expires_at`
- **Archivo API**: `src/api/orders.ts` → `reserveOrder()`
- **Nota**: La pantalla permite buscar órdenes existentes, pero la reserva se realiza desde `CheckoutScreen`

### 6. **Confirmar Orden** (POST)
- **Endpoint**: `POST /api/v1/orders/{id}/confirm`
- **Descripción**: Confirma el pago y emite los boletos
- **Localización en UI**: Tab "Órdenes" → Si la orden está PENDING
- **Archivo API**: `src/api/orders.ts` → `confirmOrder()`
- **Estados de Orden**:
  - `PENDING`: Esperando confirmación de pago
  - `CONFIRMED`: Pago confirmado, boletos emitidos
  - `EXPIRED`: La reserva expiró
  - `CANCELLED`: Orden cancelada

### 7. **Obtener Orden** (GET)
- **Endpoint**: `GET /api/v1/orders/{id}`
- **Descripción**: Consulta el estado y detalles de una orden
- **Localización en UI**: Tab "Órdenes" → Buscar por ID
- **Archivo API**: `src/api/orders.ts` → `fetchOrderById()`

### 8. **Autenticación**
- **Endpoints utilizados internamente**:
  - `POST /api/v1/auth/login` - Realizado en `LoginScreen`
  - `POST /api/v1/auth/register` - Realizado en `RegisterScreen`
  - `GET /api/v1/auth/me` - Se obtiene del `AuthContext`
  - `POST /api/v1/auth/logout` - Se realiza desde el perfil

## 🏗️ Estructura de Archivos

```
TicketFront/src/
├── api/
│   ├── admin.ts           ← 📌 NUEVO - Función fetchEventAnalytics()
│   ├── auth.ts            ← Funciones de autenticación
│   ├── events.ts          ← Funciones de eventos
│   ├── orders.ts          ← Funciones de órdenes
│   ├── tickets.ts         ← 📌 NUEVO - Función validateTicket()
│   ├── client.ts          ← Cliente axios configurado
│   └── storage.ts         ← Almacenamiento de tokens
│
├── screens/
│   ├── AdminDashboardScreen.tsx    ← 📌 NUEVO - Pantalla principal
│   ├── EventsListScreen.tsx        ← Listado de eventos
│   ├── EventDetailScreen.tsx       ← Detalle del evento
│   ├── CheckoutScreen.tsx          ← Compra de boletos
│   ├── TicketsResultScreen.tsx     ← Boletos emitidos
│   ├── LoginScreen.tsx             ← Iniciar sesión
│   ├── RegisterScreen.tsx          ← Registro
│   └── ProfileScreen.tsx           ← Perfil (modificado)
│
├── navigation/
│   ├── RootNavigator.tsx           ← 📌 MODIFICADO - Agregar ruta
│   └── types.ts                    ← 📌 MODIFICADO - Agregar tipo
│
├── context/
│   └── AuthContext.tsx             ← Contexto de autenticación
│
├── types/
│   └── api.ts                      ← Tipos TypeScript
│
└── App.tsx                         ← Entry point
```

## 🎨 Funcionalidades por Tab

### Tab 1: Eventos 📍
**Funcionalidad**: Listado de eventos con análisis

```
┌─────────────────────────────────────────┐
│  Evento 1: Concert 2024                 │
│  Estado: PUBLISHED                      │
│  [Ver Analíticas] ← Solo Admins         │
│                                         │
│  Analíticas (expandible):               │
│  ├─ Ingresos: $15,450.00                │
│  ├─ Boletos Vendidos: 245               │
│  ├─ Boletos Restantes: 55               │
│  └─ Ocupación: 81.7%                    │
└─────────────────────────────────────────┘
```

**Estados posibles del evento**: DRAFT, PUBLISHED, CANCELLED, COMPLETED

### Tab 2: Validar ✓
**Funcionalidad**: Validación de boletos en la entrada

```
┌─────────────────────────────────────────┐
│  Escanear boleto en la entrada          │
│                                         │
│  [Código de boleto TCK-...]             │
│  [Validar Boleto]                       │
│                                         │
│  Resultado:                             │
│  ├─ Boleto ID: uuid                     │
│  ├─ Estado: USED                        │
│  ├─ Evento: Concert 2024                │
│  └─ Mensaje: Acceso permitido           │
└─────────────────────────────────────────┘
```

**Errores posibles**:
- `404`: Boleto no encontrado
- `409`: Boleto ya fue escaneado
- `403`: Sin permisos de staff / Boleto revocado

### Tab 3: Órdenes 📦
**Funcionalidad**: Consulta y gestión de órdenes

```
┌─────────────────────────────────────────┐
│  Buscar Orden                           │
│  [ID de la orden (UUID)]                │
│  [Buscar Orden]                         │
│                                         │
│  Detalles de la Orden:                  │
│  ├─ ID: uuid                            │
│  ├─ Estado: PENDING                     │
│  ├─ Total: $250.00                      │
│  ├─ Boletos: 2                          │
│  └─ [Confirmar Pago]                    │
│                                         │
│  Flujo de Órdenes:                      │
│  1. Reserve: Crea reserva (10 min)      │
│  2. Confirm: Confirma y emite boletos   │
│  3. Get: Consulta estado                │
└─────────────────────────────────────────┘
```

**Estados de orden**:
- `PENDING`: Reserva temporal activa (10 min)
- `CONFIRMED`: Pago confirmado ✓
- `EXPIRED`: Reserva expiró ✗
- `CANCELLED`: Cancelada manualmente

## 🔐 Control de Acceso

### Para Admins
- ✅ Ver todos los eventos
- ✅ Ver analíticas detalladas
- ✅ Validar boletos
- ✅ Consultar cualquier orden
- ✅ Acceso al Dashboard desde el perfil

### Para Operadores
- ✅ Validar boletos (para entrada)
- ✅ Ver eventos
- ❌ Ver analíticas
- ❌ Gestionar órdenes

### Para Clientes
- ✅ Ver eventos disponibles
- ✅ Comprar boletos
- ✅ Consultar sus propias órdenes
- ❌ Validar boletos
- ❌ Ver analíticas

## 💾 Flujo de Datos

### Flujo de Compra Completo
```
1. EventsListScreen
   └─ GET /events → Listar eventos

2. EventDetailScreen
   └─ GET /events/{id} → Detalles del evento

3. CheckoutScreen
   └─ POST /orders/reserve → Crear reserva temporal
   └─ POST /orders/{id}/confirm → Confirmar pago

4. TicketsResultScreen
   └─ Mostrar boletos emitidos

5. AdminDashboardScreen (Tab Órdenes)
   └─ GET /orders/{id} → Consultar estado
```

### Flujo de Validación en Entrada
```
AdminDashboardScreen (Tab Validar)
└─ POST /tickets/validate → Marcar boleto como USED
└─ Estado cambia: VALID → USED
```

### Flujo de Analíticas
```
AdminDashboardScreen (Tab Eventos)
└─ GET /events → Listar eventos
└─ GET /admin/events/{id}/analytics → Métricas por evento
```

## 🛠️ Instalación y Uso

### Paso 1: Archivos Creados
```typescript
// src/api/admin.ts - Ya creado
export async function fetchEventAnalytics(eventId: string)

// src/api/tickets.ts - Ya creado
export async function validateTicket(ticket_code: string)
```

### Paso 2: Pantalla Agregada
```typescript
// src/screens/AdminDashboardScreen.tsx - Ya creado
// Componente principal con todos los tabs
```

### Paso 3: Navegación Actualizada
```typescript
// src/navigation/types.ts - Actualizado
// Agregado tipo AdminDashboard

// src/navigation/RootNavigator.tsx - Actualizado
// Agregado Stack.Screen para AdminDashboard
```

### Paso 4: Acceso desde Perfil
```typescript
// src/screens/ProfileScreen.tsx - Actualizado
// Agregado botón para ir al Dashboard si es ADMIN
```

## 🚀 Cómo Acceder

### Para usuarios ADMIN
1. Inicia sesión con cuenta admin
2. Ve a "Mi perfil"
3. Haz clic en "📊 Ir al Dashboard"
4. ¡Acceso completo a todas las funcionalidades!

### Para usuarios normales
- La pantalla no es accesible (falta en la navegación)
- Pero pueden usar la compra de boletos normalmente

## 📊 Endpoints Resumen

| Método | Endpoint | Función | Auth |
|--------|----------|---------|------|
| GET | `/events` | Listar eventos | Opcional |
| GET | `/events/{id}` | Detalle evento | Opcional |
| GET | `/admin/events/{id}/analytics` | Analíticas | ADMIN |
| POST | `/orders/reserve` | Reservar boletos | Requerido |
| POST | `/orders/{id}/confirm` | Confirmar pago | Requerido |
| GET | `/orders/{id}` | Obtener orden | Requerido |
| POST | `/tickets/validate` | Validar boleto | ADMIN/OPERATOR |
| POST | `/auth/login` | Iniciar sesión | No |
| POST | `/auth/register` | Registrarse | No |
| GET | `/auth/me` | Perfil actual | Requerido |
| POST | `/auth/logout` | Cerrar sesión | Requerido |

## 🎯 Casos de Uso

### Caso 1: Administrador revisando ventas
1. Login como ADMIN
2. Ir a Dashboard
3. Tab "Eventos" → Ver lista completa
4. Click "Ver Analíticas" en evento específico
5. Analizar ingresos, ocupación, ventas

### Caso 2: Operador validando entrada
1. Login como OPERATOR
2. Ir a Dashboard
3. Tab "Validar"
4. Escanear código del boleto
5. Sistema marca como USED automáticamente

### Caso 3: Cliente comprando boletos
1. Login como CLIENT
2. Ver lista de eventos (EventsListScreen)
3. Seleccionar evento
4. Ir a Checkout → Reservar boletos
5. Confirmar pago → Recibir boletos
6. (Opcional) Consultar estado en Dashboard → Tab "Órdenes"

## ⚠️ Consideraciones Técnicas

### Estado de la Aplicación
- Se usa `useAuth()` para obtener el usuario actual
- Se usa `useState` para estado local de cada tab
- Se implementó `RefreshControl` para actualizar datos

### Manejo de Errores
- Todos los endpoints usan try-catch
- Se muestran mensajes de error con `Alert.alert()`
- Se manejan validaciones de entrada (campos vacíos)

### Performance
- Los datos se cargan bajo demanda (no todo al iniciar)
- Las analíticas se cargan solo al hacer click
- Se usa paginación en la lista de eventos (página 1, límite 50)

### Seguridad
- El token JWT se adjunta automáticamente (axios interceptor)
- Los datos sensibles no se exponen en logs
- Las funciones admin requieren rol específico

## 🔄 Flujo de Actualización

Para actualizar datos en la pantalla:
1. Usa el botón de **Refresh** (Pull to Refresh)
2. O abre otro tab y vuelve
3. O cierra y vuelve a abrir la pantalla

## 📝 Notas Importantes

- Las reservas expiran en **10 minutos**
- Un boleto validado **no puede volver a validarse**
- Las analíticas solo están disponibles para **ADMIN**
- La validación de boletos requiere rol de **ADMIN/OPERATOR**

---

**Creado**: 2024
**Versión**: 1.0
**Stack**: React Native + TypeScript + Expo
**Backend**: Node.js + Express
