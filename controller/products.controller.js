const router = require('express').Router();
const Product = require('../model/product.model');
const Image = require('../model/image.model');

router.get('/', async (req, res) => {
    try {
        const PRODUCTS_PER_PAGE = req.query.quantity ? +req.query.quantity : 20, page = req.query.page ? +req.query.page : 1;
        let productsCount;
        if(req.query.q){
            const p = await Product.find({
                "name": { "$regex": req.query.q, "$options": "i" }
            });
            productsCount = p.length;
        } else {
            const p = await Product.find();
            productsCount = p.length;
        }
        const pagesNumber = Math.ceil(productsCount / PRODUCTS_PER_PAGE);
        let products;
        if(req.query.q){
            products = await Product.find({
                "name": { "$regex": req.query.q, "$options": "i" }
            }).limit(PRODUCTS_PER_PAGE)
                .skip(PRODUCTS_PER_PAGE * (page - 1));
        } else {
            products = await Product.find()
                .limit(PRODUCTS_PER_PAGE)
                .skip(PRODUCTS_PER_PAGE * (page - 1));
        }

        res.json({
            data: {
                productsCount,
                products,
                currentPage: page,
                productsPerPage: PRODUCTS_PER_PAGE,
                pagesLength: pagesNumber,
            },
            success: true,
            error: null,
        });
    } catch (e) {
        console.log(e)
        res.json({
            data: null,
            success: false,
            error: "Error al obtener los datos.",
        });
    }
});

router.post('/', async (req, res) => {

    try {
        const {
            mimetype,
            buffer,
        } = req.files[0]

        const encode_image = buffer.toString('base64');

        const imgData = new Image({
            contentType: mimetype,
            image:  encode_image
        });

        await imgData.save();

        const product = new Product({
            name: req.body.name,
            image: imgData._id,
            price: req.body.price,
        });
        await product.save();
        res.json({
            data: product._id,
            success: true,
            error: null,
        });
    } catch (e) {
        res.status(403).json({
            data: null,
            success: false,
            error: "Error al guardar el producto.",
        });
    }
});

router.get('/image/:id', async (req, res) => {
    const img = await Image.findById(req.params.id);
    const image = Buffer.from(img.image, 'base64');
    res.writeHead(200, {
        'Content-Type': img.contentType,
        'Content-Length': image.length
    });
    res.end(image)
});

router.get('/find', async (req, res) => {
    try {
        const q = req.query.q;
        const products = await Product.find({
            "name": { "$regex": q, "$options": "i" }
        })
        res.json({
            data: products,
            success: true,
            error: null,
        });
    } catch (e) {
        res.json({
            data: null,
            success: false,
            error: "Error al buscar.",
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.json({
            data: product,
            success: true,
            error: null,
        });
    } catch (e) {
        res.json({
            data: null,
            success: false,
            error: "Error al obtener el producto.",
        });
    }
});

module.exports = router;

