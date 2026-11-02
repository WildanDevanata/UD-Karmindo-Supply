
// server.js (Lengkap CRUD MySQL + Product Variants + Admin)

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

// =====================================================
// UPLOAD CONFIGURATION
// =====================================================

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + '-' + Math.round(Math.random() * 1e9);

    const ext = path.extname(file.originalname);

    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// =====================================================
// USER & AUTH API
// =====================================================

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email dan password wajib diisi.',
    });
  }

  try {
    const [users] = await db.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?)',
      [email]
    );

    const user = users[0];

    if (user && user.password === password) {
      const { password: _, ...userWithoutPassword } = user;

      return res.json({
        message: 'Login berhasil',
        user: userWithoutPassword,
        token: 'dummy-jwt-token-123456',
      });
    }

    return res.status(401).json({
      message: 'Email atau password salah.',
    });
  } catch (error) {
    console.error('Login Error:', error);

    res.status(500).json({
      message: 'Terjadi kesalahan pada server.',
    });
  }
});

// GET CURRENT USER
app.get('/api/auth/me', async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role FROM users LIMIT 1'
    );

    res.json(users[0] || {});
  } catch (error) {
    console.error('GET Auth User Error:', error);

    res.status(500).json({
      message: 'Gagal mengambil data user.',
    });
  }
});

// =====================================================
// CATEGORIES CRUD API
// =====================================================

// READ CATEGORIES
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM categories ORDER BY sort_order ASC'
    );

    const categories = rows.map((cat) => ({
      ...cat,
      sortOrder: cat.sort_order,
      image: cat.image_url,
      imageUrl: cat.image_url,
    }));

    res.json(categories);
  } catch (error) {
    console.error('GET Categories Error:', error);

    res.status(500).json({
      message: 'Gagal mengambil data kategori.',
    });
  }
});

// CREATE CATEGORY
app.post('/api/categories', async (req, res) => {
  const {
    name,
    description,
    image,
    imageUrl,
    color,
    status,
    sortOrder,
  } = req.body;

  if (!name) {
    return res.status(400).json({
      message: 'Nama kategori wajib diisi.',
    });
  }

  const id =
    req.body.id ||
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') +
      '-' +
      Date.now();

  const finalImage = imageUrl || image || '';

  try {
    await db.query(
      `INSERT INTO categories
       (id, name, description, image_url, color, status, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        description || '',
        finalImage,
        color || '#FF2027',
        status || 'active',
        Number(sortOrder) || 0,
      ]
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

    res.status(500).json({
      message: 'Gagal menambah kategori.',
    });
  }
});

// UPDATE CATEGORY
app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;

  const {
    name,
    description,
    image,
    imageUrl,
    color,
    status,
    sortOrder,
  } = req.body;

  const finalImage = imageUrl || image || '';

  try {
    const [result] = await db.query(
      `UPDATE categories
       SET name = ?, description = ?, image_url = ?,
           color = ?, status = ?, sort_order = ?
       WHERE id = ?`,
      [
        name,
        description || '',
        finalImage,
        color || '#FF2027',
        status || 'active',
        Number(sortOrder) || 0,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      const [existing] = await db.query(
        'SELECT id FROM categories WHERE id = ?',
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          message: 'Kategori tidak ditemukan.',
        });
      }
    }

    res.json({
      id,
      name,
      description,
      image: finalImage,
      imageUrl: finalImage,
      color,
      status,
      sortOrder,
    });
  } catch (error) {
    console.error('UPDATE Category Error:', error);

    res.status(500).json({
      message: 'Gagal mengupdate kategori.',
    });
  }
});

// DELETE CATEGORY
app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      'DELETE FROM categories WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Kategori tidak ditemukan.',
      });
    }

    res.json({
      message: 'Kategori berhasil dihapus.',
      id,
    });
  } catch (error) {
    console.error('DELETE Category Error:', error);

    res.status(500).json({
      message: 'Gagal menghapus kategori. Pastikan tidak ada produk yang terikat.',
    });
  }
});

// =====================================================
// PRODUCT VARIANTS HELPERS
// =====================================================

// FORMAT VARIANT FOR FRONTEND
const formatVariant = (variant) => ({
  id: variant.id,
  variantName: variant.variant_name,
  netWeight: variant.net_weight,
  quantity: variant.quantity,
  price: Number(variant.price),
  priceUnit: variant.price_unit,
  currency: variant.currency,
});

// NORMALIZE VARIANTS FROM FRONTEND
const normalizeVariants = (variants) => {
  if (!Array.isArray(variants) || variants.length === 0) {
    throw new Error('Produk harus memiliki minimal satu varian.');
  }

  return variants.map((variant, index) => {
    const variantName = String(
      variant.variantName || ''
    ).trim();

    const price = Number(variant.price);

    if (!variantName) {
      throw new Error(
        `Nama varian pada baris ${index + 1} wajib diisi.`
      );
    }

    if (
      variant.price === '' ||
      variant.price === null ||
      variant.price === undefined ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      throw new Error(
        `Harga varian ${variantName} tidak valid.`
      );
    }

    return {
      variantName,
      netWeight: String(variant.netWeight || '').trim(),
      quantity: String(variant.quantity || '').trim(),
      price,
      priceUnit: String(variant.priceUnit || 'carton').trim(),
      currency: String(variant.currency || 'USD').trim(),
    };
  });
};

// SAVE PRODUCT VARIANTS
const saveProductVariants = async (
  connection,
  productId,
  variants
) => {
  // Hapus varian lama ketika produk diedit
  await connection.query(
    'DELETE FROM product_variants WHERE product_id = ?',
    [productId]
  );

  // Masukkan varian terbaru
  for (const variant of variants) {
    await connection.query(
      `INSERT INTO product_variants
       (
         product_id,
         variant_name,
         net_weight,
         quantity,
         price,
         price_unit,
         currency
       )
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        productId,
        variant.variantName,
        variant.netWeight,
        variant.quantity,
        variant.price,
        variant.priceUnit,
        variant.currency,
      ]
    );
  }
};

