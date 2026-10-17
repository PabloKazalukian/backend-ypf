# Oilfield Production Management API

API REST académica para consultar pozos petroleros y registrar su producción mensual. El proyecto utiliza Node.js, Express y el driver oficial de MongoDB.

## 1. Datos generales

- **Puerto:** la API escucha en el puerto **3008** (`http://localhost:3008`).
- **Base de datos:** MongoDB mediante el driver oficial.
- **Colecciones:** `wells` y `monthly_productions`.

## 2. Cómo se organiza la información

Los datos se agruan en un orden de tres niveles:

```text
Región  (ej.: Cuenca Neuquina)
└── Plataformas  (ej.: Plataforma Norte 01)
    └── Pozos  (ej.: NEU-P01-W01)
        └── Producciones mensuales (por año y mes)
```

- **Región:** zona geográfica amplia. Cada región se **divide en una o más plataformas**.
- **Plataforma:** agrupación física dentro de una región. Cada plataforma **tiene uno o más pozos**. Todos los pozos de una misma plataforma comparten el código de su plataforma.
- **Pozo:** cada pozo puede **extraer petróleo**, **gas** o ser **mixto** (ambos). Además tiene un estado: en perforación (`drilling`), produciendo (`producing`), en mantenimiento (`maintenance`), fuera de servicio (`shut_in`) o abandonado (`abandoned`).
- **Producción mensual:** de cada pozo se guarda lo producido **mes a mes** (año y mes): cuánto petróleo, gas y agua, y cuántos días estuvo operativo.

Así se relacionan los datos que carga el seed (ver sección 6):

| Región          | Plataforma          | Pozo        | Extrae   |
| --------------- | ------------------- | ----------- | -------- |
| Cuenca Neuquina | Plataforma Norte 01 | NEU-P01-W01 | Petróleo |
| Cuenca Neuquina | Plataforma Norte 01 | NEU-P01-W02 | Gas      |
| Cuenca Neuquina | Plataforma Norte 01 | NEU-P01-W03 | Petróleo |
| Cuenca Neuquina | Plataforma Norte 02 | NEU-P02-W01 | Gas      |
| Cuenca Neuquina | Plataforma Norte 02 | NEU-P02-W02 | Mixto    |
| Golfo San Jorge | Plataforma Sur 02   | SJG-P02-W01 | Mixto    |
| Golfo San Jorge | Plataforma Sur 01   | SJG-P01-W01 | Petróleo |
| Golfo San Jorge | Plataforma Sur 01   | SJG-P01-W02 | Gas      |

### 2.1. Qué permite hacer la aplicación

- **Buscar pozos** por **región**, por **plataforma**, por **yacimiento** (`field`) o por **estado**. Por ejemplo, para ver todos los pozos de una plataforma: `GET http://localhost:3008/api/wells?platform=NEU-PLAT-01`.
- **Ver la producción de los pozos por fecha**: se puede pedir lo producido en un **mes y año** concretos, por ejemplo `GET http://localhost:3008/api/productions?year=2026&month=1`, y combinarlo con un pozo específico (`wellId`).
- **Ver la producción de un pozo** en particular: `GET http://localhost:3008/api/wells/{id}/productions`.

Los detalles de cada endpoint están en las secciones 5 y 7.

## 3. Esquemas de documentos

En MongoDB, `_id` y la referencia `wellId` son valores BSON `ObjectId`. Los ejemplos muestran los tipos de dato de cada propiedad.

### 3.1. `wells`

