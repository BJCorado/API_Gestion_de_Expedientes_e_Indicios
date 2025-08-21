# API — Gestión de Expedientes e Indicios

API REST en **TypeScript + Express** con autenticación **JWT**, control de **roles** y persistencia en **SQL Server** mediante **stored procedures (SPs)**.  
Incluye Swagger UI para documentación y ejemplo de **seed** de usuarios.

## 🚀 Stack

- **Node.js** + **Express** (TypeScript)
- **JWT** (auth) + middlewares de rol
- **SQL Server** (SPs para CRUD)
- **Swagger** (swagger-jsdoc + swagger-ui-express)
- Docker / Docker Compose (API + SQL Server)

---

## 📦 Dependencias principales

Estas son las librerías que utiliza el proyecto y su propósito:

### Producción (`dependencies`)
- **express** → Framework para crear el servidor web y rutas.
- **mssql** → Cliente oficial para conectarse a SQL Server desde Node.js.
- **bcrypt** → Hasheo de contraseñas de forma segura.
- **jsonwebtoken** → Generación y validación de tokens JWT.
- **dotenv** → Cargar variables de entorno desde `.env`.
- **swagger-jsdoc** → Genera la especificación OpenAPI a partir de JSDoc.
- **swagger-ui-express** → Interfaz web de Swagger para probar endpoints.

### Desarrollo (`devDependencies`)
- **typescript** → Lenguaje usado en el proyecto.
- **ts-node-dev** → Ejecuta TypeScript con **hot reload** en desarrollo.
- **@types/node** → Tipos para Node.js.
- **@types/express** → Tipos para Express.
- **@types/jsonwebtoken** → Tipos para JWT.
- **@types/bcrypt** → Tipos para bcrypt.
- **eslint** → Linter para mantener código limpio y consistente.

---

👉 Para instalarlas todas, basta con ejecutar:
Esto instalará tanto las dependencias de producción como las de desarrollo listadas en tu package.json.

```bash
npm install
```

---

## ✨ Funcionalidades principales

- **Auth**
  - `POST /api/auth/login` → retorna JWT (verifica `username` + `password` con bcrypt).
- **Expedientes**
  - `GET /api/expedientes` (paginado y filtros)
  - `GET /api/expedientes/{id}`
  - `POST /api/expedientes` (rol **tecnico**; usa `tecnico_id` del token)
  - `PUT /api/expedientes/{id}`
  - `PATCH /api/expedientes/{id}/estado` (rol **coordinador**; `aprobado|rechazado` + justificación)
  - `PATCH /api/expedientes/{id}/activo` (soft delete)
- **Indicios**
  - `GET /api/expedientes/{id}/indicios`
  - `POST /api/expedientes/{id}/indicios`
  - `PUT /api/indicios/{id}`
  - `PATCH /api/indicios/{id}/activo`
- **Usuarios**
  - `POST /api/usuarios` (crear usuario con hash)
  - `GET /api/usuarios` (opcional; rol **coordinador**)

> La documentación interactiva está en **`/docs`** (Swagger UI).

---

## 🔧 Requisitos

- Node.js 18+ / 20+
- Docker y Docker Compose
- (Opcional) SQL Server local — recomendado usar el contenedor

---

## 🔐 Variables de entorno (.env)

Crea un archivo `.env` en la raíz:

Server

PORT=3000
NODE_ENV=development

JWT

JWT_SECRET=supersecreto
JWT_EXPIRES_IN=1d

SQL Server

SQL_SERVER_HOST=localhost
SQL_SERVER_PORT=1433
SQL_SERVER_DB=GestionExpedientes
SQL_SERVER_USER=sa
SQL_SERVER_PASSWORD=TuPassword.Seguro123

> Si la API corre dentro de otro contenedor, `SQL_SERVER_HOST` debe ser el **nombre del servicio** (por ejemplo `sqlserver`) y **no** `localhost`.


---

## 🐳 Docker (SQL Server + API)

### 1) Levantar SQL Server
Si usas `docker-compose.yml`:

