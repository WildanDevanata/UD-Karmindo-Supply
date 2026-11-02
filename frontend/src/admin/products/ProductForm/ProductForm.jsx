
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';

const EMPTY_VARIANT = {
  variantName: '',
  netWeight: '',
  quantity: '',
  price: '',
  priceUnit: 'carton',
  currency: 'USD',
};

const EMPTY = {
  categoryId: '',
  name: '',
  shortDescription: '',
  description: '',
  imageUrl: '',
  packaging: '',
  origin: 'Indonesia',
  certification: '',
  specs: '',
  status: 'draft',
  sortOrder: 0,
  variants: [{ ...EMPTY_VARIANT }],
};

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const fileRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const catRes = await fetch(`${API_BASE_URL}/categories`);
        if (!catRes.ok) throw new Error('Gagal memuat kategori.');

        const catData = await catRes.json();
        const catList = Array.isArray(catData) ? catData : [];

        if (!isMounted) return;
        setCategories(catList);

        if (isEdit && id) {
          const prodRes = await fetch(`${API_BASE_URL}/products/${id}`);

          if (!prodRes.ok) {
            throw new Error('Produk tidak ditemukan.');
          }

          const product = await prodRes.json();
          const {
            id: _id,
            slug: _slug,
            createdAt: _created,
            updatedAt: _updated,
            ...rest
          } = product;

          if (isMounted) {
            const variants = Array.isArray(product.variants) && product.variants.length
              ? product.variants.map((v) => ({
                  id: v.id,
                  variantName: v.variantName || '',
                  netWeight: v.netWeight || '',
                  quantity: v.quantity || '',
                  price: v.price ?? '',
                  priceUnit: v.priceUnit || 'carton',
                  currency: v.currency || 'USD',
                }))
              : [{ ...EMPTY_VARIANT }];

            setForm({
              ...EMPTY,
              ...rest,
              categoryId: rest.categoryId || (catList.length > 0 ? catList[0].id : ''),
              variants,
            });

            setImagePreview(product.imageUrl || '');
          }
        } else if (isMounted && catList.length > 0) {
          setForm((f) => ({ ...f, categoryId: catList[0].id }));
        }
      } catch (err) {
        console.error('Error loading product data:', err);
        if (isMounted) setError(err.message || 'Gagal memuat data dari server.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, isEdit]);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const updateVariant = (index, key, value) => {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((variant, i) =>
        i === index ? { ...variant, [key]: value } : variant
      ),
    }));
  };

  const addVariant = () => {
    setForm((f) => ({
      ...f,
      variants: [...f.variants, { ...EMPTY_VARIANT }],
    }));
  };

  const removeVariant = (index) => {
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, i) => i !== index),
    }));
  };

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

      const rec = await res.json();

      if (!res.ok) {
        throw new Error(rec.message || 'Gagal mengunggah gambar.');
      }

      if (!rec.url) {
        throw new Error('Server tidak mengembalikan URL gambar.');
      }

      setForm((f) => ({
        ...f,
        imageUrl: rec.url,
        image: rec.url,
      }));

      setImagePreview(rec.url);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Terjadi kesalahan saat mengunggah gambar.');
    } finally {
      setUploading(false);
    }
  };

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

    if (form.variants.length === 0) {
      setError('Tambahkan minimal satu varian produk.');
      return;
    }

    for (let i = 0; i < form.variants.length; i++) {
      const v = form.variants[i];

      if (!v.variantName.trim()) {
        setError(`Nama varian pada baris ${i + 1} wajib diisi.`);
        return;
      }

      if (v.price === '' || Number(v.price) < 0 || !Number.isFinite(Number(v.price))) {
        setError(`Harga pada varian ${v.variantName} harus diisi dengan angka yang valid.`);
        return;
      }
    }

    setError('');
    setSaving(true);

    try {
      const variants = form.variants.map((v) => ({
        ...v,
        price: Number(v.price),
      }));

      const availableSizes = variants
        .map((v) => v.variantName.trim())
        .filter(Boolean);

      const payload = {
        ...form,
        imageUrl: form.imageUrl,
        image: form.imageUrl,
        variants,
        availableSizes,
        sortOrder: Number(form.sortOrder) || 0,
      };

      const url = isEdit
        ? `${API_BASE_URL}/products/${id}`
        : `${API_BASE_URL}/products`;

      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(result.message || 'Gagal menyimpan data produk.');
      }

      navigate('/admin/products');
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.message || 'Terjadi kesalahan saat menyimpan produk.');
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
                  <option key={c.id} value={c.id}>{c.name}</option>
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
                  const value = e.target.value;
                  setForm((f) => ({ ...f, imageUrl: value, image: value }));
                  setImagePreview(value);
                }}
                placeholder="https://... or upload below"
              />

              <input
                type="file"
                ref={fileRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleImageUpload(e.target.files[0]);
                  }
                  e.target.value = '';
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
              <label className={labelCls}>Certification</label>
              <input
                className={inputCls}
                value={form.certification}
                onChange={(e) => set('certification', e.target.value)}
                placeholder="BPOM, Halal MUI, etc."
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
          </div>
        </div>

        {/* Product Variants */}
        <div className="bg-[#0f172a] rounded-2xl border border-gray-800/80 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-base text-white">Product Variants</h2>
              <p className="text-xs text-gray-500 mt-1">
                Set weight, quantity, and price separately for each variant.
              </p>
            </div>

            <button
              type="button"
              onClick={addVariant}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors shrink-0"
            >
              + Add Variant
            </button>
          </div>

          {form.variants.map((variant, index) => (
            <div
              key={index}
              className="border border-gray-700/70 rounded-xl p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  Variant {index + 1}
                </h3>

                {form.variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-xs font-semibold text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Variant Name *</label>
                  <input
                    className={inputCls}
                    value={variant.variantName}
                    onChange={(e) => updateVariant(index, 'variantName', e.target.value)}
                    placeholder="e.g. 500 ml / 1 L"
                    required
                  />
                </div>

                <div>
                  <label className={labelCls}>Net Weight</label>
                  <input
                    className={inputCls}
                    value={variant.netWeight}
                    onChange={(e) => updateVariant(index, 'netWeight', e.target.value)}
                    placeholder="e.g. 500 ml / 6 gram"
                  />
                </div>

                <div>
                  <label className={labelCls}>Quantity</label>
                  <input
                    className={inputCls}
                    value={variant.quantity}
                    onChange={(e) => updateVariant(index, 'quantity', e.target.value)}
                    placeholder="e.g. 12 pcs/carton"
                  />
                </div>

                <div>
                  <label className={labelCls}>Price *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputCls}
                    value={variant.price}
                    onChange={(e) => updateVariant(index, 'price', e.target.value)}
                    placeholder="e.g. 25.33"
                    required
                  />
                </div>

                <div>
                  <label className={labelCls}>Price Unit</label>
                  <input
                    className={inputCls}
                    value={variant.priceUnit}
                    onChange={(e) => updateVariant(index, 'priceUnit', e.target.value)}
                    placeholder="e.g. carton / pcs"
                  />
                </div>

                <div>
                  <label className={labelCls}>Currency</label>
                  <select
                    className={inputCls}
                    value={variant.currency}
                    onChange={(e) => updateVariant(index, 'currency', e.target.value)}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="IDR">IDR - Indonesian Rupiah</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="MYR">MYR - Malaysian Ringgit</option>
                    <option value="SGD">SGD - Singapore Dollar</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
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