| Propiedad               | Tipo     | Obligatorio | Descripción                                                      |
| ----------------------- | -------- | ----------- | ---------------------------------------------------------------- |
| `_id`                   | ObjectId | Sí          | Identificador del pozo.                                          |
| `code`                  | String   | Sí          | Código único del pozo.                                           |
| `name`                  | String   | Sí          | Nombre del pozo.                                                 |
| `region`                | Object   | Sí          | Región embebida.                                                 |
| `region.code`           | String   | Sí          | Código de la región.                                             |
| `region.name`           | String   | Sí          | Nombre de la región.                                             |
| `field`                 | Object   | Sí          | Yacimiento embebido.                                             |
| `field.code`            | String   | Sí          | Código del yacimiento.                                           |
| `field.name`            | String   | Sí          | Nombre del yacimiento.                                           |
| `platform`              | Object   | Sí          | Plataforma embebida.                                             |
| `platform.code`         | String   | Sí          | Código de la plataforma.                                         |
| `platform.name`         | String   | Sí          | Nombre de la plataforma.                                         |
| `wellType`              | String   | Sí          | `oil`, `gas` o `mixed`.                                          |
| `exploitationType`      | String   | Sí          | `conventional` o `unconventional`.                               |
| `extractionMethod`      | String   | No          | `vertical`, `directional` o `horizontal`.                        |
| `status`                | String   | Sí          | `drilling`, `producing`, `maintenance`, `shut_in` o `abandoned`. |
| `startDate`             | Date     | Sí          | Fecha de inicio del pozo.                                        |
| `productionStartDate`   | Date     | Sí          | Fecha de inicio de producción.                                   |
| `coordinates`           | Object   | No          | Coordenadas geográficas.                                         |
| `coordinates.latitude`  | Number   | No          | Latitud.                                                         |
| `coordinates.longitude` | Number   | No          | Longitud.                                                        |
| `createdAt`             | Date     | Sí          | Fecha de creación.                                               |
| `updatedAt`             | Date     | Sí          | Fecha de última actualización.                                   |

Ejemplo:

```json
{
  "_id": "ObjectId",
  "code": "NEU-P01-W01",
  "name": "Pozo Norte 01",
  "region": { "code": "NEU", "name": "Cuenca Neuquina" },
  "field": { "code": "AREA-NORTE", "name": "Área Norte" },
  "platform": { "code": "NEU-PLAT-01", "name": "Plataforma Norte 01" },
  "wellType": "oil",
  "exploitationType": "unconventional",
  "extractionMethod": "horizontal",
  "status": "producing",
  "startDate": "2025-04-10T00:00:00.000Z",
  "productionStartDate": "2025-08-01T00:00:00.000Z",
  "coordinates": { "latitude": -38.5, "longitude": -69.5 },
  "createdAt": "2025-04-10T00:00:00.000Z",
  "updatedAt": "2025-08-01T00:00:00.000Z"
}
```

### 3.2. `monthly_productions`

| Propiedad       | Tipo     | Obligatorio | Descripción                    |
| --------------- | -------- | ----------- | ------------------------------ |
| `_id`           | ObjectId | Sí          | Identificador del registro.    |
| `wellId`        | ObjectId | Sí          | Referencia a `wells`.          |
| `year`          | Number   | Sí          | Año del período.               |
| `month`         | Number   | Sí          | Mes (1 a 12).                  |
| `oilVolumeM3`   | Number   | Sí          | Volumen de petróleo en m³.     |
| `gasVolumeM3`   | Number   | Sí          | Volumen de gas en m³.          |
| `waterVolumeM3` | Number   | Sí          | Volumen de agua en m³.         |
| `operatingDays` | Number   | Sí          | Días operativos del mes.       |
| `notes`         | String   | No          | Observaciones.                 |
| `createdAt`     | Date     | Sí          | Fecha de creación.             |
| `updatedAt`     | Date     | Sí          | Fecha de última actualización. |

Ejemplo:

```json
{
  "_id": "ObjectId",
  "wellId": "ObjectId-del-pozo",
  "year": 2026,
  "month": 9,
  "oilVolumeM3": 4250.75,
  "gasVolumeM3": 18200,
  "waterVolumeM3": 820,
  "operatingDays": 28,
  "notes": "Producción parcial por mantenimiento",
  "createdAt": "2026-10-01T10:00:00.000Z",
  "updatedAt": "2026-10-01T10:00:00.000Z"
}
```