```yaml
# Configuración de servicios con Docker Compose
version: "3.9"
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: sqlserver
    environment:
      - ACCEPT_EULA=Y
      - MSSQL_SA_PASSWORD=TuPassword.Seguro123
    ports:
      - "1433:1433"
    volumes:
      - mssql_data:/var/opt/mssql
      - ./scripts:/scripts:ro
      - ./src/db/sp:/sp:ro    # monta /src/db/sp como /sp
    healthcheck:
      test: ["CMD-SHELL","/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $${MSSQL_SA_PASSWORD} -C -Q 'SELECT 1' || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 10

  api:
    build: .
    container_name: api-expedientes
    env_file: .env
    depends_on:
      sqlserver:
        condition: service_healthy
    ports:
      - "3000:3000"

volumes:
  mssql_data:
```
---

  ## 🐳 Arranque y despliegue

### 1) Arranca SQL Server

```bash
docker compose up -d sqlserver
```
### 2) Ejecutar scripts SQL (SPs)

En lugar de ejecutar cada .sql uno por uno, usa el script setup.sql que los contiene todos:
```bash
docker cp .\src\db\setup.sql sqlserver:/tmp/setup.sql
docker exec -it sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'TuPassword.Seguro123' -C -d GestionExpedientes -i /tmp/setup.sql
```
### 3) Correr la API

Desarrollo (hot reload con ts-node-dev):
```bash
npm i
npm run dev
# http://localhost:3000/docs
```
### 4)Producción con Docker (ejemplo de Dockerfile):
```bash
# Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Run
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

Y en docker-compose.yml:
```bash
services:
  api-expedientes:
    build: .
    container_name: api-expedientes
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - sqlserver

```
### Levantar:
```bash
docker compose up -d --build api-expedientes
```
## 🔑 Autenticación y Roles

- **Login**: `POST /api/auth/login` → recibe `{ username, password }`, valida con **bcrypt** usando `dbo.sp_Usuarios_Login` y retorna `{ token, user }`.
- **Bearer token**: usar el botón **Authorize** en Swagger y pegar el JWT.
- **Roles**:
  - **tecnico**: puede crear/editar sus expedientes/indicios.
  - **coordinador**: además puede aprobar/rechazar y listar usuarios.

---

## 🧪 Probar en Swagger

- Abre [http://localhost:3000/docs](http://localhost:3000/docs)
- **Authorize** → pega el JWT obtenido en `/api/auth/login`
- Probar los endpoints:
  - `POST /api/usuarios` (coordinador)
  - `GET /api/usuarios` (coordinador; paginado `page`, `size`, `search`)
  - `POST /api/expedientes`
  - `POST /api/expedientes/{id}/indicios`
  - etc.

---

## 🗃️ Stored Procedures (resumen)

**Usuarios**
- `dbo.sp_Usuarios_Crear (@username, @password_hash, @role)`
- `dbo.sp_Usuarios_Login (@username)`
- `dbo.sp_Usuarios_Listar (@search, @page, @size)`

**Expedientes**
- `dbo.sp_Expedientes_Listar`
- `dbo.sp_Expedientes_Obtener`
- `dbo.sp_Expedientes_Crear`
- `dbo.sp_Expedientes_Actualizar`
- `dbo.sp_Expedientes_CambiarEstado`
- `dbo.sp_Expedientes_ActivarDesactivar`

**Indicios**
- `dbo.sp_Indicios_ListarPorExpediente`
- `dbo.sp_Indicios_Crear`
- `dbo.sp_Indicios_Actualizar`
- `dbo.sp_Indicios_ActivarDesactivar`

---

## 🌱 Seed de usuarios (ejemplo)

```sql
-- Usuario coordinador
INSERT INTO dbo.Usuarios(username, role, password_hash, activo)
VALUES ('coordinador1', 'coordinador', '<hash-bcrypt>', 1);

-- Usuario técnico
INSERT INTO dbo.Usuarios(username, role, password_hash, activo)
VALUES ('tecnico1', 'tecnico', '<hash-bcrypt>', 1);

Genera <hash-bcrypt> con Node:
```bash
const bcrypt = require('bcrypt');
bcrypt.hash('123456', 10).then(console.log);
```

## 🧰 Scripts de npm
```bash
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint . --ext .ts"
  }
}
```
---

## 🩺 Troubleshooting

- **Could not find stored procedure 'dbo.sp_...'**  
  Ejecuta el `.sql` en la BD correcta (`-d GestionExpedientes`) y usa el esquema `dbo`.

- **Invalid column name**  
  Ajusta el SP a tus columnas reales (`username`, `role`, `password_hash`, `activo`).

- **mounted volume is marked read-only**  
  Copia archivos a `/tmp` dentro del contenedor.

- **PowerShell vs bash**  
  En PowerShell usa backtick (\`) o una sola línea, no `\`.