// FORMAT PRODUCT FOR FRONTEND
const formatProduct = (product, variants = []) => {
  let parsedSizes = [];

  try {
    parsedSizes =
      typeof product.sizes === 'string'
        ? JSON.parse(product.sizes)
        : product.sizes || [];
  } catch {
    parsedSizes = [];
  }

  return {
    ...product,
    category: product.category_id,
    categoryId: product.category_id,
    image: product.image_url,
    imageUrl: product.image_url,
    shortDescription: product.short_description,
    sizes: parsedSizes,
    availableSizes: variants.length
      ? variants.map((variant) => variant.variantName)
      : parsedSizes,
    variants,
  };
};

// =====================================================
// PRODUCTS CRUD API
// =====================================================

// READ ALL PRODUCTS
app.get('/api/products', async (req, res) => {
  const { category } = req.query;

  try {
    let sql = 'SELECT * FROM products';
    const params = [];

    if (category) {
      sql += ' WHERE category_id = ?';
      params.push(category);
    }

    sql += ' ORDER BY sort_order ASC';

    const [rows] = await db.query(sql, params);

    if (rows.length === 0) {
      return res.json([]);
    }

    const productIds = rows.map((product) => product.id);
    const placeholders = productIds.map(() => '?').join(',');

    const [variantRows] = await db.query(
      `SELECT * FROM product_variants
       WHERE product_id IN (${placeholders})
       ORDER BY id ASC`,
      productIds
    );

    const variantsByProduct = {};

    for (const variant of variantRows) {
      if (!variantsByProduct[variant.product_id]) {
        variantsByProduct[variant.product_id] = [];
      }

      variantsByProduct[variant.product_id].push(
        formatVariant(variant)
      );
    }

    const products = rows.map((product) =>
      formatProduct(
        product,
        variantsByProduct[product.id] || []
      )
    );

    res.json(products);
  } catch (error) {
    console.error('GET Products Error:', error);

    res.status(500).json({
      message: 'Gagal mengambil data produk.',
    });
  }
});

