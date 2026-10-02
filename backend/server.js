// server.js
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());

// Serve static images from uploads directory
app.use('/uploads', express.static(uploadDir));

// ================= DUMMY USER DATA & AUTH =================
let currentUser = {
  id: 'usr-1',
  name: 'Administrator',
  email: 'admin@uks.com',
  role: 'Administrator',
  password: 'password123',
};

// ================= USER & AUTH API =================

// POST Login User
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi.' });
  }

  if (
    email.toLowerCase() === currentUser.email.toLowerCase() &&
    password === currentUser.password
  ) {
    const { password: _, ...userWithoutPassword } = currentUser;
    return res.json({
      message: 'Login berhasil',
      user: userWithoutPassword,
      token: 'dummy-jwt-token-123456',
    });
  }

  return res.status(401).json({ message: 'Email atau password salah.' });
});

// GET Profile User saat ini
app.get('/api/auth/me', (req, res) => {
  const { password, ...userWithoutPassword } = currentUser;
  res.json(userWithoutPassword);
});

// PUT Update Profile
app.put('/api/user/profile', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Nama dan email wajib diisi.' });
  }

  currentUser.name = name;
  currentUser.email = email;

  const { password, ...userWithoutPassword } = currentUser;
  res.json({
    message: 'Profile updated successfully.',
    user: userWithoutPassword,
  });
});

// PUT Change Password
app.put('/api/user/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Password baru minimal 6 karakter.' });
  }

  if (currentPassword && currentPassword !== currentUser.password) {
    return res.status(400).json({ message: 'Password saat ini salah.' });
  }

  currentUser.password = newPassword;
  res.json({ message: 'Password changed successfully.' });
});

// ================= CATEGORIES DATA & API =================
// ================= CATEGORIES DATA & API =================
let categories = [
  {
    id: 'cooking-oil',
    name: 'Cooking Oil',
    description: 'Premium palm and vegetable cooking oils for culinary use.',
    image: 'https://images.unsplash.com/photo-1552592074-ea7a91b851b3?w=600&h=400&fit=crop&auto=format',
    imageUrl: 'https://images.unsplash.com/photo-1552592074-ea7a91b851b3?w=600&h=400&fit=crop&auto=format',
    color: '#F59E0B',
    status: 'active',
    sortOrder: 1,
  },
  {
    id: 'coffee',
    name: 'Coffee',
    description: 'Quality Indonesian coffee products in sachet and bulk packaging.',
    image: 'https://images.unsplash.com/photo-1643426879831-b20d0d9e0110?w=600&h=400&fit=crop&auto=format',
    imageUrl: 'https://images.unsplash.com/photo-1643426879831-b20d0d9e0110?w=600&h=400&fit=crop&auto=format',
    color: '#92400E',
    status: 'active',
    sortOrder: 2,
  },
  {
    id: 'poultry-meat',
    name: 'Poultry Meat',
    description: 'Fresh and frozen halal poultry products for food service.',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&h=400&fit=crop&auto=format',
    imageUrl: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&h=400&fit=crop&auto=format',
    color: '#DC2626',
    status: 'active',
    sortOrder: 3,
  },
  {
    id: 'frozen-food',
    name: 'Frozen Food',
    description: 'Premium frozen seafood and processed meat products.',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&h=400&fit=crop&auto=format',
    imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&h=400&fit=crop&auto=format',
    color: '#0369A1',
    status: 'active',
    sortOrder: 4,
  },
  {
    id: 'vanilla',
    name: 'Vanilla',
    description: 'Natural vanilla beans and extracts from Indonesia.',
    image: 'https://images.unsplash.com/photo-1592788174877-3f99727fd23d?w=600&h=400&fit=crop&auto=format',
    imageUrl: 'https://images.unsplash.com/photo-1592788174877-3f99727fd23d?w=600&h=400&fit=crop&auto=format',
    color: '#7C3AED',
    status: 'active',
    sortOrder: 5,
  },
  {
    id: 'palm-sugar',
    name: 'Palm Sugar',
    description: 'Natural palm and coconut sugar products, sustainably sourced.',
    image: 'https://images.unsplash.com/photo-1619338098121-5925681fc9ab?w=600&h=400&fit=crop&auto=format',
    imageUrl: 'https://images.unsplash.com/photo-1619338098121-5925681fc9ab?w=600&h=400&fit=crop&auto=format',
    color: '#16a34a',
    status: 'active',
    sortOrder: 6,
  },
];

