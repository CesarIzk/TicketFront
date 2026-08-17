# 🗺️ Mapa de Navegación - AdminDashboard

## 📱 Flujo de Navegación General

```
                        ┌─────────────────┐
                        │  App Iniciado    │
                        └────────┬─────────┘
                                 │
                    ┌────────────┴─────────────┐
                    │                          │
            ¿Autenticado?                      │
                    │                          │
          ┌─────────┴──────────┐              │
          │                    │              │
         YES                  NO             │
          │                    │              │
          ▼                    ▼              ▼
    ┌─────────────┐    ┌──────────────┐
    │  Navegador  │    │  Navegador   │
    │ Autenticado │    │   Público    │
    └─────────────┘    └──────────────┘
          │                    │
          │          ┌─────────┴─────────┐
          │          │                   │
          ▼          ▼                   ▼
    ┌──────────┐ ┌───────┐         ┌──────────┐
    │ EventsList◄─┤Login │         │ Register │
    └────┬─────┘ └───────┘         └──────────┘
         │          ▲
         │          │
         └──────────┘
```

---

## 🎯 Flujo Específico de AdminDashboard

```
┌─────────────────────────────────────────────────────┐
│              USUARIO ADMIN LOGIN                    │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
         ┌──────────────────────────┐
         │   ProfileScreen (Perfil)  │
         │                          │
         │ Nombre: Juan Admin       │
         │ Email: admin@...         │
         │ Rol: [ADMIN]             │
         │                          │
         │ ┌────────────────────┐   │
         │ │📊 Ir al Dashboard  │◄──┼─── SI ES ADMIN
         │ └────────┬───────────┘   │
         │          │ CLICK          │
         │          ▼               │
         │ ┌────────────────────┐   │
         │ │ AdminDashboard 🎉  │   │
         │ └────────────────────┘   │
         │                          │
         │ ┌────────────────────┐   │
         │ │ [Cerrar Sesión]    │   │
         │ └────────────────────┘   │
         └──────────────────────────┘

         ┌─ SI ES CLIENTE O OPERATOR
         │  El botón NO APARECE ✗
         │
         └──────────────┐
                        │
                    NO ACCESO
```

---

## 🏢 AdminDashboardScreen - Estructura Interna

```
┌────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Dashboard                          [User: Juan Admin] │  │
│  │ Bienvenido, Juan Admin (ADMIN)                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ TAB SELECTOR ──────────────────────────────────────┐   │
│  │  [Eventos]     [Validar]     [Órdenes]             │   │
│  │     ▲                                               │   │
│  │  (Activo)                                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ TAB CONTENT: EVENTOS ──────────────────────────────┐   │
│  │                                                      │   │
│  │  ┌─ EVENT CARD 1 ─────────────────────────────────┐│   │
│  │  │ Concert 2024                                   ││   │
│  │  │ Estado: PUBLISHED                              ││   │
│  │  │                                                 ││   │
│  │  │ ┌─ [Ver Analíticas] ◄─ Si es ADMIN            ││   │
│  │  │ │ (Click expande analíticas)                   ││   │
│  │  │ │                                              ││   │
│  │  │ │ Analíticas:                                  ││   │
│  │  │ │ ├─ Ingresos: $15,450.00                      ││   │
│  │  │ │ ├─ Vendidos: 245                             ││   │
│  │  │ │ ├─ Restantes: 55                             ││   │
│  │  │ │ └─ Ocupación: 81.7%                          ││   │
│  │  │ └─                                             ││   │
│  │  └──────────────────────────────────────────────────┘│   │
│  │                                                      │   │
│  │  ┌─ EVENT CARD 2 ─────────────────────────────────┐│   │
│  │  │ Festival de Verano                             ││   │
│  │  │ Estado: PUBLISHED                              ││   │
│  │  │ ┌─ [Ver Analíticas]                            ││   │
│  │  │ └─                                             ││   │
│  │  └──────────────────────────────────────────────────┘│   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ FOOTER ────────────────────────────────────────────┐   │
│  │ Endpoints Disponibles:                             │   │
│  │ ✓ GET /events                                      │   │
│  │ ✓ GET /admin/events/{id}/analytics                │   │
│  │ ✓ POST /tickets/validate                          │   │
│  │ ✓ POST /orders/reserve                            │   │
│  │ ✓ POST /orders/{id}/confirm                       │   │
│  │ ✓ GET /orders/{id}                                │   │
│  │ ...y más                                           │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Tabs

```
                      AdminDashboardScreen
                             │
                ┌────────────┼────────────┐
                │            │            │
              TAB 1        TAB 2        TAB 3
           "Eventos"     "Validar"    "Órdenes"
                │            │            │
                ▼            ▼            ▼
         ┌────────────┐ ┌──────────┐ ┌────────────┐
         │ GET /events│ │ POST     │ │ GET /orders│
         │            │ │ /tickets/│ │ {id}       │
         │ Lista de   │ │ validate │ │            │
         │ eventos    │ │          │ │ Buscar     │
         │            │ │ Entrada: │ │ orden por  │
         │ GET /admin/│ │ código   │ │ ID         │
         │ events/{id}│ │          │ │            │
         │ /analytics │ │ Validar  │ │ POST       │
         │            │ │ boleto   │ │ /orders/   │
         │ Analíticas │ │          │ │ {id}/      │
         │ (solo      │ │ Result:  │ │ confirm    │
         │ ADMIN)     │ │ ✓/✗      │ │            │
         │            │ │          │ │ Confirmar  │
         │ • Ingresos │ │ Errores: │ │ pago       │
         │ • Vendidos │ │ 404      │ │            │
         │ • Restantes│ │ 409      │ │ Result:    │
         │ • Ocupación│ │ 403      │ │ Orden conf│
         └────────────┘ └──────────┘ └────────────┘
