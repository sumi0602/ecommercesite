// routes/inventoryRoutes.js
const express = require('express');
const Inventory = require('../models/Inventory');
const router = express.Router();

// Get inventory for a product
router.get('/:productId', async (req, res) => {
  try {
    const inventory = await Inventory.findOne({ productId: req.params.productId });
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update inventory
router.put('/:productId', async (req, res) => {
  try {
    const { updates } = req.body;
    const inventory = await Inventory.findOne({ productId: req.params.productId });
    
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }

    updates.forEach(update => {
      const variant = inventory.variants.id(update.variantId);
      if (variant) {
        variant.quantity = update.quantity;
      }
    });

    inventory.lastUpdated = Date.now();
    await inventory.save();
    
    res.json(inventory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Low stock alert endpoint
router.get('/alerts/low-stock', async (req, res) => {
  try {
    const lowStockItems = await Inventory.aggregate([
      { $unwind: '$variants' },
      { $match: { 'variants.quantity': { $lte: '$variants.threshold' } }},
      { $group: {
        _id: '$productId',
        variants: { $push: '$variants' }
      }},
      { $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }},
      { $unwind: '$product' },
      { $project: {
        productName: '$product.title',
        variants: 1
      }}
    ]);
    
    res.json(lowStockItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;