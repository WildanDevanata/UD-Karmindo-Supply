import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // State untuk Edit Modal & Form Data
  const [editProduct, setEditProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    shortDescription: '',
    description: '',
    categoryId: '',
    status: 'published',
    imageUrl: '',
    price: ''
  });

  // Fetch data produk & kategori
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [resProducts, resCategories] = await Promise.all([
        fetch(`${API_BASE_URL}/products`),
        fetch(`${API_BASE_URL}/categories`),
      ]);

      if (!resProducts.ok || !resCategories.ok) {
        throw new Error('Gagal mengambil data dari server.');
      }

      const prodData = await resProducts.json();
      const catData = await resCategories.json();

      setProducts(Array.isArray(prodData) ? prodData : []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Koneksi ke server gagal. Pastikan backend di port 5000 sudah berjalan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Buka Modal Edit & isi form awal dengan data produk terpilih
  const handleOpenEdit = (p) => {
    setEditProduct(p);
    setEditFormData({
      name: p.name || '',
      shortDescription: p.shortDescription || '',
      description: p.description || '',
      categoryId: p.categoryId || p.category || '',
      status: p.status || 'published',
      imageUrl: p.imageUrl || p.image || '',
      price: p.price || ''
    });
  };

  // Batal / Tutup Modal Edit
  const handleCloseEdit = () => {
    setEditProduct(null);
  };

  // Submit Perubahan Edit via PUT / PATCH
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editProduct) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/products/${editProduct.id}`, {
        method: 'PUT', // Sesuaikan method backend (PUT / PATCH)
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        setEditProduct(null);
        fetchData();
      } else {
        alert('Gagal mengupdate produk');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Terjadi kesalahan saat mengupdate produk.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hapus Produk via API DELETE
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setConfirmDelete(null);
        fetchData();
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  // Toggle Status via API PATCH
  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error updating product status:', err);
    }
  };

  // Filter pencarian & status di sisi client
  const filtered = products.filter((p) => {
    const nameMatch = p.name ? p.name.toLowerCase().includes(search.toLowerCase()) : false;
    const descMatch = p.shortDescription || p.description
      ? (p.shortDescription || p.description).toLowerCase().includes(search.toLowerCase())
      : false;
    const matchSearch = !search || nameMatch || descMatch;
    const matchStatus = filterStatus === 'all' || (p.status || 'published').toLowerCase() === filterStatus.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{products.length} total products</p>
        <Link
          to="/admin/products/ProductForm"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 shadow-lg"
          style={{ background: '#FF2027' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-800/60 text-red-300 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-[#111827] rounded-2xl border border-gray-800/80 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full sm:w-96">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1a2333] border border-gray-700/60 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
          />
        </div>
        <div className="flex gap-1.5 w-full sm:w-auto">
          {['all', 'published', 'draft'].map((s) => {
            const active = filterStatus === s;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                  active
                    ? 'bg-[#FF2027] text-white shadow-md'
                    : 'bg-[#1a2333] text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#0f172a] rounded-2xl border border-gray-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-800/80 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">PRODUCT</th>
                <th className="py-3.5 px-5">CATEGORY</th>
                <th className="py-3.5 px-5">STATUS</th>
                <th className="py-3.5 px-5">UPDATED</th>
                <th className="py-3.5 px-5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    Loading products...
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const cat = categories.find((c) => c.id === p.categoryId || c.id === p.category);
                  const updatedAt = p.updatedAt ? new Date(p.updatedAt) : new Date();
                  const date = updatedAt.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={p.id} className="hover:bg-[#131d31] transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-800 border border-gray-700/60 shrink-0">
                            <img
                              src={p.imageUrl || p.image || 'https://via.placeholder.com/150'}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="max-w-xs">
                            <h4 className="font-semibold text-white text-xs leading-snug truncate">
                              {p.name}
                            </h4>
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">
                              {p.shortDescription || p.description || '-'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5 text-gray-300 font-medium">
                        {cat?.name || p.category || p.categoryId || '-'}
                      </td>

                      <td className="py-3.5 px-5">
                        <button
                          onClick={() => toggleStatus(p.id, p.status || 'published')}
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-opacity hover:opacity-80 ${
                            (p.status || 'published').toLowerCase() === 'published'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                              : 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
                          }`}
                        >
                          {p.status || 'PUBLISHED'}
                        </button>
                      </td>

                      <td className="py-3.5 px-5 text-gray-400 text-[11px]">
                        {date}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          {/* Tombol Edit memicu Modal */}
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="px-3 py-1.5 bg-[#1e293b] hover:bg-gray-700 text-gray-200 font-semibold rounded-lg text-xs transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmDelete(p.id)}
                            className="px-3 py-1.5 bg-red-950/50 hover:bg-red-900/80 text-red-400 font-semibold rounded-lg text-xs transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 text-sm">
                    {search || filterStatus !== 'all'
                      ? 'No products match your filters.'
                      : 'No products yet. '}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDIT PRODUCT */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-bold text-white text-base">Edit Product</h3>
              <button onClick={handleCloseEdit} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a2333] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Category</label>
                  <select
                    value={editFormData.categoryId}
                    onChange={(e) => setEditFormData({ ...editFormData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1a2333] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1a2333] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Image URL</label>
                <input
                  type="text"
                  value={editFormData.imageUrl}
                  onChange={(e) => setEditFormData({ ...editFormData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a2333] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={editFormData.shortDescription}
                  onChange={(e) => setEditFormData({ ...editFormData, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a2333] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl text-white font-semibold shadow-md"
                  style={{ background: '#FF2027' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl">
            <div className="text-3xl">🗑️</div>
            <h3 className="font-bold text-white text-sm">Delete Product?</h3>
            <p className="text-xs text-gray-400">
              This action cannot be undone. The product will be permanently removed.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-xs font-semibold text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-colors"
                style={{ background: '#FF2027' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}