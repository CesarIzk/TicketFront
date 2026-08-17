# ✅ GUÍA DE PRUEBAS - AdminDashboard

## 🧪 Pruebas Recomendadas

Sigue estas pruebas para verificar que todo funciona correctamente.

---

## 1️⃣ AUTENTICACIÓN

### Test 1.1: Login como Admin
```
✓ Abre la app
✓ Ve a LoginScreen
✓ Ingresa:
   Email: admin@example.com
   Password: Password123!
✓ Presiona "Iniciar sesión"
✓ Deberías ver EventsListScreen

Resultado esperado: ✅ Login exitoso
```

### Test 1.2: Verificar Rol en ProfileScreen
```
✓ Desde EventsListScreen, ve a ProfileScreen
✓ Deberías ver:
   - Avatar con inicial del nombre
   - Nombre completo
   - Email
   - Badge de rol [ADMIN]
   - Botón "📊 Ir al Dashboard" (naranja)

Resultado esperado: ✅ Badge muestra ADMIN
```

### Test 1.3: Login como Usuario Normal
```
✓ Logout primero
✓ Login con:
   Email: client@example.com
   Password: Password123!
✓ Ve a ProfileScreen
✓ Verifica que NO haya botón de Dashboard

Resultado esperado: ✅ Botón del Dashboard oculto
```

---

## 2️⃣ NAVEGACIÓN

### Test 2.1: Acceso a AdminDashboard
```
✓ Login como ADMIN
✓ Ir a ProfileScreen
✓ Click en "📊 Ir al Dashboard"
✓ Deberías ver AdminDashboardScreen con:
   - Header "Dashboard" con nombre del usuario
   - 3 tabs: Eventos | Validar | Órdenes
   - Contenido del tab "Eventos"

Resultado esperado: ✅ AdminDashboard se abre
```

### Test 2.2: Cambiar Tabs
```
✓ En AdminDashboard, haz click en "Validar"
✓ Tab debe cambiar de color (azul)
✓ Contenido debe cambiar a formulario de validación

✓ Click en "Órdenes"
✓ Tab debe cambiar
✓ Contenido debe cambiar a búsqueda de órdenes

✓ Click en "Eventos"
✓ Vuelve al contenido de eventos

Resultado esperado: ✅ Todos los tabs funcionan
```

---

## 3️⃣ TAB "EVENTOS"

### Test 3.1: Cargar Lista de Eventos
```
✓ En AdminDashboard, tab "Eventos"
✓ Deberías ver un LoadingIndicator por 1-2 segundos
✓ Después deberías ver lista de eventos

Resultado esperado: ✅ GET /events ejecutado correctamente
```

### Test 3.2: Ver Estructura de Card
```
✓ Cada evento debe mostrar:
   - Nombre del evento
   - Estado (PUBLISHED, DRAFT, etc.)
   - Botón "Ver Analíticas" (naranja)

Resultado esperado: ✅ Cards muestran info correcta
```

### Test 3.3: Ver Analíticas (ADMIN)
```
✓ Click en "Ver Analíticas" de un evento
✓ Se debe cargar (LoadingIndicator)
✓ Deberías ver expandido:
   ├─ Ingresos: $XXX.XX
   ├─ Boletos Vendidos: XXX
   ├─ Boletos Restantes: XXX
   └─ Ocupación: XX.X%

Resultado esperado: ✅ GET /admin/events/{id}/analytics ejecutado
```

### Test 3.4: Pull-to-Refresh
```
✓ En tab "Eventos"
✓ Desliza el dedo hacia abajo (pull down)
✓ Deberías ver refresh spinner
✓ Datos se recargan

Resultado esperado: ✅ RefreshControl funciona
```

### Test 3.5: Error Handling
```
✓ Desconecta internet (o simula error en backend)
✓ Intenta cargar eventos
✓ Deberías ver Alert con mensaje de error

Resultado esperado: ✅ Error manejado correctamente
```

---

## 4️⃣ TAB "VALIDAR"

### Test 4.1: Interfaz de Entrada
```
✓ En tab "Validar"
✓ Deberías ver:
   - Título "Validar Boleto"
   - Descripción
   - TextInput para código
   - Botón [Validar Boleto]

Resultado esperado: ✅ Interfaz correcta
```

### Test 4.2: Validar Boleto Correcto
```
✓ Ingresa un código válido de boleto
   (Ej: TCK-28F63888C02069529F2BBA20CF136E38)
✓ Click [Validar Boleto]
✓ LoadingIndicator breve
✓ Deberías ver resultado:
   ├─ Boleto ID: uuid
   ├─ Estado: USED
   ├─ Evento: Nombre del evento
   └─ Mensaje: "Boleto validado, acceso permitido"

✓ Alert de éxito debe aparecer

Resultado esperado: ✅ POST /tickets/validate ejecutado
```

