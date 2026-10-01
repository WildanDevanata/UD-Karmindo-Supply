import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [resProducts, resCategories] = await Promise.all([
          fetch('http://localhost:5000/api/products'),
          fetch('http://localhost:5000/api/categories'),
        ]);

        const prodData = await resProducts.json();
        const catData = await resCategories.json();

        setProducts(prodData);
        setCategories(catData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Hitung metric statistik secara dinamis
  const totalProducts = products.length;
  const totalCategories = categories.length;
  const publishedProducts = products.filter(p => p.status !== 'draft').length;
  const draftProducts = products.filter(p => p.status === 'draft').length;

  if (loading) {
    return <div className="p-6 text-gray-400 text-sm">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-[#111625] border border-gray-800/60 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-2xl">📦</span>
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{totalProducts}</div>
          <div className="text-xs text-gray-400">Total Products</div>
        </div>

        {/* Total Categories */}
        <div className="bg-[#111625] border border-gray-800/60 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-2xl">🏷️</span>
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{totalCategories}</div>
          <div className="text-xs text-gray-400">Total Categories</div>
        </div>

        {/* Published */}
        <div className="bg-[#111625] border border-gray-800/60 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-2xl">✅</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{publishedProducts}</div>
          <div className="text-xs text-gray-400">Published</div>
        </div>

        {/* Draft */}
        <div className="bg-[#111625] border border-gray-800/60 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-2xl">📝</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{draftProducts}</div>
          <div className="text-xs text-gray-400">Draft</div>
        </div>
      </div>

      {/* 2. Quick Action Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Add Product */}
        <Link 
          to="/admin/products/ProductForm"
          className="bg-[#111625] border border-gray-800/60 hover:border-gray-700 rounded-2xl p-4 flex items-center gap-4 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Add Product</h3>
            <p className="text-xs text-gray-400 mt-0.5">Create a new product listing</p>
          </div>
        </Link>

        {/* Manage Categories */}
        <Link 
          to="/admin/categories"
          className="bg-[#111625] border border-gray-800/60 hover:border-gray-700 rounded-2xl p-4 flex items-center gap-4 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Manage Categories</h3>
            <p className="text-xs text-gray-400 mt-0.5">Edit product categories</p>
          </div>
        </Link>

        {/* Media Library */}
        <Link 
          to="/admin/media"
          className="bg-[#111625] border border-gray-800/60 hover:border-gray-700 rounded-2xl p-4 flex items-center gap-4 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-sky-600 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Media Library</h3>
            <p className="text-xs text-gray-400 mt-0.5">Upload and manage images</p>
          </div>
        </Link>
      </div>

      {/* 3. Recent Products Table / Card Section */}
      <div className="bg-[#111625] border border-gray-800/60 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800/60">
          <h2 className="font-semibold text-white text-base">Recent Products</h2>
          <Link to="/admin/products" className="text-xs text-red-500 hover:text-red-400 font-medium transition-colors">
            View all &rarr;
          </Link>
        </div>

        <div className="divide-y divide-gray-800/40">
          {products.slice(0, 5).map((product) => (
            <div key={product.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-800/20 transition-colors">
              {/* Product Info */}
              <div className="flex items-center gap-4">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-11 h-11 rounded-xl object-cover bg-gray-800 shrink-0" 
                />
                <div>
                  <h4 className="text-sm font-semibold text-white">{product.name}</h4>
                  <p className="text-xs text-gray-400 capitalize mt-0.5">
                    {product.category.replace('-', ' ')}
                  </p>
                </div>
              </div>

              {/* Status Badge & Action */}
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                  {product.status || 'PUBLISHED'}
                </span>
                <Link 
                  to={`/admin/products/edit/${product.id}`}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}