import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

const EMPTY = {
  name: '',
  description: '',
  imageUrl: '',
  color: '#FF2027',
  status: 'active',
  sortOrder: 0,
};

function CategoryModal({ cat, onSave, onClose }) {
  const isEdit = Boolean(cat);
  const [form, setForm] = useState(
    cat
      ? {
          name: cat.name || '',
          description: cat.description || '',
          imageUrl: cat.imageUrl || '',
          color: cat.color || '#FF2027',
          status: cat.status || 'active',
          sortOrder: cat.sortOrder || 0,
        }
      : EMPTY
  );
  const [imagePreview, setImagePreview] = useState(cat?.imageUrl || '');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleImageUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const rec = await res.json();
        set('imageUrl', rec.url);
        setImagePreview(rec.url);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const inputCls =
    'w-full px-3.5 py-2 bg-[#1a2333] border border-gray-700/60 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors';
  const labelCls =
    'block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
        <h3 className="font-bold text-base text-white">
          {isEdit ? 'Edit Category' : 'Add Category'}
        </h3>

        <div className="space-y-3.5">
          <div>
            <label className={labelCls}>Category Name *</label>
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Cooking Oil"
              required
            />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              className={inputCls + ' resize-none'}
              rows={2}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Short category description"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className={labelCls}>Category Image</label>
            {imagePreview && (
              <div className="w-full h-28 rounded-xl overflow-hidden bg-gray-800 border border-gray-700/60 mb-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex gap-2">
              <input
                className={inputCls}
                value={form.imageUrl}
                onChange={(e) => {
                  set('imageUrl', e.target.value);
                  setImagePreview(e.target.value);
                }}
                placeholder="https://... or upload"
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
                className="px-3 py-2 text-xs font-semibold bg-[#1e293b] hover:bg-gray-700 text-gray-200 rounded-xl transition-colors disabled:opacity-50 shrink-0"
              >
                {uploading ? '...' : 'Upload'}
              </button>
            </div>
          </div>

          {/* Color & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Accent Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => set('color', e.target.value)}
                  className="w-9 h-9 rounded-lg border border-gray-700/60 bg-[#1a2333] cursor-pointer shrink-0"
                />
                <input
                  className={inputCls}
                  value={form.color}
                  onChange={(e) => set('color', e.target.value)}
                  placeholder="#FF2027"
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select
                className={inputCls}
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Sort Order</label>
            <input
              type="number"
              className={inputCls}
              value={form.sortOrder}
              min={0}
              onChange={(e) =>
                set('sortOrder', parseInt(e.target.value) || 0)
              }
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-xs font-semibold text-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (form.name.trim()) onSave(form);
            }}
            className="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-colors hover:opacity-90 shadow-md"
            style={{ background: '#FF2027' }}
          >
            {isEdit ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, cat: null });
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Ambil data kategori dari Backend API
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/categories`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Tambah / Update Kategori via API
  const handleSave = async (data) => {
    try {
      const isEdit = Boolean(modal.cat);
      const url = isEdit
        ? `${API_BASE_URL}/categories/${modal.cat.id}`
        : `${API_BASE_URL}/categories`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setModal({ open: false, cat: null });
        fetchCategories();
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  // Hapus Kategori via API
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setConfirmDelete(null);
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // Toggle Status via PATCH API
  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Counter & Add Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{categories.length} total categories</p>
        <button
          onClick={() => setModal({ open: true, cat: null })}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 shadow-lg"
          style={{ background: '#FF2027' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Grid List Kategori */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500 text-sm">
            Loading categories...
          </div>
        ) : (
          [...categories]
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .map((cat) => (
              <div
                key={cat.id}
                className="bg-[#0f172a] rounded-2xl border border-gray-800/80 overflow-hidden shadow-xl flex flex-col justify-between transition-colors hover:border-gray-700/80"
              >
                <div>
                  <div className="relative h-32 bg-gray-800/50">
                    {cat.imageUrl && (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-black/20 to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                      <span className="font-bold text-sm text-white">{cat.name}</span>
                      <button
                        onClick={() => toggleStatus(cat.id, cat.status)}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border transition-opacity hover:opacity-80 ${
                          cat.status === 'active'
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/50'
                            : 'bg-gray-800/80 text-gray-400 border-gray-700/50'
                        }`}
                      >
                        {cat.status || 'active'}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 min-h-[32px]">
                      {cat.description || '-'}
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-gray-700/60"
                        style={{ background: cat.color || '#FF2027' }}
                      />
                      <span className="text-xs font-mono text-gray-400">{cat.color || '#FF2027'}</span>
                      <span className="ml-auto text-xs text-gray-500 font-mono">#{cat.sortOrder || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setModal({ open: true, cat })}
                      className="flex-1 py-1.5 text-xs font-semibold bg-[#1e293b] hover:bg-gray-700 text-gray-200 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(cat.id)}
                      className="py-1.5 px-3 text-xs font-semibold bg-red-950/50 hover:bg-red-900/80 text-red-400 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
        )}

        {!loading && categories.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 text-sm bg-[#0f172a] rounded-2xl border border-gray-800/80">
            No categories.{' '}
            <button
              onClick={() => setModal({ open: true, cat: null })}
              style={{ color: '#FF2027' }}
              className="underline font-semibold"
            >
              Add one
            </button>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {modal.open && (
        <CategoryModal
          cat={modal.cat}
          onSave={handleSave}
          onClose={() => setModal({ open: false, cat: null })}
        />
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl">
            <div className="text-3xl">🗑️</div>
            <h3 className="font-bold text-white text-sm">Delete Category?</h3>
            <p className="text-xs text-gray-400">
              Products in this category will lose their category assignment. This cannot be undone.
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