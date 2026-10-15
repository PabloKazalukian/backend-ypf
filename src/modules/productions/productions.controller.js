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

async function update(req, res, next) {
  try {
    const production = await service.updateProduction(req.params.id, req.body || {});
    res.json(production);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update };
