const { Router } = require('express');
const controller = require('./wells.controller');

const router = Router();

// GET /api/v1/wells
router.get('/', controller.list);

// GET /api/v1/wells/:id
router.get('/:id', controller.getById);

// GET /api/v1/wells/:id/productions?year=2026
router.get('/:id/productions', controller.getProductions);

module.exports = router;