app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.post('/api/categories', (req, res) => {
  const { name, description, image, imageUrl, color, status, sortOrder } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Nama kategori wajib diisi.' });
  }

  const id = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Date.now();

  const finalImage = imageUrl || image || '';

  const newCategory = {
    id,
    name,
    description: description || '',
    image: finalImage,
    imageUrl: finalImage, // Menyediakan kedua properti untuk Admin & Public
    color: color || '#FF2027',
    status: status || 'active',
    sortOrder: Number(sortOrder) || 0,
    createdAt: new Date().toISOString(),
  };

  categories.push(newCategory);
  res.status(201).json(newCategory);
});

app.put('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const index = categories.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
  }

  const body = req.body;
  const finalImage = body.imageUrl || body.image || categories[index].imageUrl || categories[index].image;

  categories[index] = {
    ...categories[index],
    ...body,
    image: finalImage,
    imageUrl: finalImage, // Sync kedua properti saat di-update
    updatedAt: new Date().toISOString(),
  };

  res.json(categories[index]);
});

app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.post('/api/categories', (req, res) => {
  const { name, description, image, imageUrl, color, status, sortOrder } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Nama kategori wajib diisi.' });
  }

  const id = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Date.now();

  const newCategory = {
    id,
    name,
    description: description || '',
    image: image || imageUrl || '',
    color: color || '#FF2027',
    status: status || 'active',
    sortOrder: Number(sortOrder) || 0,
    createdAt: new Date().toISOString(),
  };

  categories.push(newCategory);
  res.status(201).json(newCategory);
});

app.put('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const index = categories.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
  }

  const body = req.body;
  if (body.imageUrl && !body.image) body.image = body.imageUrl;

  categories[index] = {
    ...categories[index],
    ...body,
    updatedAt: new Date().toISOString(),
  };

  res.json(categories[index]);
});

app.patch('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const category = categories.find((c) => c.id === id);

  if (!category) {
    return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
  }

  if (status) {
    category.status = status;
    category.updatedAt = new Date().toISOString();
  }

  res.json(category);
});

app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = categories.length;
  categories = categories.filter((c) => c.id !== id);

  if (categories.length === initialLength) {
    return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
  }

  res.json({ message: 'Kategori berhasil dihapus.' });
});

// ================= PRODUCTS DATA & API =================
let products = [
  {
    id: 'kopi-kapal-api',
    name: 'Kopi Kapal Api Special',
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1758221052634-33f352d1318b?w=600&h=600&fit=crop&auto=format',
    shortDescription: 'Iconic Indonesian ground coffee.',
    description: "Kopi Kapal Api Special is one of Indonesia's most iconic coffee brands. A rich blend of Robusta and Arabica beans, delivering a strong and aromatic cup.",
    packaging: 'Sachet / Pouch / Carton',
    sizes: ['165g', '380g', '500g', '1kg', 'Bulk'],
    origin: 'Indonesia',
    certification: 'BPOM, Halal MUI',
    specs: 'Ground roasted coffee, medium-dark roast, distinctive aroma',
    status: 'published',
    sortOrder: 0,
  },
  {
    id: 'white-koffie',
    name: 'White Koffie',
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1643426879831-b20d0d9e0110?w=600&h=400&fit=crop&auto=format',
    shortDescription: 'Smooth instant white coffee.',
    description: 'White Koffie is a popular Indonesian instant white coffee blend, combining smooth coffee with creamer for a balanced and mild taste.',
    packaging: 'Sachet Box / Carton',
    sizes: ['20g per sachet', '10-sachet box', 'Bulk carton'],
    origin: 'Indonesia',
    certification: 'BPOM, Halal MUI',
    specs: '3-in-1 instant white coffee, sugar and creamer included',
    status: 'published',
    sortOrder: 1,
  },
  {
    id: 'bimoli-special',
    name: 'Bimoli Special',
    category: 'cooking-oil',
    image: 'https://images.unsplash.com/photo-1552592074-ea7a91b851b3?w=600&h=400&fit=crop&auto=format',
    shortDescription: 'Premium refined palm cooking oil.',
    description: 'Bimoli Special is a premium refined palm cooking oil, widely used in households and food service across Indonesia.',
    packaging: 'Bottle / Jerry Can / Bulk',
    sizes: ['250ml', '500ml', '1L', '2L', '5L', '18L'],
    origin: 'Indonesia',
    certification: 'BPOM, SNI, Halal MUI',
    specs: 'Refined bleached deodorized (RBD) palm oil, cholesterol-free',
    status: 'published',
    sortOrder: 2,
  },
];