## 4. Arquitectura de carpetas

```text
backend-ypf/
  data/
    productions.json
  src/
    config/
      database.js
    modules/
      wells/
        wells.routes.js
        wells.controller.js
        wells.service.js
        wells.repository.js
      productions/
        productions.routes.js
        productions.controller.js
        productions.service.js
        productions.repository.js
    middlewares/
      error-handler.js
      validate-request.js
    seeds/
      seed.js
    app.js
    server.js
```

- **Route:** declara endpoints y middlewares.
- **Controller:** recibe la solicitud HTTP, llama al service y construye la respuesta.
- **Service:** aplica las reglas de negocio.
- **Repository:** ejecuta consultas mediante el driver de MongoDB.
- **Config:** configura y mantiene la conexión.
- **Seed:** carga los pozos de referencia iniciales y las producciones de ejemplo desde `data/productions.json`.

## 5. Endpoints

Todas las rutas cuelgan de `/api`.

### 5.1. `wells` — CRUD completo

| Método | Ruta                         | Descripción                                        |
| ------ | ---------------------------- | -------------------------------------------------- |
| GET    | `/api/wells`                 | Lista pozos (`?region=&field=&platform=&status=`). |
| GET    | `/api/wells/:id`             | Obtiene un pozo por `_id`.                         |
| GET    | `/api/wells/:id/productions` | Producciones de un pozo (`?year=`).                |
| POST   | `/api/wells`                 | Crea un pozo.                                      |
| PUT    | `/api/wells/:id`             | Actualiza un pozo.                                 |
| DELETE | `/api/wells/:id`             | Elimina un pozo.                                   |

### 5.2. `monthly_productions` — CRUD completo

| Método | Ruta                   | Descripción                                   |
| ------ | ---------------------- | --------------------------------------------- |
| GET    | `/api/productions`     | Lista producciones (`?wellId=&year=&month=`). |
| GET    | `/api/productions/:id` | Obtiene un registro por `_id`.                |
| POST   | `/api/productions`     | Crea un registro de producción.               |
| PATCH  | `/api/productions/:id` | Actualiza parcialmente un registro.           |
| DELETE | `/api/productions/:id` | Elimina un registro.                          |

#### Consulta por fecha

Para pedir **todas** las producciones, se llama a `GET /api/productions` sin parámetros. Para pedir las de una **fecha específica**, se agrega el mes y el año como query string:

```text
GET /api/productions?year=2026&month=1
```

- `year` y `month` buscan por el mes y año solicitados (se pueden combinar con `wellId`).
- Si la consulta no devuelve resultados, la API responde **404** con el mensaje `No se encontró producción para el mes <mes> del año <año>` en lugar de un arreglo vacío. El mismo criterio aplica a cualquier consulta (`GET /api/productions`, `GET /api/wells/:id/productions`) sin resultados.

## 6. Datos de ejemplo (seed)

Al ejecutar `npm run seed` se cargan **8 pozos** de ejemplo repartidos en **2 regiones** (Cuenca Neuquina y Golfo San Jorge), **3 yacimientos** (`AREA-NORTE`, `AREA-ESTE`, `AREA-SUR`) y **4 plataformas** (`NEU-PLAT-01`, `NEU-PLAT-02`, `SJG-PLAT-01`, `SJG-PLAT-02`). La relación entre regiones, plataformas y pozos se explica en la sección 2.

Las producciones iniciales se cargan desde `data/productions.json`. Cada entrada referencia el pozo mediante `wellCode`, que el seed resuelve a su `_id` antes de insertar. Ejemplo de una entrada:

```json
{
  "wellCode": "NEU-P01-W01",
  "year": 2026,
  "month": 1,
  "oilVolumeM3": 1250.5,
  "gasVolumeM3": 5800,
  "waterVolumeM3": 320,
  "operatingDays": 31,
  "notes": "Producción estable enero"
}
```

