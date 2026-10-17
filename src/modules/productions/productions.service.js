const { ObjectId } = require('mongodb');
const repository = require('./productions.repository');
const wellService = require('../wells/wells.service');

const { httpError } = wellService;

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function isNonNegativeNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function validatePeriod(year, month) {
  if (!Number.isInteger(year)) {
    throw httpError(400, 'year must be an integer');
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw httpError(400, 'month must be an integer between 1 and 12');
  }
}

async function assertWellExists(wellId) {
  if (!wellService.isValidObjectId(wellId)) {
    throw httpError(400, 'Invalid wellId');
  }
  return wellService.getWellById(wellId);
}

function buildFilter(query) {
  const filter = {};

  if (query.wellId) {
    if (!wellService.isValidObjectId(query.wellId)) {
      throw httpError(400, 'Invalid wellId');
    }
    filter.wellId = new ObjectId(query.wellId);
  }
  if (query.year) filter.year = Number(query.year);
  if (query.month) filter.month = Number(query.month);

  return filter;
}

function emptyResultError(query = {}) {
  if (query.year && query.month) {
    return httpError(
      404,
      `No se encontró producción para el mes ${query.month} del año ${query.year}`
    );
  }
  if (query.year) {
    return httpError(404, `No se encontró producción para el año ${query.year}`);
  }
  return httpError(404, 'No se encontraron registros de producción');
}

async function listProductions(query = {}) {
  const productions = await repository.findAll(buildFilter(query));
  if (productions.length === 0) {
    throw emptyResultError(query);
  }
  return productions;
}

async function listByWell(wellId, query = {}) {
  await assertWellExists(wellId);

  const filter = { wellId: new ObjectId(wellId) };
  if (query.year) filter.year = Number(query.year);

  const productions = await repository.findAll(filter);
  if (productions.length === 0) {
    throw emptyResultError(query);
  }
  return productions;
}

async function createProduction(payload) {
  const { wellId, year, month, oilVolumeM3, gasVolumeM3, waterVolumeM3, operatingDays, notes } = payload;

  validatePeriod(year, month);
  await assertWellExists(wellId);

  const volumes = { oilVolumeM3, gasVolumeM3, waterVolumeM3 };
  for (const [field, value] of Object.entries(volumes)) {
    if (!isNonNegativeNumber(value)) {
      throw httpError(400, `${field} must be a non-negative number`);
    }
  }

  const maxDays = daysInMonth(year, month);
  if (!Number.isInteger(operatingDays) || operatingDays < 0 || operatingDays > maxDays) {
    throw httpError(400, `operatingDays must be an integer between 0 and ${maxDays}`);
  }

  const existing = await repository.findByWellPeriod(new ObjectId(wellId), year, month);
  if (existing) {
    throw httpError(409, 'Production record already exists for this well and period');
  }

  const now = new Date();
  const doc = {
    wellId: new ObjectId(wellId),
    year,
    month,
    oilVolumeM3,
    gasVolumeM3,
    waterVolumeM3,
    operatingDays,
    notes: notes ?? null,
    createdAt: now,
    updatedAt: now,
  };

  try {
    return await repository.insertOne(doc);
  } catch (err) {
    if (err.code === 11000) {
      throw httpError(409, 'Production record already exists for this well and period');
    }
    throw err;
  }
}

async function getProductionById(id) {
  if (!wellService.isValidObjectId(id)) {
    throw httpError(400, 'Invalid id');
  }

  const production = await repository.findById(new ObjectId(id));
  if (!production) {
    throw httpError(404, 'Production record not found');
  }

  return production;
}

async function deleteProduction(id) {
  if (!wellService.isValidObjectId(id)) {
    throw httpError(400, 'Invalid id');
  }

  const deleted = await repository.deleteById(new ObjectId(id));
  if (!deleted) {
    throw httpError(404, 'Production record not found');
  }

  return true;
}

async function updateProduction(id, payload) {
  if (!wellService.isValidObjectId(id)) {
    throw httpError(400, 'Invalid id');
  }

  const objectId = new ObjectId(id);
  const existing = await repository.findById(objectId);
  if (!existing) {
    throw httpError(404, 'Production record not found');
  }

  const fields = {};
  const { year, month, oilVolumeM3, gasVolumeM3, waterVolumeM3, operatingDays, notes } = payload;

  const targetYear = year ?? existing.year;
  const targetMonth = month ?? existing.month;

  if (year !== undefined || month !== undefined) {
    validatePeriod(targetYear, targetMonth);
    fields.year = targetYear;
    fields.month = targetMonth;
  }

  const volumes = { oilVolumeM3, gasVolumeM3, waterVolumeM3 };
  for (const [field, value] of Object.entries(volumes)) {
    if (value !== undefined) {
      if (!isNonNegativeNumber(value)) {
        throw httpError(400, `${field} must be a non-negative number`);
      }
      fields[field] = value;
    }
  }

  const maxDays = daysInMonth(targetYear, targetMonth);
  if (operatingDays !== undefined) {
    if (!Number.isInteger(operatingDays) || operatingDays < 0 || operatingDays > maxDays) {
      throw httpError(400, `operatingDays must be an integer between 0 and ${maxDays}`);
    }
    fields.operatingDays = operatingDays;
  }

  if (notes !== undefined) fields.notes = notes;

  // If the period changes, ensure the new period is still unique for this well.
  const periodChanged = targetYear !== existing.year || targetMonth !== existing.month;
  if (periodChanged) {
    const clash = await repository.findByWellPeriod(existing.wellId, targetYear, targetMonth);
    if (clash) {
      throw httpError(409, 'Production record already exists for this well and period');
    }
  }

  await repository.updateById(objectId, fields);
  return repository.findById(objectId);
}

module.exports = {
  listProductions,
  listByWell,
  getProductionById,
  createProduction,
  updateProduction,
  deleteProduction,
};
