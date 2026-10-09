## Problema encontrado: Pérdida de sesión al recargar y caídas del servidor

### Diagnóstico
*   **Comportamiento esperado:** Al iniciar sesión y recargar la página (F5), el usuario debe mantener su sesión activa. El servidor debe rechazar tokens inválidos sin apagarse.
*   **Comportamiento observado:** Al recargar la página, la sesión se perdía y la consola mostraba errores `401 Unauthorized`. En el backend, un token malo causaba que todo el servidor colapsara (`ReferenceError`). Además, la clave secreta se guardaba en un archivo local, lo que haría que las sesiones se borraran al subir el proyecto a la nube.
*   **Causa raíz:** 
    1. En el frontend, el token solo se guardaba temporalmente en la memoria de React, no de forma persistente.
    2. En el backend, el archivo `middleware.js` tenía errores al intentar leer el token, y no atrapaba los errores de validación. La clave secreta dependía de una carpeta local en lugar de usar variables de entorno.

### Corrección Funcional
*   **Frontend:** Se configuró `window.localStorage` para guardar y recuperar el token al cargar la aplicación. Se creó la ruta `GET /api/status` en el backend para validar que la sesión sigue activa.
*   **Backend:** Se reescribió la función de seguridad (`authenticate`) en `middleware.js` para extraer bien el token y usar un bloque `try/catch` que evita que el servidor se caiga si el token expiró. En `config.js` se forzó el uso de la variable `JWT_SECRET` en el archivo `.env`.

### Pruebas de Regresión
**Prueba automatizada:**
El test que verifica la sesión ahora pasa exitosamente.
*   *Comando usado:* `npx playwright test`
*   *Antes:* Fallaba por tiempo de espera al recargar la página.
*   *Después:* `PASS` (Conserva la sesión después de recargar).

### Explicación Técnica
Aplicando los conceptos de la Parte 4 y 5 del curso, la autenticación con tokens funciona de forma independiente; el backend no recuerda las sesiones, así que el navegador (React) debe guardarlas. En el backend, la función de seguridad se arregló para actuar como una barrera firme que rechaza peticiones malas antes de que toquen la base de datos.

---

## Problema encontrado: Usuarios modificando información que no les pertenece

### Diagnóstico
*   **Comportamiento esperado:** Las rutas que leen o modifican datos deben estar protegidas. Solo el dueño de un proyecto debería poder cambiar su presupuesto, y solo ciertas personas deberían poder borrar contactos.
*   **Comportamiento observado:** Cualquier persona sin iniciar sesión podía leer toda la base de datos visitando las rutas directamente. Además, alguien con sesión iniciada podía cambiar el presupuesto de proyectos de otros compañeros. Al registrarse, un usuario nuevo podía enviarse a sí mismo el rol de administrador.
*   **Causa raíz:** Faltaba colocar la barrera de seguridad (`authenticate`) en las rutas de lectura. En las rutas de actualización (PATCH) no se verificaba si el usuario que hacía la petición era realmente el dueño del proyecto. Al crear usuarios, se aceptaba el rol directamente de los datos que enviaba el cliente.

### Corrección Funcional
*   Se agregó la protección `authenticate` a todas las rutas de lectura.
*   En `projects.js` y `tasks.js`, ahora se busca primero el documento en la base de datos y se compara si el dueño del proyecto coincide con el usuario logueado (`req.user.id`). Si no coinciden, se bloquea la acción.
*   En `contacts.js`, se agregó una validación para que solo los usuarios con rol de "Dirección creativa" o "admin" puedan modificar o eliminar contactos.
*   En `auth.js`, al crear un usuario nuevo, el rol se ignora y el backend le asigna automáticamente el rol básico de 'Miembro'.

### Pruebas de Regresión
**Prueba de Integración:**
*   *Antes:* Los tests de seguridad fallaban porque el sistema permitía borrar proyectos ajenos.
*   *Después:* El test "otra persona no puede eliminar un proyecto" pasa exitosamente.
*   *Evidencia:* La petición rechaza el borrado con un error 403 (Prohibido).

### Explicación Técnica
Siguiendo la Parte 4 del curso, iniciar sesión no es suficiente. El token solo dice *quién* es el usuario, pero el servidor es el único responsable de revisar si esa persona tiene *permiso* para modificar un archivo específico. También se evitó la inyección de datos al no confiar ciegamente en lo que envía el formulario de registro.