// READ SINGLE PRODUCT
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Produk tidak ditemukan.',
      });
    }

    const [variantRows] = await db.query(
      `SELECT * FROM product_variants
       WHERE product_id = ?
       ORDER BY id ASC`,
      [id]
    );

    const variants = variantRows.map(formatVariant);

    res.json(formatProduct(rows[0], variants));
  } catch (error) {
    console.error('GET Single Product Error:', error);

    res.status(500).json({
      message: 'Gagal mengambil detail produk.',
    });
  }
});

// CREATE PRODUCT
app.post('/api/products', async (req, res) => {
  const body = req.body;

  const categoryId = body.category || body.categoryId;
  const finalImage = body.imageUrl || body.image || '';

  if (!body.name || !categoryId) {
    return res.status(400).json({
      message: 'Nama dan kategori produk wajib diisi.',
    });
  }

  let variants;

  try {
    variants = normalizeVariants(body.variants);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  const id =
    body.id ||
    body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') +
      '-' +
      Date.now();

  const sizes = JSON.stringify(
    variants.map((variant) => variant.variantName)
  );

  let connection;

  try {
    connection = await db.getConnection();

    await connection.beginTransaction();

    // Simpan produk utama
    await connection.query(
      `INSERT INTO products
       (
         id,
         name,
         category_id,
         image_url,
         short_description,
         description,
         packaging,
         sizes,
         origin,
         certification,
         specs,
         status,
         sort_order
       )
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

    // Simpan semua varian produk
    await saveProductVariants(
      connection,
      id,
      variants
    );

    await connection.commit();

    res.status(201).json({
      id,
      ...body,
      category: categoryId,
      categoryId,
      image: finalImage,
      imageUrl: finalImage,
      sizes: JSON.parse(sizes),
      availableSizes: variants.map((v) => v.variantName),
      variants,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error('CREATE Product Error:', error);

    res.status(500).json({
      message: 'Gagal menambah produk.',
      error: error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// UPDATE PRODUCT
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  const categoryId = body.category || body.categoryId;
  const finalImage = body.imageUrl || body.image || '';

  if (!body.name || !categoryId) {
    return res.status(400).json({
      message: 'Nama dan kategori produk wajib diisi.',
    });
  }

  let variants;

  try {
    variants = normalizeVariants(body.variants);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  const sizes = JSON.stringify(
    variants.map((variant) => variant.variantName)
  );

  let connection;

  try {
    connection = await db.getConnection();

    await connection.beginTransaction();

    // Cek keberadaan produk terlebih dahulu
    const [existingProduct] = await connection.query(
      'SELECT id FROM products WHERE id = ?',
      [id]
    );

    if (existingProduct.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        message: `Produk dengan ID '${id}' tidak ditemukan.`,
      });
    }

    // Update data produk
    await connection.query(
      `UPDATE products
       SET
         name = ?,
         category_id = ?,
         image_url = ?,
         short_description = ?,
         description = ?,
         packaging = ?,
         sizes = ?,
         origin = ?,
         certification = ?,
         specs = ?,
         status = ?,
         sort_order = ?
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

    // Update seluruh varian produk
    await saveProductVariants(
      connection,
      id,
      variants
    );

    await connection.commit();

    res.json({
      id,
      ...body,
      category: categoryId,
      categoryId,
      image: finalImage,
      imageUrl: finalImage,
      sizes: JSON.parse(sizes),
      availableSizes: variants.map((v) => v.variantName),
      variants,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error('UPDATE Product Error:', error);

    res.status(500).json({
      message: 'Gagal memperbarui produk.',
      error: error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// DELETE PRODUCT
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      'DELETE FROM products WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Produk tidak ditemukan.',
      });
    }

    res.json({
      message: 'Produk berhasil dihapus.',
      id,
    });
  } catch (error) {
    console.error('DELETE Product Error:', error);

    res.status(500).json({
      message: 'Gagal menghapus produk.',
    });
  }
});

// =====================================================
// FILE UPLOAD API
// =====================================================

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: 'Tidak ada file yang diunggah.',
    });
  }

  const fileUrl =
    `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.json({
    id: req.file.filename,
    filename: req.file.filename,
    url: fileUrl,
  });
});

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {
  console.log(
    `Server Express (MySQL CRUD Active) berjalan di http://localhost:${PORT}`
  );
});
