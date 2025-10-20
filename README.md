
# API Proyectos (Node + Express + Prisma + PostgreSQL + Swagger)

CRUD de **Proyectos** y **Usuarios (owners)** con agregados, auditoría via **triggers** y un endpoint de **análisis con IA** (Gemini/DeepSeek, opcional). Incluye documentación OpenAPI en `/docs` y despliegue con Docker Compose.

---

##  Stack

- Node 20, TypeScript, Express
- Prisma ORM + PostgreSQL
- Swagger (OpenAPI 3) en `/docs`
- Seguridad: Helmet, CORS, rate-limit, request-id y logging con Pino
- Auditoría: tabla `AuditLog`, función `trg_audit()` y triggers en `Proyecto` y `Tarea`
- (Opcional) IA: Gemini / DeepSeek para `POST /proyectos/analisis`

---

## 🚀 Quick Start (con Docker)

> Requisitos: Docker Desktop/Engine y Docker Compose.

1) **Clona** el repo y entra a la carpeta:

```bash
git clone https://github.com/SebastianDPalacios/back.git
cd back
```

2) **Crea** un archivo `.env` (puedes copiar/editar este ejemplo):

```dotenv
# .env
NODE_ENV=development
PORT=3001

# CORS
CORS_ORIGIN=*

# Prisma
DATABASE_URL=postgresql://app:app@db:5432/appdb?schema=public

# Rate limit
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120

# Swagger
SWAGGER_ENABLED=true

# IA (opcional)
# AI_PROVIDER=gemini
# GEMINI_API_KEY=tu_api_key
# AI_PROVIDER=deepseek
# DEEPSEEK_API_KEY=tu_api_key
```

3) **Levanta** todo con Docker Compose (API + DB):

```bash
docker compose up -d --build
```

- La primera vez aplicará **migraciones** automáticamente (verás logs en `docker compose logs -f api`).
- API: http://localhost:3001
- Swagger: http://localhost:3001/docs
- Prefijo de API: **/api** (p. ej. `GET /api/proyectos`).

> **IMPORTANTE**: Si vienes de una versión anterior y ves errores de columnas (p.ej. `registroid`), elimina el volumen para reconstruir desde cero:
>
> ```bash
> docker compose down -v
> docker compose up -d --build
> ```

---

## Esquema y Migraciones

### Migración `20251019_0001_pro_schema` (DDL principal)
- Enums: `ProjectEstado`, `TaskEstado`
- Tablas: `Usuario`, `Proyecto`, `Tarea`, `ProyectoMiembro`, `Etiqueta`, `ProyectoEtiqueta`, `AuditLog`
- Índices y `FOREIGN KEY` correctos (coinciden con `schema.prisma`).
- **Claves importantes**:
  - `Proyecto.ownerId → Usuario.id` (RESTRICT, CASCADE)
  - `Tarea.proyectoId → Proyecto.id` (CASCADE)
  - `Tarea.asignadoAId → Usuario.id` (SET NULL)

### Migración `20251019_0002_pro_sql` (lógica en SQL)
- **fn_can_transition_project(from,to)**: valida transiciones de estado.
- **sp_change_project_state(p_project_id, p_new_state, p_actor_id)**: aplica cambio de estado + inserta auditoría manual en `AuditLog`.
- **trg_audit() + triggers**:
  - `trg_audit()` inserta en `AuditLog(tabla,accion,registroId, oldData, newData, actorId)` usando `row_to_json(... )::jsonb`.
  - Triggers `audit_proyecto` y `audit_tarea` sobre `Proyecto` y `Tarea` **AFTER INSERT/UPDATE/DELETE**.
- **Nombres de columnas auditadas**: `registroId` **(respeta mayúsculas/minúsculas)**.  
  _Esto corrige el error viejo de `registroid`._

> Verificación rápida en la base:
>
> ```bash
> docker compose exec db psql -U app -d appdb -c "\sf+ public.trg_audit"
> docker compose exec db psql -U app -d appdb -c > "SELECT t.tgname, p.proname FROM pg_trigger t JOIN pg_proc p ON p.oid=t.tgfoid >  JOIN pg_class c ON c.oid=t.tgrelid WHERE c.relname IN ('Proyecto','Tarea') AND NOT t.tgisinternal;"
> ```

