const service = require('./productions.service');

async function list(req, res, next) {
  try {
    const productions = await service.listProductions(req.query);
    res.json(productions);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const production = await service.createProduction(req.body || {});
    res.status(201).json(production);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const production = await service.getProductionById(req.params.id);
    res.json(production);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const production = await service.updateProduction(req.params.id, req.body || {});
    res.json(production);
  } catch (err) {
    next(err);
  }
}

async function deleteProduction(req, res, next) {
  try {
    const { id } = req.params;
    await service.deleteProduction(id);
    res.json({ message: 'Registro de producción eliminado con éxito' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, deleteProduction };