---

## Problema encontrado: Errores en cálculos matemáticos y spam de "Me gusta"

### Diagnóstico
*   **Comportamiento esperado:** Los cálculos de tiempo y promedios deben dar números exactos, y los botones de "Me gusta" solo deben sumar un voto por persona.
*   **Comportamiento observado:** En los reportes, los cálculos de tiempo mostraban textos raros unidos (ej. "024") en lugar de sumas. El promedio fallaba si solo había una tarea. Un mismo usuario podía dar clics infinitos en el botón de "Me gusta" de un recurso.
*   **Causa raíz:** Todos los modelos de la base de datos estaban amontonados en un solo archivo gigante. El tiempo de las tareas estaba definido como texto (`String`) en lugar de número, lo que hacía que JavaScript uniera los textos en vez de sumarlos. La fórmula del promedio dividía mal. En los recursos, los likes solo sumaban +1 sin registrar quién votaba.

### Corrección Funcional
*   **Organización:** Se separó cada modelo de la base de datos en su propio archivo (`user.js`, `project.js`, etc.) para mantener el orden.
*   **Datos:** Se cambió el esquema de tareas a `type: Number`.
*   **Fórmulas:** Se arregló la división del promedio en `metrics.js` para que no divida entre cero si hay una sola tarea.
*   **Votos:** Se cambió el contador de likes por una lista. Ahora el servidor usa el comando `$addToSet` de MongoDB, que asegura que el ID del usuario solo se agregue una vez a la lista, sin importar cuántas veces haga clic.

### Pruebas de Regresión
**Pruebas Unitarias:**
*   *Antes:* El test del promedio arrojaba el error `Infinity`. El test de sumar horas fallaba por unir texto.
*   *Después:* `PASS`. La división matemática y la suma de horas dan los resultados correctos.

### Explicación Técnica
En línea con la Parte 3 del curso (Mongoose), es importante usar el tipo de dato correcto (Números en lugar de Textos) en la base de datos para evitar que la lógica matemática del programa falle más adelante. Para los "Me gusta", delegar el control de duplicados directamente a MongoDB (`$addToSet`) es mucho más seguro que intentar controlarlo manualmente.

---

## Problema encontrado: Fallos en la interfaz y botones que no responden

### Diagnóstico
*   **Comportamiento observado:** El botón de "Registrar 2 sesiones" solo registraba 1. Marcar una casilla en las listas no actualizaba la pantalla. Los paneles no se podían cerrar desde botones externos y el buscador de contactos fallaba si usabas mayúsculas.
*   **Causa raíz:** React agrupa las actualizaciones rápidas, por lo que intentar sumar +1 dos veces seguidas con el mismo valor inicial solo sumaba 1. En las listas, se estaba modificando la variable directamente en lugar de hacer una copia nueva, por lo que React no se daba cuenta del cambio para refrescar la pantalla.

### Corrección Funcional
*   En `FocusCounter.jsx`, se cambió la forma de sumar a `setSessions((prev) => prev + 2)`.
*   En `Checklist.jsx`, se creó una copia nueva del arreglo antes de guardarlo en el estado.
*   Se solucionó el problema de las referencias usando la herramienta `forwardRef` en los paneles de la interfaz, y se ajustó el buscador en `format.js` para que convierta todo a minúsculas (`toLowerCase`) antes de buscar.

### Pruebas de Regresión
**Pruebas de Componente (React):**
*   *Antes:* Los tests de simular clics en las casillas y botones fallaban.
*   *Después:* Todas las pruebas en `workspace.test.jsx` pasan correctamente, confirmando que la pantalla ahora sí se actualiza al interactuar.

### Explicación Técnica
Estos cambios aplican las reglas principales de la Parte 5 del curso sobre el estado en React: nunca se deben modificar las variables de estado directamente. Siempre se debe crear una copia nueva para que React compare los cambios y sepa que tiene que volver a dibujar la pantalla.

### Revisión de Tests

**Salida de consola con npm run test:**
PS C:\Users\diego\OneDrive\Documentos\Nexo-practica\nexo> npm run test