## 7. Ejemplos de uso

Todas las rutas cuelgan de `http://localhost:3008`.

Para los requests por id (`GET`/`PUT`/`PATCH`/`DELETE`) se pueden usar los `_id` fijos que existen después de ejecutar `npm run seed`:

- `wellId`: `651111111111111111111101`
- `productionId`: `652222222222222222222201`

### 7.1. Wells

| Request               | Método   | URL                                                                    |
| --------------------- | -------- | ---------------------------------------------------------------------- |
| Listar pozos          | `GET`    | `http://localhost:3008/api/wells`                                      |
| Obtener pozo por id   | `GET`    | `http://localhost:3008/api/wells/651111111111111111111101`             |
| Producciones del pozo | `GET`    | `http://localhost:3008/api/wells/651111111111111111111101/productions` |
| Crear pozo            | `POST`   | `http://localhost:3008/api/wells`                                      |
| Actualizar pozo       | `PUT`    | `http://localhost:3008/api/wells/651111111111111111111101`             |
| Eliminar pozo         | `DELETE` | `http://localhost:3008/api/wells/651111111111111111111101`             |

- **Listar pozos**: filtros opcionales `region`, `field`, `platform` y `status` (se pueden combinar). Ejemplo, todos los pozos de una plataforma: `GET http://localhost:3008/api/wells?platform=NEU-PLAT-01`
- **Producciones del pozo**: query opcional `year`.
- **Crear pozo** y **Actualizar pozo**: header `Content-Type: application/json` y body JSON:

```json
{
  "code": "NEU-P01-W03",
  "name": "Pozo Norte 03",
  "region": { "code": "NEU", "name": "Cuenca Neuquina" },
  "field": { "code": "AREA-NORTE", "name": "Área Norte" },
  "platform": { "code": "NEU-PLAT-01", "name": "Plataforma Norte 01" },
  "wellType": "oil",
  "exploitationType": "unconventional",
  "extractionMethod": "horizontal",
  "status": "producing",
  "startDate": "2025-06-01T00:00:00.000Z",
  "productionStartDate": "2025-09-01T00:00:00.000Z",
  "coordinates": { "latitude": -38.53, "longitude": -69.52 }
}
```

### 7.2. Productions

| Request               | Método   | URL                                                              |
| --------------------- | -------- | ---------------------------------------------------------------- |
| Listar todas          | `GET`    | `http://localhost:3008/api/productions`                          |
| Buscar por fecha      | `GET`    | `http://localhost:3008/api/productions?year=2026&month=1`        |
| Obtener por id        | `GET`    | `http://localhost:3008/api/productions/652222222222222222222201` |
| Crear producción      | `POST`   | `http://localhost:3008/api/productions`                          |
| Actualizar producción | `PATCH`  | `http://localhost:3008/api/productions/652222222222222222222201` |
| Eliminar producción   | `DELETE` | `http://localhost:3008/api/productions/652222222222222222222201` |

- **Buscar por fecha**: enviar `year` y `month` como query string (opcional `wellId`).
- **Crear producción**: header `Content-Type: application/json` y body JSON:

```json
{
  "wellId": "651111111111111111111101",
  "year": 2026,
  "month": 4,
  "oilVolumeM3": 1300.5,
  "gasVolumeM3": 6000,
  "waterVolumeM3": 340,
  "operatingDays": 30,
  "notes": "Registro de ejemplo"
}
```

- **Actualizar producción**: body JSON con los campos a cambiar:

```json
{ "oilVolumeM3": 1350.25 }
```

### 7.3. Respuesta "no encontrado"

Cuando una consulta de producciones no devuelve resultados, la API responde **404** con este body (ejemplo: `?year=2026&month=6`):

```json
{ "error": "No se encontró producción para el mes 6 del año 2026" }
```
