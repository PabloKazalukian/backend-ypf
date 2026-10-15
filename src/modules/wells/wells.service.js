const { ObjectId } = require('mongodb');
const repository = require('./wells.repository');

function isValidObjectId(id) {
  return typeof id === 'string' && ObjectId.isValid(id);
}

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function buildFilter(query) {
  const filter = {};

  if (query.region) filter['region.code'] = query.region;
  if (query.field) filter['field.code'] = query.field;
  if (query.platform) filter['platform.code'] = query.platform;
  if (query.status) filter.status = query.status;

  return filter;
}

async function listWells(query = {}) {
  return repository.findAll(buildFilter(query));
}

async function getWellById(id) {
  if (!isValidObjectId(id)) {
    throw httpError(400, 'Invalid well id');
  }

  const well = await repository.findById(new ObjectId(id));
  if (!well) {
    throw httpError(404, 'Well not found');
  }

  return well;
}

module.exports = { listWells, getWellById, isValidObjectId, httpError };
