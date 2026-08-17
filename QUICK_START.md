# 🚀 GUÍA DE INICIO RÁPIDO - AdminDashboard

## ⚡ En 2 Minutos

### Paso 1: Iniciar el Backend
```bash
cd TicketBack
npm start
# Escuchar en http://localhost:3000
```

### Paso 2: Iniciar el Frontend
```bash
cd TicketFront
npm start
# Expo me mostrará un QR o acceso a http://localhost:19000
```

### Paso 3: Login como Admin
```
Email: admin@example.com
Password: Password123!
```

### Paso 4: Ir al Dashboard
1. Tap en el ícono de perfil (inferior derecha)
2. Haz tap en el botón naranja "📊 Ir al Dashboard"
3. ¡Disfruta! 🎉

---

## 📱 Qué Puedes Hacer Ahora

### En el Tab "Eventos"
```
✅ VER LISTA DE EVENTOS
   - GET /events
   - Muestra todos los eventos con paginación

✅ VER ANALÍTICAS
   - GET /admin/events/{id}/analytics
   - Ingresos totales, boletos vendidos, ocupación
   - Click en [Ver Analíticas] de cualquier evento
```

### En el Tab "Validar"
```
✅ VALIDAR BOLETOS
   - POST /tickets/validate
   - Ingresa un código tipo: TCK-28F63888C02069529F2BBA20CF136E38
   - El boleto cambia de VALID → USED
```

### En el Tab "Órdenes"
```
✅ BUSCAR ÓRDENES
   - GET /orders/{id}
   - Ingresa un ID de orden (UUID)
   - Ver estado (PENDING, CONFIRMED, etc.)

✅ CONFIRMAR PAGO
   - POST /orders/{id}/confirm
   - Si la orden está PENDING, puedes confirmar
   - Emite los boletos automáticamente
```

---

## 🎯 Endpoints Principales Usados

```
1. GET /events
   ↓ Para listar todos los eventos

2. GET /admin/events/{eventId}/analytics
   ↓ Para ver estadísticas de un evento (ADMIN ONLY)

3. POST /tickets/validate
   ↓ Para validar un boleto en la entrada

4. GET /orders/{orderId}
   ↓ Para consultar una orden existente

5. POST /orders/{orderId}/confirm
   ↓ Para confirmar el pago de una orden

+ 5 endpoints más de autenticación y eventos
```

---

## 📊 Datos de Ejemplo

### Ejemplo 1: Validar Boleto
```
Entrada: TCK-28F63888C02069529F2BBA20CF136E38
Resultado:
  ✓ Status: USED
  ✓ Evento: Concert 2024
  ✓ Mensaje: Boleto validado, acceso permitido
```

### Ejemplo 2: Ver Analíticas
```
Evento: Concert 2024
Resultado:
  • Ingresos: $15,450.50
  • Boletos Vendidos: 245
  • Boletos Restantes: 55
  • Ocupación: 81.7%
```

### Ejemplo 3: Confirmar Orden
```
Orden ID: 550e8400-e29b-41d4-a716-446655440000
Estado Antes: PENDING
→ [Confirmar Pago]
Estado Después: CONFIRMED
Boletos Emitidos: 2
```

---

## 🔑 Importante: Roles

```
👨‍💼 ADMIN
   ✅ Ver todo
   ✅ Ver analíticas
   ✅ Validar boletos
   ✅ Acceso a Dashboard

👮 OPERATOR
   ✅ Validar boletos
   ✅ Ver eventos
   ❌ Sin Dashboard

👤 CLIENT
   ✅ Comprar boletos
   ✅ Ver eventos
   ❌ Sin Dashboard
```

---

## 🛠️ Archivos Creados

| Archivo | Propósito |
|---------|-----------|
| `src/api/admin.ts` | Funciones de admin |
| `src/api/tickets.ts` | Validar boletos |
| `src/screens/AdminDashboardScreen.tsx` | Pantalla principal |
| `ADMIN_DASHBOARD_GUIDE.md` | Guía completa |
| `ENDPOINTS_REFERENCE.md` | Referencia de endpoints |
| `NAVIGATION_MAP.md` | Mapa de navegación |
| `CHANGES_SUMMARY.md` | Resumen de cambios |

---

## 🎨 Estructura de la Pantalla

