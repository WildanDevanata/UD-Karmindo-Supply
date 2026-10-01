import { useState, useRef, useCallback, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

function formatSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Media() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [copied, setCopied] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  // Fetch daftar media dari Backend API
  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/media`);
      const data = await res.json();
      setMedia(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Handle Upload File via API POST /upload
  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;

        const formData = new FormData();
        formData.append('file', file);

        await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          body: formData,
        });
      }
      fetchMedia();
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Delete Media via API DELETE
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/media/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setConfirmDelete(null);
        fetchMedia();
      }
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Counter & Upload Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{media.length} files in library</p>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 shadow-lg disabled:opacity-50"
          style={{ background: '#FF2027' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {uploading ? 'Uploading...' : 'Upload Images'}
        </button>
        <input
          type="file"
          ref={fileRef}
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed rounded-2xl py-10 text-center cursor-pointer transition-all bg-[#0f172a]"
        style={{
          borderColor: dragOver ? '#FF2027' : '#334155',
          background: dragOver ? 'rgba(255,32,39,0.05)' : '#0f172a',
        }}
      >
        <div className="text-3xl mb-2">🖼️</div>
        <p className="text-sm text-gray-300 font-medium">
          Drag & drop images here, or <span className="underline font-bold" style={{ color: '#FF2027' }}>browse</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP, GIF</p>
      </div>

      {/* Grid Media */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading media...</div>
      ) : media.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...media].reverse().map((m) => (
            <div key={m.id} className="group bg-[#0f172a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-xl transition-all hover:border-gray-700/80">
              <div className="relative h-32 bg-gray-900/50">
                <img
                  src={m.url}
                  alt={m.filename || 'Media'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] flex items-center justify-center gap-2">
                  <button
                    onClick={() => copyUrl(m.url, m.id)}
                    title="Copy URL"
                    className="w-9 h-9 rounded-xl bg-gray-800/90 hover:bg-gray-700 border border-gray-700/60 flex items-center justify-center text-white text-sm transition-colors shadow-lg"
                  >
                    {copied === m.id ? '✓' : '📋'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(m.id)}
                    title="Delete"
                    className="w-9 h-9 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800/50 flex items-center justify-center text-red-400 text-sm transition-colors shadow-lg"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="p-3 bg-[#0f172a]">
                <p className="text-xs font-semibold text-gray-300 truncate">{m.filename || 'Untitled'}</p>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">{formatSize(m.size)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && media.length === 0 && !uploading && (
        <div className="text-center py-12 text-gray-500 text-sm bg-[#0f172a] rounded-2xl border border-gray-800/80">
          No media uploaded yet.
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl">
            <div className="text-3xl">🗑️</div>
            <h3 className="font-bold text-white text-sm">Delete Image?</h3>
            <p className="text-xs text-gray-400">
              This image will be permanently deleted. Any products using it will show a broken image.
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