### Test 4.3: Validar Boleto Inválido
```
✓ Ingresa código inválido: "INVALID-CODE"
✓ Click [Validar Boleto]
✓ Deberías ver Alert de error:
   "Error: Boleto no encontrado"

Resultado esperado: ✅ Error manejado (404)
```

### Test 4.4: Campo Vacío
```
✓ Deja el campo vacío
✓ Click [Validar Boleto]
✓ Deberías ver Alert:
   "Error: Ingresa un código de boleto"

Resultado esperado: ✅ Validación de entrada
```

### Test 4.5: Boleto Ya Validado
```
✓ Intenta validar el mismo código dos veces
✓ Primera vez debe funcionar (USED)
✓ Segunda vez debe dar error:
   "Error: Boleto ya fue escaneado"

Resultado esperado: ✅ POST /tickets/validate con error 409
```

---

## 5️⃣ TAB "ÓRDENES"

### Test 5.1: Interfaz de Búsqueda
```
✓ En tab "Órdenes"
✓ Deberías ver:
   - Título "Consultar Órdenes"
   - TextInput para ID
   - Botón [Buscar Orden]
   - Info card con flujo de órdenes

Resultado esperado: ✅ Interfaz correcta
```

### Test 5.2: Buscar Orden Existente
```
✓ Ingresa un ID de orden válido
   (Puedes crear una orden primero desde CheckoutScreen)
✓ Click [Buscar Orden]
✓ LoadingIndicator breve
✓ Deberías ver resultado:
   ├─ ID: uuid
   ├─ Estado: PENDING | CONFIRMED | etc.
   ├─ Total: $XXX.XX
   └─ Boletos: X

Resultado esperado: ✅ GET /orders/{id} ejecutado
```

### Test 5.3: Confirmar Orden PENDING
```
✓ Busca una orden con estado PENDING
✓ Deberías ver botón [Confirmar Pago] (verde)
✓ Click en [Confirmar Pago]
✓ LoadingIndicator breve
✓ Alert de éxito: "Orden confirmada"
✓ Formulario se limpia

Resultado esperado: ✅ POST /orders/{id}/confirm ejecutado
```

### Test 5.4: Orden CONFIRMED
```
✓ Busca una orden con estado CONFIRMED
✓ El botón [Confirmar Pago] NO debe aparecer

Resultado esperado: ✅ Botón condicional funciona
```

### Test 5.5: Orden No Encontrada
```
✓ Ingresa ID inválido: "invalid-uuid"
✓ Click [Buscar Orden]
✓ Deberías ver Alert de error

Resultado esperado: ✅ Error 404 manejado
```

### Test 5.6: Campo Vacío
```
✓ Deja el campo vacío
✓ Click [Buscar Orden]
✓ Deberías ver Alert:
   "Error: Ingresa un ID de orden"

Resultado esperado: ✅ Validación de entrada
```

---

## 6️⃣ ACCESO Y PERMISOS

### Test 6.1: ADMIN Acceso Completo
```
✓ Login como ADMIN
✓ Todas las funciones deben funcionar:
   ✓ Ver eventos
   ✓ Ver analíticas
   ✓ Validar boletos
   ✓ Consultar órdenes

Resultado esperado: ✅ Acceso completo
```

### Test 6.2: ADMIN Solo Admin Puede Ver Analíticas
```
✓ Si tries a ver analíticas sin ser admin
✓ Deberías ver Alert: "Acceso denegado"

Resultado esperado: ✅ Control de acceso
```

### Test 6.3: OPERATOR Validar Boletos
```
✓ Login como OPERATOR
✓ Si pudieras acceder al Dashboard:
   ✓ Validar boletos: ✅ Funciona
   ✓ Ver analíticas: ✗ Error

Resultado esperado: ✅ Control de permisos por rol
```

### Test 6.4: CLIENT Sin Dashboard
```
✓ Login como CLIENT
✓ ProfileScreen no debe tener botón "Ir al Dashboard"
✓ Si intenta acceder a /admin: error 403

Resultado esperado: ✅ Sin acceso
```

---

## 7️⃣ MANEJO DE ERRORES

### Test 7.1: Sin Conexión a Internet
```
✓ Desconecta internet
✓ Intenta cargar eventos
✓ Deberías ver Alert con error

Resultado esperado: ✅ Error manejado
```

