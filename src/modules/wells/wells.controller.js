const service = require('./wells.service');
const productionsService = require('../productions/productions.service');

async function list(req, res, next) {
  try {
    const wells = await service.listWells(req.query);
    res.json(wells);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const well = await service.getWellById(req.params.id);
    res.json(well);
  } catch (err) {
    next(err);
  }
}

async function getProductions(req, res, next) {
  try {
    const productions = await productionsService.listByWell(req.params.id, req.query);
    res.json(productions);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, getProductions };
