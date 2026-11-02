// server.js (Lengkap CRUD MySQL + Support Admin)
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from './database.js';

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
  destination: (req, file, cb) => cb(null, uploadDir),
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
app.use('/uploads', express.static(uploadDir));

// ================= USER & AUTH API =================

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email dan password wajib diisi.' });

  try {
    const [users] = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
    const user = users[0];

    if (user && user.password === password) {
      const { password: _, ...userWithoutPassword } = user;
      return res.json({
        message: 'Login berhasil',
        user: userWithoutPassword,
        token: 'dummy-jwt-token-123456',
      });
    }
    return res.status(401).json({ message: 'Email atau password salah.' });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, role FROM users LIMIT 1');
    res.json(users[0] || {});
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data user.' });
  }
});

// ================= CATEGORIES CRUD API =================

// READ Categories
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY sort_order ASC');
    const categories = rows.map((cat) => ({
      ...cat,
      sortOrder: cat.sort_order,
      image: cat.image_url,
      imageUrl: cat.image_url,
    }));
    res.json(categories);
  } catch (error) {
    console.error('GET Categories Error:', error);
    res.status(500).json({ message: 'Gagal mengambil data kategori.' });
  }
});

// CREATE Category
app.post('/api/categories', async (req, res) => {
  const { name, description, image, imageUrl, color, status, sortOrder } = req.body;
  if (!name) return res.status(400).json({ message: 'Nama kategori wajib diisi.' });

  const id = req.body.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();
  const finalImage = imageUrl || image || '';

  try {
    await db.query(
      `INSERT INTO categories (id, name, description, image_url, color, status, sort_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name, description || '', finalImage, color || '#FF2027', status || 'active', Number(sortOrder) || 0]
    );

    res.status(201).json({
      id,
      name,
      description: description || '',
      image: finalImage,
      imageUrl: finalImage,
      color: color || '#FF2027',
      status: status || 'active',
      sortOrder: Number(sortOrder) || 0,
    });
  } catch (error) {
    console.error('CREATE Category Error:', error);
    res.status(500).json({ message: 'Gagal menambah kategori.' });
  }
});

// UPDATE Category
app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, image, imageUrl, color, status, sortOrder } = req.body;
  const finalImage = imageUrl || image || '';

  try {
    const [result] = await db.query(
      `UPDATE categories 
       SET name = ?, description = ?, image_url = ?, color = ?, status = ?, sort_order = ?
       WHERE id = ?`,
      [name, description || '', finalImage, color || '#FF2027', status || 'active', Number(sortOrder) || 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
    }

    res.json({ id, name, description, image: finalImage, imageUrl: finalImage, color, status, sortOrder });
  } catch (error) {
    console.error('UPDATE Category Error:', error);
    res.status(500).json({ message: 'Gagal mengupdate kategori.' });
  }
});

// DELETE Category
app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
    }
    res.json({ message: 'Kategori berhasil dihapus.', id });
  } catch (error) {
    console.error('DELETE Category Error:', error);
    res.status(500).json({ message: 'Gagal menghapus kategori. Pastikan tidak ada produk yang terikat.' });
  }
});

// ================= PRODUCTS CRUD API =================

// READ Products
app.get('/api/products', async (req, res) => {
  const { category } = req.query;
  try {
    let sql = 'SELECT * FROM products';
    let params = [];

    if (category) {
      sql += ' WHERE category_id = ?';
      params.push(category);
    }

    sql += ' ORDER BY sort_order ASC';

    const [rows] = await db.query(sql, params);

    const products = rows.map((p) => {
      let parsedSizes = [];
      try {
        parsedSizes = typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes || [];
      } catch (e) {
        parsedSizes = [];
      }

      return {
        ...p,
        category: p.category_id,
        categoryId: p.category_id,
        image: p.image_url,
        imageUrl: p.image_url,
        shortDescription: p.short_description,
        sizes: parsedSizes,
        availableSizes: parsedSizes,
      };
    });

    res.json(products);
  } catch (error) {
    console.error('GET Products Error:', error);
    res.status(500).json({ message: 'Gagal mengambil data produk.' });
  }
});
// GET Single Product (Opsional tapi penting untuk cek ID)
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }
    const p = rows[0];
    let parsedSizes = [];
    try {
      parsedSizes = typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes || [];
    } catch (e) {
      parsedSizes = [];
    }
    res.json({
      ...p,
      category: p.category_id,
      categoryId: p.category_id,
      image: p.image_url,
      imageUrl: p.image_url,
      shortDescription: p.short_description,
      sizes: parsedSizes,
      availableSizes: parsedSizes,
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil detail produk.' });
  }
});

// UPDATE Product
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  const categoryId = body.category || body.categoryId;
  const finalImage =
  body.imageUrl ||
  body.image_url ||
  body.image ||
  '';
  const sizes = JSON.stringify(Array.isArray(body.sizes) ? body.sizes : (body.availableSizes || []));

  try {
    const [result] = await db.query(
      `UPDATE products 
       SET name = ?, category_id = ?, image_url = ?, short_description = ?, description = ?, 
           packaging = ?, sizes = ?, origin = ?, certification = ?, specs = ?, status = ?, sort_order = ?
       WHERE id = ?`,
      [
        body.name,
        categoryId,
        finalImage,
        body.shortDescription || '',
        body.description || '',
        body.packaging || '',
        sizes,
        body.origin || '',
        body.certification || '',
        body.specs || '',
        body.status || 'published',
        Number(body.sortOrder) || 0,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: `Produk dengan ID '${id}' tidak ditemukan di database.` });
    }

    res.json({
      id,
      ...body,
      category: categoryId,
      categoryId,
      image: finalImage,
      imageUrl: finalImage,
      sizes: JSON.parse(sizes),
      availableSizes: JSON.parse(sizes),
    });
  } catch (error) {
    console.error('UPDATE Product Error:', error);
    res.status(500).json({ message: 'Gagal memperbarui produk.' });
  }
});
// CREATE Product
app.post('/api/products', async (req, res) => {
  const body = req.body;
  const categoryId = body.category || body.categoryId;
  const finalImage = body.image || body.imageUrl || '';
  const sizes = JSON.stringify(Array.isArray(body.sizes) ? body.sizes : (body.availableSizes || []));

  if (!body.name || !categoryId) {
    return res.status(400).json({ message: 'Nama dan kategori produk wajib diisi.' });
  }

  const id = body.id || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();

  try {
    await db.query(
      `INSERT INTO products 
       (id, name, category_id, image_url, short_description, description, packaging, sizes, origin, certification, specs, status, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.name,
        categoryId,
        finalImage,
        body.shortDescription || '',
        body.description || '',
        body.packaging || '',
        sizes,
        body.origin || '',
        body.certification || '',
        body.specs || '',
        body.status || 'published',
        Number(body.sortOrder) || 0,
      ]
    );

    res.status(201).json({
      id,
      ...body,
      category: categoryId,
      categoryId,
      image: finalImage,
      imageUrl: finalImage,
      sizes: JSON.parse(sizes),
      availableSizes: JSON.parse(sizes),
    });
  } catch (error) {
    console.error('CREATE Product Error:', error);
    res.status(500).json({ message: 'Gagal menambah produk.' });
  }
});

