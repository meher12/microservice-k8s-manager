const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import the CORS middleware

const app = express();
const port = 3002;

// Enable CORS for all routes and set the allowed origin
app.use(cors({ origin: 'http://frontend-service:80' })); 

// Middleware to parse JSON
app.use(express.json());

// Connexion MongoDB
const mongoUrl = 'mongodb://root:example@mongodb-service:27017/orders?authSource=admin';
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); // Exit the process if the connection fails
  });


// Modèle de commande
const orderSchema = new mongoose.Schema({
  productId: Number,
  quantity: Number,
  date: { type: Date, default: Date.now },
});
const Order = mongoose.model('Order', orderSchema);

// Endpoint pour créer une commande
app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.setHeader('Content-Type', 'application/json');  // Set JSON content type
    res.json(order);
  } catch (error) {
    console.error('Error creating order', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint pour obtenir toutes les commandes
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.setHeader('Content-Type', 'application/json');  // Set JSON content type
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Order Service running on port ${port}`);
});
