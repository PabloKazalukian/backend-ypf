const service = require('./wells.service');
const productionsService = require('../productions/productions.service');

// --- READ (YA EXISTENTES) ---
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

// --- CREATE (POST) ---
async function create(req, res, next) {
  try {
    const newWell = await service.createWell(req.body);
    res.status(201).json(newWell);
  } catch (err) {
    next(err);
  }
}

// --- UPDATE (PUT) ---
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const updatedWell = await service.updateWell(id, req.body);
    res.json(updatedWell);
  } catch (err) {
    next(err);
  }
}

// --- DELETE (DELETE) ---
async function deleteWell(req, res, next) {
  try {
    const { id } = req.params;
    await service.deleteWell(id);
    res.json({ message: 'Pozo eliminado con éxito 🛢️' });
  } catch (err) {
    next(err);
  }
}

// Exportamos el CRUD completo de forma limpia
module.exports = { 
  list, 
  getById, 
  getProductions,
  create,
  update,
  deleteWell
};