```
┌─────────────────────────────────────────┐
│        Dashboard Admin                  │
│   Bienvenido, Juan (ADMIN)              │
├─────────────────────────────────────────┤
│ [Eventos]  [Validar]  [Órdenes]         │
├─────────────────────────────────────────┤
│                                         │
│  CONTENIDO DEL TAB ACTIVO               │
│                                         │
│  - Eventos: Lista eventos + analíticas  │
│  - Validar: Ingresa código de boleto    │
│  - Órdenes: Busca y confirma órdenes   │
│                                         │
├─────────────────────────────────────────┤
│  Endpoints Disponibles: ✓               │
│  ✓ GET /events                          │
│  ✓ GET /admin/events/{id}/analytics    │
│  ✓ POST /tickets/validate              │
│  ✓ POST /orders/{id}/confirm           │
│  ... y más                              │
└─────────────────────────────────────────┘
```

---

## 💻 Comandos Útiles

```bash
# Backend
cd TicketBack
npm start                    # Iniciar servidor
npm test                     # Ejecutar tests
npm run swagger             # Ver API docs

# Frontend
cd TicketFront
npm start                    # Iniciar Expo
npm test                     # Ejecutar tests
npm run build               # Build para producción

# Git
git status                   # Ver cambios
git add .                    # Agregar todo
git commit -m "Mensaje"      # Commit
git push                     # Push
```

---

## ❌ Si Algo Falla

### Error: "No tienes permisos"
✅ Verifica que estés logueado como ADMIN
```
ProfileScreen → Rol debe ser [ADMIN]
```

### Error: "Boleto no encontrado"
✅ El código del boleto es inválido
```
Formato correcto: TCK-28F63888C02069529F2BBA20CF136E38
```

### Error: "Orden no encontrada"
✅ El ID de la orden no existe
```
Formato correcto: UUID (550e8400-e29b-41d4-a716-446655440000)
```

### Error: "La reserva expiró"
✅ La orden tardó más de 10 minutos sin confirmar
```
Solución: Crear una nueva reserva
```

### Error: "401 Unauthorized"
✅ Tu token expiró
```
Solución: Vuelve a hacer login
```

---

## 📚 Documentación Completa

Para más detalles, revisa estos archivos:

| Archivo | Contenido |
|---------|-----------|
| `ADMIN_DASHBOARD_GUIDE.md` | Guía técnica completa con diagramas |
| `ENDPOINTS_REFERENCE.md` | Referencia de cada endpoint con ejemplos |
| `NAVIGATION_MAP.md` | Flujo de navegación con diagramas ASCII |
| `CHANGES_SUMMARY.md` | Resumen técnico de cambios realizados |

---

## 🎯 Casos de Uso Comunes

### Caso 1: Revisar Ventas de un Evento
```
1. Dashboard → Tab "Eventos"
2. Encontrar evento
3. [Ver Analíticas]
4. Ver: Ingresos, Vendidos, Ocupación
```

### Caso 2: Validar Entrada de Concierto
```
1. Dashboard → Tab "Validar"
2. Escanear código QR: TCK-xxxxx
3. Sistema marca como USED
4. Acceso permitido ✓
```

### Caso 3: Confirmar Pago de Cliente
```
1. Dashboard → Tab "Órdenes"
2. Ingresar ID de la orden
3. Ver estado PENDING
4. [Confirmar Pago]
5. Cliente recibe boletos
```

---

## 🚨 Notas Importantes

⚠️ **Reservas temporales**: Expiran en 10 minutos
⚠️ **Boletos validados**: No se pueden validar dos veces
⚠️ **Admin requerido**: Algunos endpoints solo para ADMIN
⚠️ **JWT Token**: Válido por 15 minutos, luego refresh automático

---

## 📞 Resumen de lo que se Implementó

✅ **AdminDashboardScreen.tsx**
   - 600+ líneas de código
   - 3 tabs funcionales
   - Integración de 10+ endpoints

✅ **API Functions**
   - fetchEventAnalytics() en admin.ts
   - validateTicket() en tickets.ts

✅ **Navegación**
   - Ruta agregada a RootNavigator
   - Botón en ProfileScreen para admins
   - Tipos actualizados

✅ **Documentación**
   - 4 archivos de documentación
   - Ejemplos JSON
   - Diagramas ASCII

✅ **Control de Acceso**
   - Solo ADMIN ve el botón del dashboard
   - Validación de permisos en cada endpoint
   - Manejo de errores completo

---

## 🎉 ¡Listo para Usar!

Tu AdminDashboard está completamente funcional y listo para:
- ✅ Monitorear eventos
- ✅ Ver analíticas
- ✅ Validar boletos
- ✅ Gestionar órdenes

**¡Inicia sesión como ADMIN y pruébalo ahora!** 🚀

---

**Versión**: 1.0
**Estado**: ✅ Completado
**Fecha**: 2024
