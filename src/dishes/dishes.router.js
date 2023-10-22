const router = require("express").Router();

// TODO: Implement the /dishes routes needed to make the tests pass
// dishes controller
const controller = require('./dishes.controller')
// methodNotAllowed error handler
const methodNotAllowed = require('../errors/methodNotAllowed')

router.route('/').get(controller.list).all(methodNotAllowed)

module.exports = router;
