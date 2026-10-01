// server.js
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Mengizinkan request dari frontend React
app.use(express.json()); // Membaca body request berformat JSON

// Data Dummy (Bisa diganti dengan koneksi database MongoDB/MySQL/PostgreSQL)
const categories = [
  {
    id: 'cooking-oil',
    name: 'Cooking Oil',
    description: 'Premium palm and vegetable cooking oils for culinary use.',
    image: 'https://images.unsplash.com/photo-1552592074-ea7a91b851b3?w=600&h=400&fit=crop&auto=format',
    color: '#F59E0B',
  },
  {
    id: 'coffee',
    name: 'Coffee',
    description: 'Quality Indonesian coffee products in sachet and bulk packaging.',
    image: 'https://images.unsplash.com/photo-1643426879831-b20d0d9e0110?w=600&h=400&fit=crop&auto=format',
    color: '#92400E',
  },
  {
    id: 'poultry-meat',
    name: 'Poultry Meat',
    description: 'Fresh and frozen halal poultry products for food service.',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&h=400&fit=crop&auto=format',
    color: '#DC2626',
  },
  {
    id: 'frozen-food',
    name: 'Frozen Food',
    description: 'Premium frozen seafood and processed meat products.',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&h=400&fit=crop&auto=format',
    color: '#0369A1',
  },
  {
    id: 'vanilla',
    name: 'Vanilla',
    description: 'Natural vanilla beans and extracts from Indonesia.',
    image: 'https://images.unsplash.com/photo-1592788174877-3f99727fd23d?w=600&h=400&fit=crop&auto=format',
    color: '#7C3AED',
  },
  {
    id: 'palm-sugar',
    name: 'Palm Sugar',
    description: 'Natural palm and coconut sugar products, sustainably sourced.',
    image: 'https://images.unsplash.com/photo-1619338098121-5925681fc9ab?w=600&h=400&fit=crop&auto=format',
    color: '#16a34a',
  },
];

const products = [
  {
    id: 'kopi-kapal-api',
    name: 'Kopi Kapal Api Special',
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1758221052634-33f352d1318b?w=600&h=600&fit=crop&auto=format',
    description: "Kopi Kapal Api Special is one of Indonesia's most iconic coffee brands. A rich blend of Robusta and Arabica beans, delivering a strong and aromatic cup.",
    packaging: 'Sachet / Pouch / Carton',
    sizes: ['165g', '380g', '500g', '1kg', 'Bulk'],
    origin: 'Indonesia',
    certification: 'BPOM, Halal MUI',
    specs: 'Ground roasted coffee, medium-dark roast, distinctive aroma',
  },
  {
    id: 'white-koffie',
    name: 'White Koffie',
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1643426879831-b20d0d9e0110?w=600&h=600&fit=crop&auto=format',
    description: 'White Koffie is a popular Indonesian instant white coffee blend, combining smooth coffee with creamer for a balanced and mild taste.',
    packaging: 'Sachet Box / Carton',
    sizes: ['20g per sachet', '10-sachet box', 'Bulk carton'],
    origin: 'Indonesia',
    certification: 'BPOM, Halal MUI',
    specs: '3-in-1 instant white coffee, sugar and creamer included',
  },
  {
    id: 'bimoli-special',
    name: 'Bimoli Special',
    category: 'cooking-oil',
    image: 'https://images.unsplash.com/photo-1552592074-ea7a91b851b3?w=600&h=600&fit=crop&auto=format',
    description: 'Bimoli Special is a premium refined palm cooking oil, widely used in households and food service across Indonesia.',
    packaging: 'Bottle / Jerry Can / Bulk',
    sizes: ['250ml', '500ml', '1L', '2L', '5L', '18L'],
    origin: 'Indonesia',
    certification: 'BPOM, SNI, Halal MUI',
    specs: 'Refined bleached deodorized (RBD) palm oil, cholesterol-free',
  }
];

// Routes API
app.get('/', (req, res) => {
  res.send('Server Karmindo Backend Berjalan!');
});
// GET semua kategori
app.get('/api/categories', (req, res) => {
    
  res.json(categories);
});

// GET semua produk (dengan opsi filter berdasarkan query category)
app.get('/api/products', (req, res) => {
  const { category } = req.query;
  if (category) {
    const filteredProducts = products.filter(p => p.category === category);
    return res.json(filteredProducts);
  }
  res.json(products);
});

// GET detail produk berdasarkan ID
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Produk tidak ditemukan' });
  }
  res.json(product);
});

// Jalankan Server
app.listen(PORT, () => {
  console.log(`Server Express berjalan di http://localhost:${PORT}`);
});