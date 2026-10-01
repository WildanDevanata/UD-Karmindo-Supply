const BASE_URL = 'http://localhost:5000/api';

export async function fetchCategories() {
  const res = await fetch(`${BASE_URL}/categories`);
  if (!res.ok) throw new Error('Gagal mengambil data kategori');
  return res.json();
}

export async function fetchProducts(category = '') {
  const url = category ? `${BASE_URL}/products?category=${category}` : `${BASE_URL}/products`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Gagal mengambil data produk');
  return res.json();
}

export async function fetchProductById(id) {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  if (!res.ok) throw new Error('Produk tidak ditemukan');
  return res.json();
}