const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Connexion MongoDB
mongoose.connect('mongodb://mongo:27017/orders', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB')).catch(console.error);

// Modèle de commande
const orderSchema = new mongoose.Schema({
    productId: Number,
    quantity: Number,
    date: { type: Date, default: Date.now },
});
const Order = mongoose.model('Order', orderSchema);

// Endpoint pour créer une commande
app.post('/orders', async (req, res) => {
    const order = new Order(req.body);
    await order.save();
    res.json(order);
});

// Endpoint pour obtenir toutes les commandes
app.get('/orders', async (req, res) => {
    const orders = await Order.find();
    res.json(orders);
});

app.listen(3002, () => {
    console.log('Order Service running on port 3002');
});
