// catalog-service/server.js
const express = require('express');
const redis = require('redis');

const app = express();
const port = 3001;

const client = redis.createClient({ url: 'redis://redis:6379' }); // Redis comme cache

// Ajouter un produit dans le catalogue
app.post('/products', async (req, res) => {
  const product = req.body;
  await client.set(`product:${product.id}`, JSON.stringify(product));
  res.status(201).json({ message: 'Produit ajouté' });
});

// Récupérer un produit par ID
app.get('/products/:id', async (req, res) => {
  const product = await redis.get(`product:${req.params.id}`);
  if (product) {
    res.json(JSON.parse(product));
  } else {
    res.status(404).json({ message: 'Produit non trouvé' });
  }
});

app.listen(port, () => {
  console.log(`Service Catalogue écoute sur le port ${port}`);
});