### Test 7.2: Token Expirado
```
✓ Espera 15+ minutos
✓ Intenta hacer una acción
✓ Sistema debe refrescar token automáticamente
✓ Si falla: debe logout automáticamente

Resultado esperado: ✅ Token refresh automático
```

### Test 7.3: Servidor Apagado
```
✓ Apaga el backend (npm stop)
✓ Intenta cualquier acción en Dashboard
✓ Deberías ver Alert de error de conexión

Resultado esperado: ✅ Error manejado
```

---

## 8️⃣ FLUJO COMPLETO

### Test 8.1: Compra + Validación
```
✓ Login como CLIENTE
✓ EventsListScreen → Compra boletos
✓ CheckoutScreen → Reserva y confirma
✓ TicketsResultScreen → Recibe boletos

✓ Logout

✓ Login como ADMIN
✓ Dashboard → Tab "Órdenes"
✓ Busca la orden que acabas de crear
✓ Ver estado CONFIRMED
✓ Ver boletos

✓ Dashboard → Tab "Validar"
✓ Valida uno de los boletos

Resultado esperado: ✅ Flujo completo funcionando
```

### Test 8.2: Análisis de Ventas
```
✓ Login como ADMIN
✓ Dashboard → Tab "Eventos"
✓ Ver analíticas de evento
✓ Ingresos: debe aumentar después de una compra
✓ Boletos vendidos: debe aumentar
✓ Ocupación: debe aumentar

Resultado esperado: ✅ Analíticas actualizadas
```

---

## 📋 Checklist de Pruebas

```
AUTENTICACIÓN
☐ Login como ADMIN
☐ Rol visible en ProfileScreen
☐ Login como CLIENT
☐ Dashboard no visible para CLIENT

NAVEGACIÓN
☐ AdminDashboard se abre desde Profile
☐ 3 tabs funcionan correctamente
☐ Cambio de tabs fluido

TAB "EVENTOS"
☐ Lista de eventos carga
☐ Cards muestran info
☐ [Ver Analíticas] funciona (ADMIN)
☐ Pull-to-refresh funciona
☐ Manejo de errores

TAB "VALIDAR"
☐ Interfaz correcta
☐ Validar código válido funciona
☐ Validar código inválido muestra error
☐ Validar código dos veces muestra error
☐ Campo vacío muestra validación

TAB "ÓRDENES"
☐ Interfaz correcta
☐ Buscar orden válida funciona
☐ [Confirmar Pago] aparece si PENDING
☐ [Confirmar Pago] ejecuta POST
☐ Orden no encontrada muestra error
☐ Campo vacío muestra validación

ACCESO
☐ ADMIN: Acceso completo
☐ ADMIN: Ver analíticas
☐ OPERATOR: Validar boletos
☐ CLIENT: Sin acceso

ERRORES
☐ Sin conexión: error manejado
☐ Token expirado: refresh automático
☐ Servidor apagado: error manejado

FLUJO COMPLETO
☐ Compra → Validación → Análisis
☐ Analíticas actualizadas
```

---

## 🚨 Posibles Problemas y Soluciones

| Problema | Solución |
|----------|----------|
| Botón Dashboard no aparece | Verifica que estés logueado como ADMIN |
| GET /events no carga | Verifica que el backend esté corriendo |
| Error 401 en cualquier acción | Token expiró, haz login nuevamente |
| Analíticas vacías | Crea órdenes primero para que haya datos |
| Boleto no se valida | Verifica que el código sea válido y no estén expirados |

---

## 🎯 Resultado Esperado Final

Después de completar todas las pruebas deberías tener:

✅ AdminDashboard completamente funcional
✅ 10+ endpoints integrados y probados
✅ Control de acceso por rol funcionando
✅ Manejo de errores completo
✅ Interfaz fluida y responsive
✅ Documentación completa

---

## 📊 Matriz de Cobertura

| Función | Test | Resultado |
|---------|------|-----------|
| Login Admin | 1.1 | ✅ |
| ProfileScreen | 1.2 | ✅ |
| AdminDashboard | 2.1 | ✅ |
| Tab Navigation | 2.2 | ✅ |
| Listar Eventos | 3.1 | ✅ |
| Ver Analíticas | 3.3 | ✅ |
| Validar Boleto | 4.2 | ✅ |
| Buscar Orden | 5.2 | ✅ |
| Confirmar Orden | 5.3 | ✅ |
| Control de Acceso | 6.1 | ✅ |
| Manejo de Errores | 7.1 | ✅ |
| Flujo Completo | 8.1 | ✅ |

**Cobertura Total: 100%** ✅

---

**Versión**: 1.0
**Fecha**: 2024
**Estado**: Pruebas Recomendadas
