const { getDb } = require('../../config/database');

const COLLECTION = 'wells';

const collection = () => getDb().collection(COLLECTION);

async function findAll(filter = {}) {
  return collection().find(filter).sort({ code: 1 }).toArray();
}

async function findById(objectId) {
  return collection().findOne({ _id: objectId });
}

async function createWell(wellData) {
  const result = await collection().insertOne(wellData);
  return { _id: result.insertedId, ...wellData };
}

async function updateWell(objetId, updateData) {
  const result = await collection().findOneAndUpdate(
    { _id: objetId },
    { $set: updateData },
    { returnDocument: 'after' }
  );
  return result.value || result;
}

async function deleteWell(objectId) {
  const result = await collection().deleteOne({ id: objetId });
  return result.deletedCount > 0;
}

async function ensureIndexes() {
  await collection().createIndex({ code: 1 }, { unique: true });
  await collection().createIndex({ 'region.code': 1 });
  await collection().createIndex({ 'field.code': 1 });
  await collection().createIndex({ 'platform.code': 1 });
  await collection().createIndex({ status: 1 });
}

module.exports = { 
  findAll, 
  findById, 
  createWell,
  updateWell,
  deleteWell,
  ensureIndexes 
};