---

## Documentación (Swagger)

- Abre **http://localhost:3001/docs**
- Servidor configurado con base `/api` (verás todos los endpoints).

### Recursos expuestos

#### **Usuarios** (owners)
- `GET /api/usuarios` → lista
- `GET /api/usuarios/{id}` → obtener por id
- `POST /api/usuarios` → crear
- `PUT /api/usuarios/{id}` → actualizar
- `DELETE /api/usuarios/{id}` → eliminar

#### **Proyectos**
- `GET /api/proyectos?q=&estado=&page=1&size=10` → lista paginada
- `POST /api/proyectos` → crear
- `GET /api/proyectos/{id}` → detalle
- `PUT /api/proyectos/{id}` → actualizar
- `DELETE /api/proyectos/{id}` → eliminar
- `GET /api/proyectos/graficos` → agregados por estado
- `POST /api/proyectos/analisis` → resumen IA (opcional; usa envs IA)

---

## Orden recomendado de pruebas

> **Primero crea un usuario (owner)** y usa su `id` en `ownerId` de proyecto.

1) **Crear usuario**  
   `POST /api/usuarios`
   ```json
   { "nombre": "Admin", "email": "admin@acme.com" }
   ```

2) **Listar usuarios**  
   `GET /api/usuarios` → toma el `id` (ej. `1`).

3) **Crear proyecto**  
   `POST /api/proyectos`
   ```json
   {
     "nombre": "Portal Compras",
     "descripcion": "Optimización de proceso de compras",
     "estado": "EN_PROGRESO",
     "fechaInicio": "2025-01-15T09:00:00.000Z",
     "fechaFin": "2025-03-31T00:00:00.000Z",
     "ownerId": 1
   }
   ```

4) **Listar proyectos** con filtros/paginación  
   `GET /api/proyectos?page=1&size=10`

5) **Agregados**  
   `GET /api/proyectos/graficos`

6) **Análisis con IA (opcional)**  
   `POST /api/proyectos/analisis` body opcional:
   ```json
   { "extra": "Considerar prioridades del Q1." }
   ```

---

## Ejemplos con `curl`

```bash
# Crear usuario
curl -X POST http://localhost:3001/api/usuarios   -H "Content-Type: application/json"   -d '{"nombre":"Admin","email":"admin@acme.com"}'

# Crear proyecto (ownerId=1)
curl -X POST http://localhost:3001/api/proyectos   -H "Content-Type: application/json"   -d '{
        "nombre":"Landing MKT",
        "descripcion":"Captación de leads",
        "estado":"FINALIZADO",
        "fechaInicio":"2025-01-01T00:00:00.000Z",
        "fechaFin":"2025-02-15T00:00:00.000Z",
        "ownerId":1
      }'
```

---

## Desarrollo local (sin Docker)

1) Instala dependencias
   ```bash
   npm ci
   ```
2) Prepara una **DB Postgres local** y ajusta `DATABASE_URL` en `.env` (usa `localhost`).
3) Genera Prisma + ejecuta migraciones:
   ```bash
   npx prisma generate
   npx prisma migrate deploy   # o dev
   ```
4) Levanta el servidor en dev:
   ```bash
   npm run dev
   ```
5) Abre `http://localhost:3001/docs`

> Semillas (opcional): `npx prisma db seed` (usa `prisma/seed.ts`).  
> **Nota**: el flujo actual de pruebas usa Swagger para crear `Usuario` → `Proyecto`.

---

##  Auditoría (AuditLog)

- Tabla: `"AuditLog"(id, tabla, accion, registroId, oldData, newData, actorId, ocurridoEn)`
- Función: `public.trg_audit()`
- Triggers: `audit_proyecto` y `audit_tarea` (AFTER I/U/D)
- Cada operación inserta un registro con el antes/después (`oldData`, `newData`).

Consulta rápida:

