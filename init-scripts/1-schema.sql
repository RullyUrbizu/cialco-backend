DROP TABLE IF EXISTS "movimientos" CASCADE;
DROP TABLE IF EXISTS "colecta_contenedores" CASCADE;
DROP TABLE IF EXISTS "inventario" CASCADE;
DROP TABLE IF EXISTS "colectas" CASCADE;
DROP TABLE IF EXISTS "canastillos" CASCADE;
DROP TABLE IF EXISTS "termos" CASCADE;
DROP TABLE IF EXISTS "clientes" CASCADE;
DROP TABLE IF EXISTS "toros" CASCADE;

DROP TYPE IF EXISTS "Raza" CASCADE;

CREATE TYPE "Raza" AS ENUM (
  'AA',
  'AAC',
  'AAN',
  'PH',
  'SH',
  'LMAn'
);

-- ==============================
-- 1️⃣ Toros
-- ==============================
CREATE TABLE toros (
    id VARCHAR(36) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    raza "Raza" NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- 2️⃣ Clientes
-- ==============================
CREATE TABLE clientes (
    id VARCHAR(36) PRIMARY KEY,
    razon_social VARCHAR(200) NOT NULL,
    cuit VARCHAR(20) UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- 3️⃣ Termos
-- ==============================
CREATE TABLE termos (
    id VARCHAR(36) PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE
);

-- ==============================
-- 4️⃣ Canastillos
-- ==============================
CREATE TABLE canastillos (
    id VARCHAR(36) PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL,
    termo_id VARCHAR(36) NOT NULL REFERENCES termos(id) ON DELETE CASCADE,
    UNIQUE (codigo, termo_id)
);

-- ==============================
-- 5️⃣ Colectas
-- ==============================
CREATE TABLE colectas (
    id VARCHAR(36) PRIMARY KEY,
    toro_id VARCHAR(36) NOT NULL REFERENCES toros(id) ON DELETE RESTRICT,
    cliente_id VARCHAR(36) NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    fecha DATE NOT NULL,
    vigor_mot VARCHAR(20),
    cantidad INT,
    ingreso INT,
    sale INT,
    stock INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- 6️⃣ Colecta Contenedores (Junction Table)
-- ==============================
CREATE TABLE colecta_contenedores (
    id VARCHAR(36) PRIMARY KEY,
    colecta_id VARCHAR(36) NOT NULL REFERENCES colectas(id) ON DELETE CASCADE,
    termo_id VARCHAR(36) NOT NULL REFERENCES termos(id) ON DELETE RESTRICT,
    canastillo_id VARCHAR(36) NOT NULL REFERENCES canastillos(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL DEFAULT 0,
    stock_actual INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- 7️⃣ Inventario
-- ==============================
CREATE TABLE inventario (
    id VARCHAR(36) PRIMARY KEY,
    colecta_id VARCHAR(36) NOT NULL UNIQUE REFERENCES colectas(id) ON DELETE CASCADE,
    cantidad_inicial INTEGER NOT NULL DEFAULT 0,
    ingresos_total INTEGER NOT NULL DEFAULT 0,
    salidas_total INTEGER NOT NULL DEFAULT 0,
    stock_actual INTEGER, -- El stock se maneja por triggers o desde el backend
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- 8️⃣ Movimientos
-- ==============================
CREATE TABLE movimientos (
    id VARCHAR(36) PRIMARY KEY,
    inventario_id VARCHAR(36) NOT NULL REFERENCES inventario(id) ON DELETE CASCADE,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso', 'salida')),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cliente_id VARCHAR(36) REFERENCES clientes(id) ON DELETE SET NULL,
    notas TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- 9️⃣ Índices
-- ==============================
CREATE INDEX idx_toros_raza ON toros(raza);
CREATE INDEX idx_colectas_fecha ON colectas(fecha);
CREATE INDEX idx_colectas_toro ON colectas(toro_id);
CREATE INDEX idx_movimientos_fecha ON movimientos(fecha);
CREATE INDEX idx_movimientos_tipo ON movimientos(tipo);
CREATE INDEX idx_colectas_cliente ON colectas(cliente_id);
CREATE INDEX idx_movimientos_cliente ON movimientos(cliente_id);
CREATE INDEX idx_inventario_colecta ON inventario(colecta_id);
CREATE INDEX idx_canastillos_termo ON canastillos(termo_id);
CREATE INDEX idx_colecta_contenedores_colecta ON colecta_contenedores(colecta_id);
CREATE INDEX idx_colecta_contenedores_termo ON colecta_contenedores(termo_id);
CREATE INDEX idx_colecta_contenedores_canastillo ON colecta_contenedores(canastillo_id);
CREATE INDEX idx_colecta_contenedores_stock ON colecta_contenedores(stock_actual);
