# Oilfield Production Management API

API REST académica para consultar pozos petroleros y registrar su
producción mensual. El proyecto utiliza Node.js, Express y el driver
oficial de MongoDB.

## 1. Datos generales

- **Puerto:** la API escucha en el puerto **3008**
  (`http://localhost:3008`).
- **Base de datos:** MongoDB mediante el driver oficial.
- **Colecciones:** `wells` y `monthly_productions`.

## 2. Esquemas de documentos

En MongoDB, `_id` y la referencia `wellId` son valores BSON `ObjectId`.
Los ejemplos muestran los tipos de dato de cada propiedad.

### 2.1. `wells`

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
  "platform": { "code": "PLAT-01", "name": "Plataforma Norte 01" },
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

### 2.2. `monthly_productions`

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

## 3. Arquitectura de carpetas

```text
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
- **Controller:** recibe la solicitud HTTP, llama al service y
  construye la respuesta.
- **Service:** aplica las reglas de negocio.
- **Repository:** ejecuta consultas mediante el driver de MongoDB.
- **Config:** configura y mantiene la conexión.
- **Seed:** carga los pozos de referencia iniciales.