// UPDATE Product
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  const categoryId = body.category || body.categoryId;
  const finalImage = body.image || body.imageUrl || '';
  const sizes = JSON.stringify(Array.isArray(body.sizes) ? body.sizes : (body.availableSizes || []));

  try {
    const [result] = await db.query(
      `UPDATE products 
       SET name = ?, category_id = ?, image_url = ?, short_description = ?, description = ?, 
           packaging = ?, sizes = ?, origin = ?, certification = ?, specs = ?, status = ?, sort_order = ?
       WHERE id = ?`,
      [
        body.name,
        categoryId,
        finalImage,
        body.shortDescription || '',
        body.description || '',
        body.packaging || '',
        sizes,
        body.origin || '',
        body.certification || '',
        body.specs || '',
        body.status || 'published',
        Number(body.sortOrder) || 0,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }

    res.json({
      id,
      ...body,
      category: categoryId,
      categoryId,
      image: finalImage,
      imageUrl: finalImage,
      sizes: JSON.parse(sizes),
      availableSizes: JSON.parse(sizes),
    });
  } catch (error) {
    console.error('UPDATE Product Error:', error);
    res.status(500).json({ message: 'Gagal memperbarui produk.' });
  }
});

// DELETE Product
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }
    res.json({ message: 'Produk berhasil dihapus.', id });
  } catch (error) {
    console.error('DELETE Product Error:', error);
    res.status(500).json({ message: 'Gagal menghapus produk.' });
  }
});

// ================= FILE UPLOAD API =================

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Tidak ada file yang diunggah.' });
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ id: req.file.filename, filename: req.file.filename, url: fileUrl });
});

app.listen(PORT, () => {
  console.log(`Server Express (MySQL CRUD Active) berjalan di http://localhost:${PORT}`);
});