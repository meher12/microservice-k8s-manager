const express = require('express');
const redis = require('redis');

const app = express();
const client = redis.createClient({ url: 'redis://redis:6379' }); // Redis comme cache

// Connexion Redis
client.connect().catch(console.error);

// Liste de produits (mockup)
const products = [
    { id: 1, name: 'Product 1', price: 10 },
    { id: 2, name: 'Product 2', price: 20 },
];

// Endpoint pour obtenir le catalogue
app.get('/products', async (req, res) => {
    const cachedProducts = await client.get('products');
    if (cachedProducts) {
        return res.json(JSON.parse(cachedProducts));
    }
    
    await client.set('products', JSON.stringify(products), { EX: 60 }); // Cache des produits pour 60s
    res.json(products);
});

app.listen(3001, () => {
    console.log('Catalog Service running on port 3001');
});