app.get('/api/products', (req, res) => {
  const { category } = req.query;
  if (category) {
    const filteredProducts = products.filter((p) => p.category === category);
    return res.json(filteredProducts);
  }
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Produk tidak ditemukan' });
  }
  res.json(product);
});

app.post('/api/products', (req, res) => {
  const newProductData = req.body;

  if (!newProductData.name || (!newProductData.category && !newProductData.categoryId)) {
    return res.status(400).json({ message: 'Nama dan kategori produk wajib diisi.' });
  }

  const id = newProductData.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Date.now();

  const category = newProductData.category || newProductData.categoryId;
  const image = newProductData.image || newProductData.imageUrl || '';
  const sizes = newProductData.sizes || newProductData.availableSizes || [];

  const newProduct = {
    id,
    ...newProductData,
    category,
    image,
    sizes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Produk tidak ditemukan.' });
  }

  const body = req.body;
  if (body.categoryId && !body.category) body.category = body.categoryId;
  if (body.imageUrl && !body.image) body.image = body.imageUrl;
  if (body.availableSizes && !body.sizes) body.sizes = body.availableSizes;

  const updatedProduct = {
    ...products[index],
    ...body,
    updatedAt: new Date().toISOString(),
  };

  products[index] = updatedProduct;
  res.json(updatedProduct);
});

app.patch('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ message: 'Produk tidak ditemukan.' });
  }

  if (status) {
    product.status = status;
    product.updatedAt = new Date().toISOString();
  }

  res.json(product);
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = products.length;
  products = products.filter((p) => p.id !== id);

  if (products.length === initialLength) {
    return res.status(404).json({ message: 'Produk tidak ditemukan.' });
  }

  res.json({ message: 'Produk berhasil dihapus.' });
});

// ================= FILE UPLOAD & MEDIA LIBRARY API =================

app.get('/api/media', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Gagal membaca folder uploads.' });
    }

    const mediaList = files.map((file) => {
      const filePath = path.join(uploadDir, file);
      const stats = fs.statSync(filePath);

      return {
        id: file,
        filename: file,
        size: stats.size,
        url: `${req.protocol}://${req.get('host')}/uploads/${file}`,
        createdAt: stats.birthtime,
      };
    });

    res.json(mediaList);
  });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Tidak ada file yang diunggah.' });
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.json({
    id: req.file.filename,
    filename: req.file.filename,
    size: req.file.size,
    url: fileUrl,
  });
});

app.delete('/api/media/:id', (req, res) => {
  const { id } = req.params;
  const filePath = path.join(uploadDir, id);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File tidak ditemukan.' });
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Gagal menghapus file.' });
    }
    res.json({ message: 'Media berhasil dihapus.' });
  });
});

app.get('/', (req, res) => {
  res.send('Server Karmindo Backend Berjalan!');
});

// Jalankan Server
app.listen(PORT, () => {
  console.log(`Server Express berjalan di http://localhost:${PORT}`);
});