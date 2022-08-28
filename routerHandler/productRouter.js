const express = require('express');
const {
    getProducts,
    addProduct,
    updateProduct,
    getProductById,
    deleteProduct,
} = require('../controllers/product.controller');

const router = express.Router();

router.get('/', getProducts)
router.get('/:productId', getProductById)
router.post('/', addProduct)
router.put('/:productId', updateProduct)
router.delete('/:productId', deleteProduct)

module.exports = router;