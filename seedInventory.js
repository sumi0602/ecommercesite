const mongoose = require('mongoose');
const Inventory = require('./models/Inventory'); // Adjust the path if necessary

mongoose.connect('mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(async () => {
    console.log('MongoDB connected...');

    // Replace with real ObjectIds from your Products collection
    const inventories = [
      {
        productId: '683936f099978d71c569a7b6',
        variants: [
          { color: 'Red', size: 'M', quantity: 10 },
          { color: 'Blue', size: 'L', quantity: 5 }
        ]
      },
      {
        productId: '683936f099978d71c569a7bb',
        variants: [
          { color: 'Red', size: 'M', quantity: 10 },
          { color: 'Blue', size: 'L', quantity: 5 }
        ]
      },
      {
        productId: '683936f099978d71c569a7c2',
        variants: [
          { color: 'Red', size: 'M', quantity: 10 },
          { color: 'Blue', size: 'L', quantity: 5 }
        ]
      },
    ];

    await Inventory.deleteMany(); // optional: clear previous entries
    await Inventory.insertMany(inventories);

    console.log('✅ Inventory seeded successfully!');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ DB error:', err);
    mongoose.disconnect();
  });
