# Nexo Workspace

Un espacio para los proyectos, las personas y las ideas de Estudio Norte.

## Requisitos

- Node.js 22.12 o posterior y npm.
- Conexión a Internet para instalar paquetes y descargar MongoDB en el primer inicio.
- macOS, Linux o Windows con una versión compatible de MongoDB 7.

## Inicio local

```sh
npm ci
npm run dev
```

Abre http://127.0.0.1:5173. La API escucha en http://127.0.0.1:3001.
Los puertos deben estar libres. El espacio se crea automáticamente en el primer inicio.

Si no se define `MONGODB_URI`, se inicia un proceso MongoDB local con almacenamiento
WiredTiger persistente en `.data/mongo`. Su ejecutable se conserva en `.cache/mongodb`.
Aunque el paquete que inicia el proceso se llama `mongodb-memory-server`, los datos
de desarrollo se guardan en disco. No es una API simulada.

Para usar otra base, copia `.env.example` como `.env` y configura `MONGODB_URI`.
Las pruebas de integración usan otra instancia temporal y nunca conectan a esa URI.

## Cuentas del espacio

| Persona      | Correo            | Contraseña local |
| ------------ | ----------------- | ---------------- |
| María Torres | maria@nexo.local  | Nexo2026!        |
| Andrés Luna  | andres@nexo.local | Nexo2026!        |
| Lucía Méndez | lucia@nexo.local  | Nexo2026!        |
| Diego Ruiz   | diego@nexo.local  | Nexo2026!        |

La navegación de lectura está disponible sin iniciar sesión. Crear, actualizar y
eliminar datos requiere una sesión. Eliminar un proyecto está reservado a su responsable.
Los nombres y datos de contacto del espacio inicial son ficticios.

## Comandos

```sh
npm run build          # Genera dist/
npm start              # Sirve dist/ y la API en el puerto 3001
npm run lint           # Análisis estático
npm run test:unit      # Componentes, hooks, estado y funciones
npm run test:api       # Node test runner, Supertest y MongoDB temporal
npx playwright install chromium
npm run test:e2e       # Flujos de navegador; requiere el espacio inicial
npm run bundle:report # Análisis del bundle con esbuild
```

`npm test` encadena las pruebas unitarias y de API; si falla la primera suite, ejecuta
la segunda por separado. E2E utiliza el espacio local de desarrollo y puede cambiar
el estado de sus tareas. Los resultados y trazas se guardan en `test-results/` y
`playwright-report/`. Cada contexto del navegador comienza con su propio almacenamiento.

Para restablecer el espacio, detén primero `npm run dev` o `npm start` y ejecuta:

```sh
npm run db:reset
npm run dev
```

El restablecimiento borra los datos de Nexo y vuelve a crear el espacio inicial.
Si usas una base externa, debes establecer `CONFIRM_RESET=nexo` expresamente.
Limpia también el almacenamiento del sitio en el navegador para restablecer preferencias y sesión.

## Organización

```text
src/
  components/  Elementos de interfaz reutilizables
  context/     Sesión y notificaciones
  hooks/       Campos, consultas y datos del proyecto
  pages/       Secciones de la aplicación
  services/    Cliente HTTP
  stores/      Estado del espacio y lista de lectura
  utils/       Formato y cálculos
server/
  controllers/ Rutas HTTP por dominio
  models/      Esquemas Mongoose y relaciones
  utils/       Configuración, métricas y middleware
  tests/       Pruebas HTTP y persistencia
e2e/           Flujos de extremo a extremo
scripts/       Herramientas de compilación
```

El estado del espacio se gestiona con Zustand; la lista de lectura mantiene su módulo
Redux Toolkit. React Query gestiona los datos remotos. Las notificaciones utilizan
Context y useReducer. El frontend y el backend comparten repositorio y scripts.

## API

| Recurso                   | Operaciones                         |
| ------------------------- | ----------------------------------- |
| `/api/health`             | GET                                 |
| `/api/login`              | POST                                |
| `/api/users`              | GET, POST                           |
| `/api/users/:id`          | GET                                 |
| `/api/projects`           | GET, POST                           |
| `/api/projects/:id`       | GET, PATCH, DELETE                  |
| `/api/tasks`              | GET, POST; filtro `?project=id`     |
| `/api/tasks/:id`          | PATCH                               |
| `/api/contacts`           | GET, POST                           |
| `/api/contacts/:id`       | PATCH, DELETE                       |
| `/api/resources`          | GET, POST; filtro `?tag=Desarrollo` |
| `/api/resources/:id/like` | POST                                |
| `/api/notes`              | GET, POST                           |
| `/api/reports`            | GET                                 |

Las escrituras utilizan `Authorization: Bearer <token>`. El token dura ocho horas.
`passwordHash` no se serializa. Cada objeto expone `id` en su representación JSON.

## Configuración y ejecución de producción

Consulta `.env.example`. `JWT_SECRET` se puede suministrar desde el entorno; sin ella,
se genera una clave local en `.data/session-key`. No versionar `.env` ni `.data`.

```sh
npm ci
npm run build
npm start
```

En PowerShell, para ejecutar directamente el servidor de producción:

```powershell
$env:NODE_ENV='production'
node server/index.js
```

El contenedor suministrado requiere `MONGODB_URI` y `JWT_SECRET`. El despliegue debe
usar HTTPS, una base dedicada, cuentas propias y una revisión de los contratos HTTP,
validaciones y permisos antes de habilitar acceso externo. El servidor local se
vincula a `127.0.0.1` de forma predeterminada.

La tipografía tiene respaldo del sistema si Google Fonts no está disponible.
