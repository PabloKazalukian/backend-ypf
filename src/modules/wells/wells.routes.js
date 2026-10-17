const { Router } = require('express');
const controller = require('./wells.controller');

const router = Router();

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.get('/:id/productions', controller.getProductions);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.deleteWell);

module.exports = router;
