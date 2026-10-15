const { getDb } = require('../../config/database');

const COLLECTION = 'monthly_productions';

const collection = () => getDb().collection(COLLECTION);

async function findAll(filter = {}) {
  return collection().find(filter).sort({ year: 1, month: 1 }).toArray();
}

async function findById(objectId) {
  return collection().findOne({ _id: objectId });
}

async function findByWellPeriod(wellId, year, month) {
  return collection().findOne({ wellId, year, month });
}

async function insertOne(doc) {
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

async function updateById(objectId, fields) {
  const result = await collection().updateOne(
    { _id: objectId },
    { $set: { ...fields, updatedAt: new Date() } }
  );
  return result.matchedCount > 0;
}

async function ensureIndexes() {
  await collection().createIndex({ wellId: 1, year: 1, month: 1 }, { unique: true });
}

module.exports = {
  findAll,
  findById,
  findByWellPeriod,
  insertOne,
  updateById,
  ensureIndexes,
};
