# Cialco Backend

Backend del sistema de gestión de stock para Cialco, desarrollado con NestJS y TypeScript.

## Descripción

API REST para la gestión integral de stock, clientes, movimientos de inventario y colectas. El sistema proporciona endpoints seguros para todas las operaciones CRUD necesarias en la gestión del negocio.

## Tecnologías

- **Framework**: NestJS
- **Lenguaje**: TypeScript
- **Base de datos**: PostgreSQL
- **ORM**: TypeORM
- **Autenticación**: JWT
- **Validación**: class-validator

## Requisitos previos

- Node.js (v16 o superior)
- npm o yarn
- PostgreSQL (v12 o superior)

## Configuración del proyecto

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
DB_DATABASE=cialco_db

# Aplicación
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=tu_clave_secreta_jwt
JWT_EXPIRATION=1d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 3. Configurar la base de datos

Asegúrate de tener PostgreSQL instalado y ejecutándose. Crea la base de datos:

```sql
CREATE DATABASE cialco_db;
```

Las tablas se crearán automáticamente al iniciar la aplicación gracias a TypeORM.

## Ejecutar la aplicación

### Modo desarrollo

```bash
npm run start:dev
```

La API estará disponible en `http://localhost:3000`

### Modo producción

```bash
# Compilar
npm run build

# Ejecutar
npm run start:prod
```

### Modo debug

```bash
npm run start:debug
```

## Ejecutar tests

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Cobertura de tests
npm run test:cov
```

## Estructura del proyecto

```
src/
├── auth/           # Módulo de autenticación
├── users/          # Gestión de usuarios
├── clientes/       # Gestión de clientes
├── movimientos/    # Gestión de movimientos de stock
├── colectas/       # Gestión de colectas
├── canastillos/    # Gestión de canastillos
├── toros/          # Gestión de toros
├── common/         # Utilidades y decoradores comunes
├── config/         # Configuración de la aplicación
└── main.ts         # Punto de entrada
```

## Endpoints principales

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario

### Clientes
- `GET /clientes` - Listar clientes
- `GET /clientes/:id` - Obtener cliente
- `POST /clientes` - Crear cliente
- `PUT /clientes/:id` - Actualizar cliente
- `DELETE /clientes/:id` - Eliminar cliente

### Movimientos
- `GET /movimientos` - Listar movimientos
- `GET /movimientos/:id` - Obtener movimiento
- `POST /movimientos` - Crear movimiento
- `PUT /movimientos/:id` - Actualizar movimiento
- `DELETE /movimientos/:id` - Eliminar movimiento

### Colectas
- `GET /colectas` - Listar colectas
- `GET /colectas/:id` - Obtener colecta
- `POST /colectas` - Crear colecta
- `PUT /colectas/:id` - Actualizar colecta
- `DELETE /colectas/:id` - Eliminar colecta

## Documentación de la API

La documentación completa de la API está disponible en Swagger:

```
http://localhost:3000/api/docs
```

## Scripts disponibles

```bash
# Desarrollo
npm run start:dev      # Inicia el servidor en modo desarrollo con hot-reload

# Producción
npm run build          # Compila el proyecto
npm run start:prod     # Inicia el servidor en modo producción

# Testing
npm run test           # Ejecuta tests unitarios
npm run test:e2e       # Ejecuta tests end-to-end
npm run test:cov       # Genera reporte de cobertura

# Linting
npm run lint           # Ejecuta ESLint
npm run format         # Formatea el código con Prettier
```

## Datos de prueba

El proyecto incluye un archivo SQL con datos de prueba en:
```
src/datos_prueba_generados.sql
```

Para cargar los datos de prueba:

```bash
psql -U tu_usuario -d cialco_db -f src/datos_prueba_generados.sql
```

## Solución de problemas

### Error de conexión a la base de datos
- Verifica que PostgreSQL esté ejecutándose
- Confirma las credenciales en el archivo `.env`
- Asegúrate de que la base de datos existe

### Error de CORS
- Verifica que `CORS_ORIGIN` en `.env` coincida con la URL del frontend
- Para desarrollo local, usa `http://localhost:5173`

### Error de autenticación
- Verifica que `JWT_SECRET` esté configurado en `.env`
- Asegúrate de incluir el token en el header: `Authorization: Bearer <token>`

## Contribuir

1. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. Realiza tus cambios y haz commit: `git commit -am 'Agrega nueva funcionalidad'`
3. Sube los cambios: `git push origin feature/nueva-funcionalidad`
4. Crea un Pull Request

## Licencia

Este proyecto es privado y confidencial.

## Contacto

Para consultas o soporte, contacta al equipo de desarrollo.