> nexo-workspace@1.4.0 test
> npm run test:unit && npm run test:api


> nexo-workspace@1.4.0 test:unit
> vitest run


 RUN  v5.0.3 C:/Users/diego/OneDrive/Documentos/Nexo-practica/nexo


 ✓ src/utils/format.test.js (5 tests) 9ms
 ✓ src/stores/stores.test.js (5 tests) 12ms
 ✓ src/context/notifications.test.jsx (1 test) 120ms
 ✓ src/components/workspace.test.jsx (6 tests) 105ms

 Test Files  4 passed (4)
      Tests  17 passed (17)
   Start at  10:40:38
   Duration  3.78s (environment 64%, setup 23%, import 6%, transform 5%, tests 2%)


> nexo-workspace@1.4.0 test:api
> node --test --test-concurrency=1 server/tests/*.test.js

POST /api/login 200 467 - 87.724 ms
GET /api/health 200 54 - 0.380 ms
✔ el servicio responde con JSON (1306.9197ms)
POST /api/login 200 467 - 69.143 ms
GET /api/unknown 404 31 - 0.691 ms
✔ las rutas desconocidas responden 404 (215.728ms)
POST /api/login 200 467 - 61.209 ms
GET /api/projects 200 2199 - 17.266 ms
✔ los proyectos tienen identificador público y miembros relacionados (183.2074ms)
POST /api/login 200 467 - 62.147 ms
POST /api/projects 401 45 - 0.271 ms
✔ crear un proyecto requiere una sesión (157.8774ms)
POST /api/login 200 467 - 61.292 ms
POST /api/projects 201 339 - 3.818 ms
✔ crear un proyecto lo conserva en MongoDB (162.0407ms)
POST /api/login 200 467 - 59.462 ms
POST /api/projects 400 120 - 1.425 ms
✔ rechaza un nombre demasiado corto al crear (154.8035ms)
POST /api/login 200 467 - 62.799 ms
PATCH /api/projects/6ac9190e7405e4be1490a941 400 188 - 2.248 ms
✔ también valida nombre y presupuesto al actualizar (158.1024ms)
POST /api/login 200 467 - 61.481 ms
GET /api/projects/invalid 400 26 - 1.112 ms
✔ rechaza identificadores malformados con 400 (150.223ms)
POST /api/login 200 467 - 60.649 ms
DELETE /api/projects/6ac9190e7405e4be1490a9e6 204 - - 7.513 ms
✔ la persona responsable puede eliminar su propio proyecto (163.9429ms)
POST /api/login 200 467 - 66.180 ms
DELETE /api/projects/6ac9190f7405e4be1490aa3e 403 69 - 1.472 ms
✔ otra persona no puede eliminar un proyecto (157.3186ms)
POST /api/login 200 467 - 62.090 ms
POST /api/contacts 409 44 - 1.311 ms
✔ los correos de contactos son únicos (162.9223ms)
POST /api/login 200 467 - 59.001 ms
DELETE /api/contacts/6ac9190f7405e4be1490ab0d 204 - - 3.530 ms
✔ eliminar un contacto responde sin contenido (155.2962ms)
POST /api/login 200 467 - 59.242 ms
POST /api/users 400 60 - 0.154 ms
✔ no acepta contraseñas de menos de ocho caracteres (146.3997ms)
POST /api/login 200 467 - 61.780 ms
GET /api/users 200 896 - 6.291 ms
✔ la lista de equipo incluye sus proyectos (158.3202ms)
POST /api/login 200 467 - 61.233 ms
GET /api/users 200 896 - 3.031 ms
✔ los hashes de contraseña nunca se envían al cliente (151.7378ms)
POST /api/login 200 467 - 59.803 ms
POST /api/login 401 52 - 62.633 ms
✔ una contraseña incorrecta no obtiene una sesión (211.6593ms)
POST /api/login 200 467 - 64.915 ms
✔ calcula el promedio de las estimaciones (149.4403ms)
POST /api/login 200 467 - 62.773 ms
✔ el promedio de una sola estimación es esa estimación (148.3153ms)
ℹ tests 18
ℹ suites 0
ℹ pass 18
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5361.8163
PS C:\Users\diego\OneDrive\Documentos\Nexo-practica\nexo> 