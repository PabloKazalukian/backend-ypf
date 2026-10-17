const { Router } = require('express');
const controller = require('./wells.controller');

const router = Router();

// GET /api/wells?region=&field=&platform=&status=
router.get('/', controller.list);

// GET /api/wells/:id
router.get('/:id', controller.getById);

// GET /api/wells/:id/productions?year=2026
router.get('/:id/productions', controller.getProductions);

// POST /api/wells
router.post('/', controller.create);

// PUT /api/wells/:id
router.put('/:id', controller.update);

// DELETE /api/wells/:id
router.delete('/:id', controller.deleteWell);

module.exports = router;
