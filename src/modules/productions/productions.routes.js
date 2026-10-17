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

router.get('/', controller.list);

router.post('/', requireBodyFields(requiredOnCreate), controller.create);

router.get('/:id', controller.getById);

router.patch('/:id', controller.update);

router.delete('/:id', controller.deleteProduction);

module.exports = router;