```

---

## 📊 Tabla de Navegación Completa

| Pantalla | Botón/Acción | Destino | Requisito |
|----------|--------------|---------|-----------|
| **EventsListScreen** | Ver evento | EventDetailScreen | Ninguno |
| **EventsListScreen** | Comprar | CheckoutScreen | Autenticado |
| **EventDetailScreen** | Aceptar | CheckoutScreen | Autenticado |
| **CheckoutScreen** | Confirmar compra | TicketsResultScreen | Orden reservada |
| **TicketsResultScreen** | Ir a eventos | EventsListScreen | - |
| **LoginScreen** | Iniciar sesión | EventsListScreen | Credenciales válidas |
| **LoginScreen** | Crear cuenta | RegisterScreen | - |
| **RegisterScreen** | Registrarse | LoginScreen | Datos válidos |
| **ProfileScreen** | Ir al Dashboard | **AdminDashboardScreen** | Role ADMIN |
| **ProfileScreen** | Cerrar sesión | LoginScreen | - |
| **AdminDashboardScreen** | Refrescar | (Recarga eventos) | - |
| **AdminDashboardScreen** | Ver Analíticas | (Expande inline) | Role ADMIN |

---

## 🔐 Árbol de Acceso por Rol

```
                            APP
                             │
                    ┌────────┴────────┐
                    │                 │
              Autenticado      No Autenticado
                    │                 │
         ┌──────────┼──────────┐      │
         │          │          │      │
        ADMIN    OPERATOR    CLIENT   │
         │          │          │      │
         ▼          ▼          ▼      ▼
      ┌────┐     ┌────┐    ┌─────┐ ┌────┐
      │ DA │     │ DA │    │ ELS │ │LS  │
      │ DS │     │ (L)│    │ CS  │ │ RS  │
      │ EP │     │ DS │    │ EDS │ │LS  │
      │ CS │     │ P  │    │ CHS │ │    │
      │ CHS│     │    │    │ TRS │ │    │
      │ TRS│     │    │    │ P   │ │    │
      │ P  │     │    │    │ LS  │ │    │
      └────┘     └────┘    └─────┘ └────┘

LEYENDA:
DA = AdminDashboardScreen (NUEVO!)
DS = Dashboard Summary (conceptual)
EP = Endpoints (en AdminDashboard)
CS = CheckoutScreen
CHS = CheckoutScreen
ELS = EventsListScreen
RS = RegisterScreen
LS = LoginScreen
EDS = EventDetailScreen
TRS = TicketsResultScreen
P = ProfileScreen

ACCESO:
ADMIN    → Todo
OPERATOR → Validar tickets (EP en Dashboard)
CLIENT   → Eventos, Compra, Perfil
GUEST    → Login, Register, Eventos
```

---

## 🚀 Caminos de Usuario Típicos

### Camino 1: Admin Revisa Ventas
```
1. LoginScreen
   ↓ (email: admin@... , password: ...)
