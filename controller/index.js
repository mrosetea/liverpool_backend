const router = require('express').Router();
const Products = require('./products.controller');
const User = require('./user.controller');

router.use('/products', Products);
router.use('/user', User);

module.exports = router;

