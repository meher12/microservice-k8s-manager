const express = require('express');
const redis = require('redis');
const cors = require('cors');

const app = express();
const port = 3001;

// Configure Redis client
const client = redis.createClient({ url: 'redis://redis-service:6379' });

// Connecter au client Redis
(async () => {
  try {
    await client.connect();
    console.log('Connected to Redis');

    // Ajouter des produits à Redis (initialisation)
    const initialProducts = [
      { id: 1, name: "Product 1", price: 10 },
      { id: 2, name: "Product 2", price: 20 }
    ];
    for (const product of initialProducts) {
      await client.set(`product:${product.id}`, JSON.stringify(product));
    }
  } catch (error) {
    console.error('Redis connection error:', error);
  }
})();

// Middleware to parse JSON and handle CORS
app.use(express.json());
app.use(cors({ origin: 'http://frontend-service:80' }));  // Allow requests from the frontend server

// Handle Redis connection errors
client.on('error', (err) => {
  console.error('Redis connection error:', err);
});

// Ajouter un produit dans le catalogue
app.post('/api/products', async (req, res) => {
  try {
    const product = req.body;
    await client.set(`product:${product.id}`, JSON.stringify(product));
    res.setHeader('Content-Type', 'application/json');  // Set JSON content type
    res.status(201).json({ message: 'Produit ajouté' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Récupérer un produit par ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await client.get(`product:${req.params.id}`);
    res.setHeader('Content-Type', 'application/json');  // Set JSON content type
    if (product) {
      res.json(JSON.parse(product));
    } else {
      res.status(404).json({ message: 'Produit non trouvé' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Récupérer tous les produits
app.get('/api/products', async (req, res) => {
  try {
    const keys = await client.keys('product:*');
    const products = [];

    for (const key of keys) {
      const product = await client.get(key);
      products.push(JSON.parse(product));
    }

    res.setHeader('Content-Type', 'application/json');  // Set JSON content type
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Service Catalogue écoute sur le port ${port}`);
});
