const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.get('/:id/variants', productController.getAvailableVariants);

// Protected routes (add authentication middleware as needed)
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.post('/stock', productController.updateStock);
router.post('/check-stock', productController.checkStock);

module.exports = router;