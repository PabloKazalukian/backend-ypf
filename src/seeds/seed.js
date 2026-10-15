const { connectDatabase, getDb, closeDatabase } = require('../config/database');
const { ensureIndexes: ensureWellIndexes } = require('../modules/wells/wells.repository');
const { ensureIndexes: ensureProductionIndexes } = require('../modules/productions/productions.repository');

const WELLS = [
  {
    code: 'NEU-P01-W01',
    name: 'Pozo Norte 01',
    region: { code: 'NEU', name: 'Cuenca Neuquina' },
    field: { code: 'AREA-NORTE', name: 'Área Norte' },
    platform: { code: 'PLAT-01', name: 'Plataforma Norte 01' },
    wellType: 'oil',
    exploitationType: 'unconventional',
    extractionMethod: 'horizontal',
    status: 'producing',
    startDate: new Date('2025-04-10T00:00:00.000Z'),
    productionStartDate: new Date('2025-08-01T00:00:00.000Z'),
    coordinates: { latitude: -38.5, longitude: -69.5 },
  },
  {
    code: 'NEU-P01-W02',
    name: 'Pozo Norte 02',
    region: { code: 'NEU', name: 'Cuenca Neuquina' },
    field: { code: 'AREA-NORTE', name: 'Área Norte' },
    platform: { code: 'PLAT-01', name: 'Plataforma Norte 01' },
    wellType: 'gas',
    exploitationType: 'unconventional',
    extractionMethod: 'horizontal',
    status: 'producing',
    startDate: new Date('2025-05-12T00:00:00.000Z'),
    productionStartDate: new Date('2025-09-01T00:00:00.000Z'),
    coordinates: { latitude: -38.52, longitude: -69.51 },
  },
  {
    code: 'SJG-P02-W01',
    name: 'Pozo San Jorge 01',
    region: { code: 'SJG', name: 'Golfo San Jorge' },
    field: { code: 'AREA-SUR', name: 'Área Sur' },
    platform: { code: 'PLAT-02', name: 'Plataforma Sur 02' },
    wellType: 'mixed',
    exploitationType: 'conventional',
    extractionMethod: 'vertical',
    status: 'producing',
    startDate: new Date('2024-11-03T00:00:00.000Z'),
    productionStartDate: new Date('2025-01-01T00:00:00.000Z'),
    coordinates: { latitude: -45.9, longitude: -67.5 },
  },
];

async function run() {
  await connectDatabase();
  const db = getDb();

  await ensureWellIndexes();
  await ensureProductionIndexes();

  await db.collection('wells').deleteMany({});
  const now = new Date();
  const docs = WELLS.map((well) => ({ ...well, createdAt: now, updatedAt: now }));
  const result = await db.collection('wells').insertMany(docs);

  console.log(`Seeded ${result.insertedCount} wells.`);
  await closeDatabase();
}

run().catch(async (err) => {
  console.error('Seed failed:', err);
  await closeDatabase();
  process.exit(1);
});
