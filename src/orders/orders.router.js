const router = require('express').Router();

// TODO: Implement the /orders routes needed to make the tests pass
// orders controller
const controller = require('./orders.controller');
// methodNotAllowed error handler
const methodNotAllowed = require('../errors/methodNotAllowed');

router
	.route('/')
	.get(controller.list)
	.post(controller.create)
	.all(methodNotAllowed);
router
	.route('/:orderId')
	.get(controller.read)
	.put(controller.update)
	.delete(controller.delete)
	.all(methodNotAllowed);

module.exports = router;