```bash
docker compose exec db psql -U app -d appdb -c 'SELECT id, tabla, accion, "registroId", "ocurridoEn" FROM "AuditLog" ORDER BY id DESC LIMIT 20;'
```

---

## Variables de entorno

| Variable | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `PORT` | number | 3001 | Puerto HTTP |
| `CORS_ORIGIN` | string | `*` | Origen permitido CORS |
| `DATABASE_URL` | string | – | Connstring Postgres |
| `RATE_LIMIT_WINDOW_MS` | number | 60000 | Ventana (ms) |
| `RATE_LIMIT_MAX` | number | 120 | Máx peticiones/ventana |
| `SWAGGER_ENABLED` | boolean | `true` | Habilita `/docs` |
| `AI_PROVIDER` | `gemini`/`deepseek` | – | Proveedor IA opcional |
| `GEMINI_API_KEY` | string | – | API key Gemini |
| `DEEPSEEK_API_KEY` | string | – | API key DeepSeek |

---

##  Troubleshooting

- **Error**: `The column registroid does not exist`  
  Causa: versión antigua de función/trigger de auditoría. Solución más rápida:
  ```bash
  docker compose down -v      # borra volumen (datos)
  docker compose up -d --build
  ```
  Si no quieres perder datos, recompila la función y recrea triggers:
  ```bash
  # Ver función
  docker compose exec db psql -U app -d appdb -c "\sf+ public.trg_audit"

  # (Re)crear triggers correctos
  docker compose exec db psql -U app -d appdb -c   "DROP TRIGGER IF EXISTS audit_proyecto ON "Proyecto";
   CREATE TRIGGER audit_proyecto AFTER INSERT OR UPDATE OR DELETE ON "Proyecto"
   FOR EACH ROW EXECUTE FUNCTION public.trg_audit();
   DROP TRIGGER IF EXISTS audit_tarea ON "Tarea";
   CREATE TRIGGER audit_tarea AFTER INSERT OR UPDATE OR DELETE ON "Tarea"
   FOR EACH ROW EXECUTE FUNCTION public.trg_audit();"
  ```

- **FK `Proyecto_ownerId_fkey`** al crear proyecto:  
  Debes crear antes el **Usuario** (owner) y usar su `id` en `ownerId`.

- **Swagger no muestra rutas**:  
  Asegúrate de que en build Docker existan los archivos en `dist/**` y que `src/docs/swagger.ts` incluye **src** y **dist** en `apis` (ya está).

- **Import ESM en repos**:  
  Si tu `tsconfig` usa `"moduleResolution": "NodeNext"`, las rutas relativas deben llevar extensión `.js` en tiempo de ejecución. Revisa que todas las importaciones de `dist` la conserven (el repo ya lo hace).

---

## Estructura (resumen)

```
prisma/
  migrations/
    20251019_0001_pro_schema/
      migration.sql
    20251019_0002_pro_sql/
      migration.sql
  schema.prisma
  seed.ts (opcional)
src/
  ai/ai.service.ts
  application/{project.service.ts,user.service.ts}
  config/env.ts
  docs/swagger.ts
  domain/{project.repository.ts,project.types.ts,user.types.ts}
  infrastructure/prisma/{client.ts,project.prisma.repository.ts,user.prisma.repository.ts}
  interfaces/http/
    controllers/{project.controller.ts,user.controller.ts}
    dto/{project.dto.ts,user.dto.ts}
    routes/{project.routes.ts,user.routes.ts}
  middlewares/{error.handler.ts,rate-limit.ts,request-id.ts,request-logger.ts,security.ts}
  {server.ts,index.ts}
docker-compose.yml
Dockerfile
```

---

## Estado de las SQL (validadas)

- Las dos migraciones **coinciden** con `schema.prisma` y con el código de repositorios/servicios.
- La función `trg_audit()` y triggers **insertan** en `"AuditLog"` usando **`registroId`** con mayúscula/minúscula correctas.
- El procedimiento `sp_change_project_state(...)` **no es llamado por la API actual** (queda disponible si el cliente lo requiere).

---

¡Eso es todo! Con `docker compose up -d --build` deberías tener DB + API + Swagger arriba y listos para probar los endpoints.
