import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';

const EMPTY = {
  categoryId: '',
  name: '',
  shortDescription: '',
  description: '',
  imageUrl: '',
  packaging: '',
  availableSizes: [],
  origin: 'Indonesia',
  certification: '',
  specs: '',
  status: 'draft',
  sortOrder: 0,
};

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const fileRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [sizesInput, setSizesInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  // Fetch Kategori & Detail Produk (jika Edit Mode)
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        // 1. Fetch Categories
        const catRes = await fetch(`${API_BASE_URL}/categories`);
        const catData = await catRes.json();
        const catList = Array.isArray(catData) ? catData : [];

        if (!isMounted) return;
        setCategories(catList);

        // 2. Fetch Product jika Edit Mode
        if (isEdit && id) {
          const prodRes = await fetch(`${API_BASE_URL}/products/${id}`);
          if (prodRes.ok) {
            const product = await prodRes.json();
            const { id: _id, slug: _slug, createdAt: _c, updatedAt: _u, ...rest } = product;

            if (isMounted) {
              setForm({
                ...EMPTY,
                ...rest,
                categoryId: rest.categoryId || (catList.length > 0 ? catList[0].id : ''),
              });
              setSizesInput(
                Array.isArray(product.availableSizes) ? product.availableSizes.join(', ') : ''
              );
              setImagePreview(product.imageUrl || '');
            }
          } else {
            if (isMounted) setError('Produk tidak ditemukan.');
          }
        } else {
          // Mode Create New Product
          if (isMounted && catList.length > 0) {
            setForm((f) => ({ ...f, categoryId: catList[0].id }));
          }
        }
      } catch (err) {
        console.error('Error loading product data:', err);
        if (isMounted) setError('Gagal memuat data dari server.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, isEdit]);

  const set = (key, value) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Handle Upload Gambar
  const handleImageUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Harap pilih file gambar yang valid.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const rec = await res.json();
        const uploadedUrl = rec.url || rec.path || '';
        set('imageUrl', uploadedUrl);
        setImagePreview(uploadedUrl);
      } else {
        const errRes = await res.json().catch(() => ({}));
        setError(errRes.message || 'Gagal mengunggah gambar.');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Terjadi kesalahan saat mengunggah gambar.');
    } finally {
      setUploading(false);
    }
  };

  // Submit Handler (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError('Nama produk wajib diisi.');
      return;
    }
    if (!form.categoryId) {
      setError('Kategori produk wajib dipilih.');
      return;
    }

    setError('');
    setSaving(true);

    try {
      // Parse ukuran dari string (dipisahkan koma) menjadi Array
      const sizes = sizesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        ...form,
        availableSizes: sizes,
        sortOrder: Number(form.sortOrder) || 0,
      };

      const url = isEdit ? `${API_BASE_URL}/products/${id}` : `${API_BASE_URL}/products`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        navigate('/admin/products');
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || 'Gagal menyimpan data produk.');
      }
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Terjadi kesalahan saat menyimpan produk.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full px-4 py-2.5 bg-[#1a2333] border border-gray-700/60 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors';
  const labelCls =
    'block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5';

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500 text-sm">
        Loading product form...
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-5">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate('/admin/products')}
        className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Products
      </button>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-950/80 border border-red-800/60 text-red-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-[#0f172a] rounded-2xl border border-gray-800/80 p-5 space-y-4 shadow-xl">
          <h2 className="font-bold text-base text-white">Basic Information</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Product Name *</label>
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Bimoli Special"
                required
              />
            </div>
            <div>
              <label className={labelCls}>Category *</label>
              <select
                className={inputCls}
                value={form.categoryId}
                onChange={(e) => set('categoryId', e.target.value)}
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select
                className={inputCls}
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Short Description</label>
              <textarea
                className={inputCls + ' resize-none'}
                rows={2}
                value={form.shortDescription}
                onChange={(e) => set('shortDescription', e.target.value)}
                placeholder="Brief product description (shown in catalog)"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Full Description</label>
              <textarea
                className={inputCls + ' resize-none'}
                rows={4}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Detailed product description"
              />
            </div>
          </div>
        </div>

        {/* Product Image */}
        <div className="bg-[#0f172a] rounded-2xl border border-gray-800/80 p-5 space-y-4 shadow-xl">
          <h2 className="font-bold text-base text-white">Product Image</h2>

          <div className="flex gap-4 items-start flex-wrap">
            {imagePreview && (
              <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-900 border border-gray-700/60 shrink-0">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-48">
              <label className={labelCls}>Image URL</label>
              <input
                className={inputCls + ' mb-3'}
                value={form.imageUrl}
                onChange={(e) => {
                  set('imageUrl', e.target.value);
                  setImagePreview(e.target.value);
                }}
                placeholder="https://... or upload below"
              />
              <input
                type="file"
                ref={fileRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1e293b] hover:bg-gray-700 text-gray-200 transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : '📁 Upload Image'}
              </button>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-[#0f172a] rounded-2xl border border-gray-800/80 p-5 space-y-4 shadow-xl">
          <h2 className="font-bold text-base text-white">Product Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Origin</label>
              <input
                className={inputCls}
                value={form.origin}
                onChange={(e) => set('origin', e.target.value)}
                placeholder="Indonesia"
              />
            </div>
            <div>
              <label className={labelCls}>Packaging</label>
              <input
                className={inputCls}
                value={form.packaging}
                onChange={(e) => set('packaging', e.target.value)}
                placeholder="e.g. Bottle / Jerry Can / Bulk"
              />
            </div>
            <div>
              <label className={labelCls}>Available Sizes</label>
              <input
                className={inputCls}
                value={sizesInput}
                onChange={(e) => setSizesInput(e.target.value)}
                placeholder="250ml, 500ml, 1L (comma separated)"
              />
            </div>
            <div>
              <label className={labelCls}>Certification</label>
              <input
                className={inputCls}
                value={form.certification}
                onChange={(e) => set('certification', e.target.value)}
                placeholder="BPOM, Halal MUI, etc."
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Specifications</label>
              <textarea
                className={inputCls + ' resize-none'}
                rows={2}
                value={form.specs}
                onChange={(e) => set('specs', e.target.value)}
                placeholder="Technical specs, quality parameters, etc."
              />
            </div>
            <div>
              <label className={labelCls}>Sort Order</label>
              <input
                type="number"
                className={inputCls}
                value={form.sortOrder}
                onChange={(e) => set('sortOrder', parseInt(e.target.value, 10) || 0)}
                min={0}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pb-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-xs font-semibold text-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-8 py-2.5 rounded-xl text-xs font-semibold text-white transition-colors hover:opacity-90 shadow-md disabled:opacity-50"
            style={{ background: '#FF2027' }}
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}