2. EventsListScreen
   ↓ (navega hacia)
3. ProfileScreen
   ↓ [📊 Ir al Dashboard]
4. AdminDashboardScreen ✅
   ├─ Tab "Eventos"
   │  └─ [Ver Analíticas] en evento
   │     └─ Ver ingresos, ocupación, etc.
   ├─ Tab "Órdenes"
   │  └─ Buscar orden por ID
   │     └─ Ver estado y confirmación
   └─ Tab "Validar"
      └─ Escanear boletos
```

### Camino 2: Operador Valida Entrada
```
1. LoginScreen
   ↓ (email: operator@... , password: ...)
2. EventsListScreen
   ↓ (navega hacia)
3. ProfileScreen
   ↓ (no ve botón del dashboard)
   └─ Pero puede acceder directamente a /tickets/validate
      (si la URL lo permite)
```

### Camino 3: Cliente Compra Boletos
```
1. LoginScreen
   ↓
2. EventsListScreen
   ↓ [Selecciona evento]
3. EventDetailScreen
   ↓ [Comprar]
4. CheckoutScreen
   ↓ [Confirmar Pago]
5. TicketsResultScreen ✅
   ├─ Ve sus boletos
   └─ (Opcionalmente podría ir al Dashboard para ver estado)
```

---

## 📡 Llamadas a API por Pantalla

```
EventsListScreen
  └─ GET /events

EventDetailScreen
  └─ GET /events/{id}

CheckoutScreen
  └─ POST /orders/reserve
  └─ GET /orders/{id}

TicketsResultScreen
  └─ (Usa datos de CheckoutScreen)

LoginScreen
  └─ POST /auth/login

RegisterScreen
  └─ POST /auth/register

ProfileScreen
  └─ GET /auth/me (del context)
  └─ POST /auth/logout

AdminDashboardScreen ✨ ← NUEVO
  └─ GET /events (Tab Eventos)
  └─ GET /admin/events/{id}/analytics (Tab Eventos)
  └─ POST /tickets/validate (Tab Validar)
  └─ GET /orders/{id} (Tab Órdenes)
  └─ POST /orders/{id}/confirm (Tab Órdenes)
```

---

## 🎨 Estados Visuales

```
Tab "Eventos":
  Normal          Cargando          Con Analíticas
  ┌─────────┐     ┌─────────┐       ┌──────────────┐
  │ Evento  │     │ Loading │       │ Evento       │
  │ [Ver A] │     │  ...    │       │ [Ver A] ▼    │
  └─────────┘     └─────────┘       ├──────────────┤
                                      │ Ingresos: ...│
                                      │ Vendidos: ...│
                                      └──────────────┘

Tab "Validar":
  Input          Validando        Éxito           Error
  ┌────────┐     ┌────────┐       ┌────────┐      ┌────────┐
  │ [  ]   │     │ Check..│       │ ✓ USED │      │ ✗ 404  │
  │ [Val ] │     │        │       │ Event: │      │        │
  └────────┘     └────────┘       └────────┘      └────────┘

Tab "Órdenes":
  No encontrada   Encontrada       Confirmado
  ┌─────────┐     ┌─────────┐      ┌──────────┐
  │ [ID  ]  │     │ ID: ... │      │ Confirm  │
  │ [Buscar]│     │ Status: │      │ ✓ OK     │
  └─────────┘     │ PENDING │      └──────────┘
                  │ [Conf]  │
                  └─────────┘
```

---

## 📋 Checklist de Navegación

```
✅ Login → EventsList (usuario normal)
✅ Login → EventsList → Profile → Dashboard (admin)
✅ Dashboard tabs: Eventos | Validar | Órdenes
✅ Eventos → muestra lista
✅ Eventos → [Ver Analíticas] → expande datos
✅ Validar → entrada de código → resultado
✅ Órdenes → búsqueda por ID → detalles → confirmar
✅ Pull-to-refresh en Dashboard
✅ Error handling en todas las requests
✅ Control de acceso por rol
✅ Botón solo visible para ADMIN
✅ Header muestra rol del usuario
✅ Footer muestra endpoints disponibles
```

---

**Diagrama creado**: 2024
**Versión**: 1.0
**Estado**: Completo y testeado
