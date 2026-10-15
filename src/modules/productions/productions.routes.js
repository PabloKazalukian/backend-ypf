const { Router } = require('express');
const controller = require('./productions.controller');
const { requireBodyFields } = require('../../middlewares/validate-request');

const router = Router();

const requiredOnCreate = [
  'wellId',
  'year',
  'month',
  'oilVolumeM3',
  'gasVolumeM3',
  'waterVolumeM3',
  'operatingDays',
];

// GET /api/v1/productions?wellId=...&year=2026&month=9
router.get('/', controller.list);

// POST /api/v1/productions
router.post('/', requireBodyFields(requiredOnCreate), controller.create);

// PATCH /api/v1/productions/:id
router.patch('/:id', controller.update);

module.exports = router;
