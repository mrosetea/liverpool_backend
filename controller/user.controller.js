const router = require('express').Router();
const User = require('../model/user.model');

const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');

const isAuthenticated = require('../middleware/isAuthenticated');

router.post('/login', async (req, res) => {
    passport.authenticate("local", { session: false }, (error, user) => {
        if (error || !user) {
            res.status(401).json({
                data: null,
                success: false,
                error: "Datos inválidos"
            });
        }else {
            const payload = {
                sub: user._id,
                exp: Date.now() + 10,
                username: user.username
            };
            const token = jwt.sign(JSON.stringify(payload), JWT_SECRET);
            res.json({
                data: token,
                success: true,
                error: null,
            });
        }

    })(req, res);
});

router.post('/register', async (req, res) => {
    try {
        let user = await User.findOne({ username: req.body.username });
        if(user) throw 'El usuario ya existe.';
        user = new User({
            name: req.body.name,
            lastName: req.body.lastName,
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, 15),
        });
        await user.save();
        res.json({
            data: user._id,
            success: true,
            error: null,
        });
    } catch (e) {
        res.status(403).json({
            data: null,
            success: false,
            error: e
        });
    }

});

router.post('/addToCart', isAuthenticated ,async (req, res) => {
    try {
        const { _id } = req.user;
        const user = await User.findById(_id);
        user.bag.push(req.body.product);
        await user.save();
        res.json({
            data: req.body.product,
            success: true,
            error: null,
        });
    } catch (e) {
        res.status(403).json({
            data: null,
            success: false,
            error: "Error al agregar el producto",
        });
    }
});

router.post('/deleteFromCart', isAuthenticated,async (req, res) => {
    try {
        const { _id } = req.user;
        const user = await User.findById(_id);
        const productIndex = user.bag.findIndex(p => p.toString() === req.body.product);
        user.bag.splice(productIndex, 1);
        await user.save();
        res.json({
            data: req.body.product,
            success: true,
            error: null
        });
    } catch (e) {
        console.log(e);
        res.status(403).json({
            data: null,
            success: false,
            error: "Error al eliminar el producto",
        });
    }
});

router.get('/getCart', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('bag');
        res.json({
            data: user.bag,
            error: null,
            success: true
        });
    } catch (e) {
        console.log(e)
        res.status(403).json({
            data: null,
            success: false,
            error: "Error al obtener el carrito",
        });
    }
});

module.exports = router;

