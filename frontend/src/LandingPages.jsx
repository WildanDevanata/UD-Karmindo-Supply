import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// ─── Reveal hook ──────────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ onNav }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navItems = [
    { label: 'HOME', id: 'home' },
    { label: 'ABOUT US', id: 'about' },
    { label: 'PRODUCTS', id: 'products' },
  ];
  const productItems = [
    { label: 'COOKING OIL', id: 'cooking-oil' },
    { label: 'COFFEE', id: 'coffee' },
    { label: 'POULTRY MEAT', id: 'poultry-meat' },
    { label: 'FROZEN FOOD', id: 'frozen-food' },
    { label: 'VANILLA', id: 'vanilla' },
    { label: 'PALM SUGAR', id: 'palm-sugar' },
  ];

  const handleNav = (id) => {
    onNav(id);
    setMobileOpen(false);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{ background: '#FF2027', boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.25)' : 'none' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => handleNav('home')} className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md p-1">
              <img src="/logo-ref.png" alt="UKS Logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-white text-left">
              <div className="font-display font-800 text-base leading-tight tracking-tight">UD. Karmindo Supply</div>
              <div className="text-[10px] text-red-100 leading-tight tracking-wide">Global Food Supplier</div>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => (
              <button key={item.id} onClick={() => handleNav(item.id)}
                className="text-white/90 hover:text-white text-xs font-semibold tracking-wider px-3 py-2 rounded hover:bg-white/10 transition-colors">
                {item.label}
              </button>
            ))}
            <div className="w-px h-4 bg-white/30 mx-1" />
            {productItems.map(item => (
              <button key={item.id} onClick={() => handleNav(item.id)}
                className="text-white/90 hover:text-white text-[11px] font-semibold tracking-wide px-2 py-2 rounded hover:bg-white/10 transition-colors">
                {item.label}
              </button>
            ))}
            <div className="w-px h-4 bg-white/30 mx-1" />
            <button onClick={() => handleNav('contact')}
              className="text-white/90 hover:text-white text-xs font-semibold tracking-wider px-3 py-2 rounded hover:bg-white/10 transition-colors">
              CONTACT
            </button>
          </nav>

          <button className="lg:hidden text-white p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            <div className="flex flex-col gap-1.5">
              <span className={`block w-6 h-0.5 bg-white transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-white transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-white transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-[#CC1A20] border-t border-red-700 py-4 px-4">
          {[...navItems, ...productItems, { label: 'CONTACT', id: 'contact' }].map(item => (
            <button key={item.id} onClick={() => handleNav(item.id)}
              className="block w-full text-left text-white text-sm font-semibold tracking-wider py-2.5 px-3 rounded hover:bg-white/10 transition-colors">
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onExplore, onContact }) {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a0002 0%, #3d0005 40%, #6b0008 100%)' }}>
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 grid lg:grid-cols-2 gap-12 items-center w-full">
        <div className="text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-widest text-green-300">TRUSTED FOOD & BEVERAGE SUPPLIER</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] mb-6 tracking-tight">
            Your Trusted Supplier<br />
            <span style={{ color: '#FF6B6F' }}>for Quality Food</span><br />
            & Beverage Products
          </h1>
          <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-lg">
            Supplying quality Indonesian food and beverage products to local and global markets.
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={onExplore}
              className="px-8 py-3.5 font-display font-700 text-sm tracking-widest rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: '#FF2027', color: 'white', boxShadow: '0 4px 20px rgba(255,32,39,0.4)' }}>
              EXPLORE PRODUCTS
            </button>
            <button onClick={onContact}
              className="px-8 py-3.5 font-display font-700 text-sm tracking-widest rounded-lg border border-white/30 text-white hover:bg-white/10 transition-all duration-200">
              CONTACT US
            </button>
          </div>
          <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
            {[['6+', 'Product Categories'], ['100+', 'Products'], ['Global', 'Distribution']].map(([val, label]) => (
              <div key={label}>
                <div className="font-display font-black text-2xl text-white">{val}</div>
                <div className="text-xs text-white/50 tracking-wide mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="relative w-full aspect-square max-w-lg mx-auto">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
              <img src="https://images.unsplash.com/photo-1552592074-ea7a91b851b3?w=400&h=400&fit=crop&auto=format" alt="Cooking oil" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-20 left-0 w-52 h-52 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
              <img src="https://images.unsplash.com/photo-1758221052634-33f352d1318b?w=400&h=400&fit=crop&auto=format" alt="Coffee" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-10 right-10 w-56 h-44 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
              <img src="https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&h=400&fit=crop&auto=format" alt="Poultry" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 left-4 w-44 h-36 rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl">
              <img src="https://images.unsplash.com/photo-1592788174877-3f99727fd23d?w=400&h=400&fit=crop&auto=format" alt="Vanilla" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FF2027] rounded-xl px-4 py-3 text-center shadow-xl z-10">
              <div className="font-display font-black text-2xl text-white">UKS</div>
              <div className="text-[10px] text-red-100 tracking-widest">SUPPLIER</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80L1440 80L1440 40C1200 80 960 0 720 40C480 80 240 0 0 40L0 80Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────
function About() {
  const ref = useReveal();
  const highlights = [
    { icon: '✓', label: 'Quality Products', desc: 'Rigorous quality checks on all products' },
    { icon: '🇮🇩', label: 'Indonesian Products', desc: "Sourced from Indonesia's rich natural resources" },
    { icon: '🌏', label: 'Global Supply', desc: 'Supplying to local and international markets' },
    { icon: '🤝', label: 'Trusted Distribution', desc: 'Professional trading & distribution service' },
  ];
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div ref={ref} className="reveal grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4 text-white" style={{ background: '#FF2027' }}>About Us</div>
            <h2 className="font-display font-black text-4xl lg:text-5xl text-gray-900 leading-tight mb-6">About UD.<br />Karmindo Supply</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>UD. Karmindo Supply is a trusted trading and distribution company specializing in the provision of high-quality food and beverage ingredients.</p>
              <p>The goods we distribute to the global market are products derived from Indonesia's natural resources. Indonesia's natural environment, well known for its fertile soil, yields a wide variety of products that are subsequently processed industrially into high-value goods.</p>
              <p>We provide a wide range of products for sachet coffee, cooking oil, poultry meat, frozen food, vanilla, palm sugar, and other ingredients that have passed quality tests and hold the necessary certifications to meet global standards.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {highlights.map(h => (
                <div key={h.label} className="flex gap-3 p-4 rounded-xl bg-gray-50 hover:bg-red-50 transition-colors">
                  <span className="text-xl shrink-0">{h.icon}</span>
                  <div>
                    <div className="font-display font-700 text-sm text-gray-900">{h.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{h.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden h-48 bg-gray-100">
                  <img src="https://images.unsplash.com/photo-1643426879831-b20d0d9e0110?w=400&h=300&fit=crop&auto=format" alt="Coffee products" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="rounded-2xl overflow-hidden h-36 bg-gray-100">
                  <img src="https://images.unsplash.com/photo-1592788174877-3f99727fd23d?w=400&h=280&fit=crop&auto=format" alt="Vanilla" className="w-full h-full object-cover" loading="lazy" />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-2xl overflow-hidden h-36 bg-gray-100">
                  <img src="https://images.unsplash.com/photo-1552592074-ea7a91b851b3?w=400&h=280&fit=crop&auto=format" alt="Cooking oil" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="rounded-2xl overflow-hidden h-48 bg-gray-100">
                  <img src="https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&h=300&fit=crop&auto=format" alt="Poultry" className="w-full h-full object-cover" loading="lazy" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-xl border border-gray-100">
              <div className="font-display font-black text-3xl" style={{ color: '#FF2027' }}>15+</div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">Years of Experience</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Why Choose Us ────────────────────────────────────────────────────────────
function WhyChooseUs() {
  const ref = useReveal();
  const features = [
    { icon: '🏆', title: 'Quality Products', desc: 'Carefully selected products that meet quality requirements.' },
    { icon: '🌱', title: 'Indonesian Sourcing', desc: "Products sourced from Indonesia's rich natural resources." },
    { icon: '✈️', title: 'Global Supply', desc: 'Supporting supply requirements for local and international markets.' },
    { icon: '⚡', title: 'Reliable Service', desc: 'Professional trading and distribution service for business customers.' },
  ];
  return (
    <section className="py-24" style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #fff 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div ref={ref} className="reveal text-center mb-14">
          <div className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4 text-white" style={{ background: '#FF2027' }}>Why Choose Us</div>
          <h2 className="font-display font-black text-4xl lg:text-5xl text-gray-900">Why Choose UD. Karmindo Supply?</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-50">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-display font-800 text-lg text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────
function CategoryCard({ cat, onClick }) {
  return (
    <button onClick={onClick} className="category-card text-left group w-full rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <span className="text-white font-display font-800 text-lg">{cat.name}</span>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-500 leading-relaxed mb-3">{cat.description}</p>
        <div className="flex items-center gap-2 text-sm font-bold tracking-wider" style={{ color: '#FF2027' }}>
          VIEW PRODUCTS
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, allCategories, onDetail, onInquire }) {
  const catLabel = allCategories.find(c => c.id === product.category)?.name || product.category;
  return (
    <div className="product-card bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
      <div className="relative h-48 overflow-hidden bg-gray-50">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute top-3 left-3">
          <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ background: '#FF2027' }}>{catLabel}</span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display font-700 text-base text-gray-900 mb-1 leading-snug">{product.name}</h3>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1 mb-3">{product.description}</p>
        {product.packaging && (
          <div className="text-xs text-gray-400 mb-3">
            <span className="font-semibold text-gray-600">Packaging:</span> {product.packaging}
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={onDetail}
            className="flex-1 py-2 text-xs font-bold tracking-wider rounded-lg border-2 transition-all hover:text-white"
            style={{ borderColor: '#FF2027', color: '#FF2027' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FF2027'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#FF2027'; }}>
            VIEW DETAIL
          </button>
          <button onClick={onInquire}
            className="px-4 py-2 text-xs font-bold tracking-wider rounded-lg text-white transition-all hover:opacity-80"
            style={{ background: '#16a34a' }}>
            INQUIRE
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Product Catalog ──────────────────────────────────────────────────────────
function ProductCatalog({
  initialCategory,
  categories,
  products,
  loading,
  error,
  onProductDetail,
}) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [search, setSearch] = useState('');
  const ref = useReveal();

  useEffect(() => { if (initialCategory) setActiveCategory(initialCategory); }, [initialCategory]);

  const inquire = useCallback((productName) => {
    const msg = `Hello UD. Karmindo Supply, I am interested in ${productName}. I would like to get more information about this product.`;
    window.open(`https://wa.me/6287858327220?text=${encodeURIComponent(msg)}`, '_blank');
  }, []);

  const filtered = products.filter(p => {
    const matchCat = !activeCategory || p.category === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <section id="products" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-semibold flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Memuat produk dari server...</span>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-red-50 border border-red-200 rounded-2xl p-6 text-red-600 max-w-md mx-auto">
            <p className="font-semibold">{error}</p>
            <p className="text-xs text-red-400 mt-2">Pastikan backend Express berjalan di <code>http://localhost:5000</code></p>
          </div>
        ) : !activeCategory ? (
          <div ref={ref} className="reveal">
            <div className="text-center mb-12">
              <div className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4 text-white" style={{ background: '#FF2027' }}>Our Products</div>
              <h2 className="font-display font-black text-4xl lg:text-5xl text-gray-900 mb-4">Our Products</h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">Explore our selection of quality food and beverage products.</p>
            </div>
            {categories.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Tidak ada kategori tersedia.</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(cat => (
                  <CategoryCard key={cat.id} cat={cat} onClick={() => setActiveCategory(cat.id)} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <button onClick={() => { setActiveCategory(null); setSearch(''); }}
                  className="flex items-center gap-2 text-sm font-semibold mb-2 hover:opacity-70 transition-opacity" style={{ color: '#FF2027' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  All Categories
                </button>
                <h2 className="font-display font-black text-3xl text-gray-900">
                  {categories.find(c => c.id === activeCategory)?.name || 'Products'}
                </h2>
              </div>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 w-full sm:w-64" />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  className="px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all"
                  style={{ background: activeCategory === cat.id ? '#FF2027' : 'white', color: activeCategory === cat.id ? 'white' : '#374151', border: '2px solid', borderColor: activeCategory === cat.id ? '#FF2027' : '#e5e7eb' }}>
                  {cat.name}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">Tidak ada produk ditemukan.</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filtered.map(p => (
                  <ProductCard key={p.id} product={p} allCategories={categories} onDetail={() => onProductDetail(p)} onInquire={() => inquire(p.name)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Product Detail Modal ─────────────────────────────────────────────────────
function ProductDetailModal({ product, allCategories, onClose }) {
  const catLabel = allCategories.find(c => c.id === product.category)?.name || product.category;
  const inquire = () => {
    const msg = `Hello UD. Karmindo Supply, I am interested in ${product.name}. I would like to get more information about this product.`;
    window.open(`https://wa.me/6287858327220?text=${encodeURIComponent(msg)}`, '_blank');
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="relative h-64 bg-gray-100 rounded-t-3xl overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-600 hover:bg-white transition-colors shadow-md">✕</button>
          <div className="absolute top-4 left-4">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white" style={{ background: '#FF2027' }}>{catLabel}</span>
          </div>
        </div>
        <div className="p-6">
          <h2 className="font-display font-black text-2xl text-gray-900 mb-2">{product.name}</h2>
          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {[
              ['Origin', product.origin],
              product.packaging ? ['Packaging', product.packaging] : null,
              product.certification ? ['Certification', product.certification] : null,
              product.specs ? ['Specifications', product.specs] : null,
            ].filter(Boolean).map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</div>
                <div className="text-sm text-gray-700 font-medium">{value}</div>
              </div>
            ))}
          </div>
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Available Sizes</div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(s => <span key={s} className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-700">{s}</span>)}
              </div>
            </div>
          )}
          <button onClick={inquire}
            className="w-full py-4 rounded-xl font-display font-800 text-sm tracking-widest text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
            style={{ background: 'linear-gradient(135deg, #FF2027, #CC1A20)' }}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M11.999 0C5.373 0 0 5.373 0 12c0 2.117.553 4.103 1.522 5.836L.053 23.5l5.8-1.521A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 11.999 0zm.001 21.818a9.8 9.8 0 01-5.002-1.369l-.359-.213-3.44.902.918-3.351-.234-.374A9.806 9.806 0 012.182 12c0-5.418 4.4-9.818 9.818-9.818 5.418 0 9.818 4.4 9.818 9.818 0 5.418-4.4 9.818-9.818 9.818z"/>
            </svg>
            INQUIRE ABOUT THIS PRODUCT
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">Price available upon request — varies by quantity & order terms</p>
        </div>
      </div>
    </div>
  );
}

// ─── Showcase Banner ──────────────────────────────────────────────────────────
function ShowcaseBanner({ onExplore }) {
  const ref = useReveal();
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1622572771591-6ca7813cc39d?w=1600&h=800&fit=crop&auto=format" alt="Indonesian food market" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,32,39,0.92) 0%, rgba(100,0,0,0.9) 100%)' }} />
      </div>
      <div ref={ref} className="reveal relative max-w-4xl mx-auto px-4 text-center text-white">
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          {['Coffee', 'Cooking Oil', 'Frozen Food', 'Poultry', 'Vanilla', 'Palm Sugar'].map(label => (
            <span key={label} className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/15 border border-white/30 tracking-wide">{label}</span>
          ))}
        </div>
        <h2 className="font-display font-black text-4xl lg:text-6xl leading-tight mb-6">Quality Indonesian Products<br />for Your Business</h2>
        <p className="text-white/75 text-lg mb-10 max-w-xl mx-auto">Trusted food and beverage distribution from Indonesia's finest natural resources.</p>
        <button onClick={onExplore}
          className="px-10 py-4 bg-white font-display font-800 text-sm tracking-widest rounded-xl transition-all hover:bg-gray-100 hover:scale-105 active:scale-95"
          style={{ color: '#FF2027' }}>
          DISCOVER OUR PRODUCTS
        </button>
      </div>
    </section>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────
function Contact() {
  const ref = useReveal();
  const waLink = `https://wa.me/6287858327220?text=${encodeURIComponent('Hello UD. Karmindo Supply, I would like to inquire about your products and services.')}`;
  const cards = [
    { icon: '📧', label: 'EMAIL', value: 'cs@uks.com', href: 'mailto:cs@uks.com' },
    { icon: '💬', label: 'WHATSAPP', value: '+62 878 5832 7220', href: waLink },
    { icon: '🌐', label: 'WEBSITE', value: 'www.uks.com', href: 'https://www.uks.com' },
  ];
  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div ref={ref} className="reveal text-center mb-14">
          <div className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4 text-white" style={{ background: '#FF2027' }}>Contact</div>
          <h2 className="font-display font-black text-4xl lg:text-5xl text-gray-900 mb-4">Let's Work Together</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">Looking for quality food and beverage products from Indonesia? Contact our team for product information, availability, packaging, and business inquiries.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 mb-10">
          {cards.map(c => (
            <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
              className="group flex flex-col items-center p-8 rounded-2xl border-2 border-gray-100 hover:border-red-200 bg-white hover:bg-red-50 transition-all text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white transition-transform group-hover:scale-110 text-2xl" style={{ background: '#FF2027' }}>{c.icon}</div>
              <div className="text-xs font-bold tracking-widest text-gray-400 mb-1">{c.label}</div>
              <div className="font-display font-700 text-base text-gray-800">{c.value}</div>
            </a>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-display font-800 text-sm tracking-widest text-white transition-all hover:opacity-90 hover:scale-105"
            style={{ background: '#16a34a' }}>
            CONTACT VIA WHATSAPP
          </a>
          <a href="mailto:cs@uks.com"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-display font-800 text-sm tracking-widest transition-all hover:scale-105 border-2"
            style={{ borderColor: '#FF2027', color: '#FF2027' }}>
            SEND AN INQUIRY
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Inquiry CTA ──────────────────────────────────────────────────────────────
function InquirySection() {
  const ref = useReveal();
  const waLink = `https://wa.me/6287858327220?text=${encodeURIComponent('Hello UD. Karmindo Supply, I would like to start an inquiry about your products.')}`;
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <div ref={ref} className="reveal bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
          <div className="text-3xl mb-4">💬</div>
          <h2 className="font-display font-black text-3xl text-gray-900 mb-3">Ready to Discuss Your Requirements?</h2>
          <p className="text-gray-500 mb-8">Tell us what products you are looking for and our team will get back to you.</p>
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-xl font-display font-800 text-sm tracking-widest text-white transition-all hover:opacity-90 hover:scale-105 mb-4"
            style={{ background: '#FF2027', boxShadow: '0 4px 20px rgba(255,32,39,0.35)' }}>
            START AN INQUIRY
          </a>
          <p className="text-sm text-gray-400 mt-4">Or email us at <a href="mailto:cs@uks.com" className="underline font-semibold" style={{ color: '#FF2027' }}>cs@uks.com</a></p>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ categories, onNav }) {
  return (
    <footer style={{ background: '#FF2027' }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow p-1.5">
                <img src="/logo-ref.png" alt="UKS Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="font-display font-black text-lg leading-tight">UD. Karmindo Supply</div>
                <div className="text-xs text-red-200 leading-tight">Global Supplier</div>
              </div>
            </div>
            <p className="text-red-100 text-sm leading-relaxed italic">"Global Supplier For Daily Consumes Goods"</p>
          </div>
          <div>
            <h4 className="font-display font-800 text-sm tracking-widest uppercase mb-4 text-red-100">Quick Links</h4>
            {[['Home', 'home'], ['About Us', 'about'], ['Products', 'products'], ['Contact', 'contact']].map(([label, id]) => (
              <button key={id} onClick={() => onNav(id)} className="block text-sm text-white/80 hover:text-white py-1.5 transition-colors text-left">{label}</button>
            ))}
          </div>
          <div>
            <h4 className="font-display font-800 text-sm tracking-widest uppercase mb-4 text-red-100">Product Categories</h4>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => onNav(cat.id)} className="block text-sm text-white/80 hover:text-white py-1.5 transition-colors text-left">{cat.name}</button>
            ))}
          </div>
          <div>
            <h4 className="font-display font-800 text-sm tracking-widest uppercase mb-4 text-red-100">Contact Us</h4>
            <div className="space-y-2 text-sm text-white/80">
              <p>📧 cs@uks.com</p>
              <p>📱 +62 878 5832 7220</p>
              <p>🌐 www.uks.com</p>
              <div className="pt-2 border-t border-white/15 mt-3">
                <p className="text-xs leading-relaxed">Gondang, Rt. 11 Rw.02<br />Alastuwo, Poncol, Magetan<br />East Java 63362, Indonesia</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/20 py-5 text-center text-xs text-white/60">
        © 2026 UD. Karmindo Supply. All Rights Reserved.
      </div>
    </footer>
  );
}

// ─── Floating WA ──────────────────────────────────────────────────────────────
function FloatingWA() {
  const waLink = `https://wa.me/6287858327220?text=${encodeURIComponent('Hello UD. Karmindo Supply, I would like to inquire about your products.')}`;
  return (
    <a href={waLink} target="_blank" rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform"
      style={{ background: '#25D366' }} aria-label="Contact via WhatsApp">
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.103 1.522 5.836L.053 23.5l5.8-1.521A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-5.002-1.369l-.359-.213-3.44.902.918-3.351-.234-.374A9.806 9.806 0 012.182 12c0-5.418 4.4-9.818 9.818-9.818 5.418 0 9.818 4.4 9.818 9.818 0 5.418-4.4 9.818-9.818 9.818z"/>
      </svg>
    </a>
  );
}

// ─── Public Site Root ─────────────────────────────────────────────────────────
export default function PublicSite() {
  const [activeProduct, setActiveProduct] = useState(null);
  const [navCategory, setNavCategory] = useState(null);
  
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/categories`),
          axios.get(`${API_BASE_URL}/products`),
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data);
      } catch (err) {
        console.error('Error fetching data from API:', err);
        setError('Gagal mengambil data dari server Express.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNav = (id) => {
    const categoryIds = categories.map(c => c.id);
    if (categoryIds.includes(id)) {
      setNavCategory(id);
      setTimeout(() => { document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }, 50);
    } else {
      setNavCategory(null);
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar onNav={handleNav} />
      <Hero onExplore={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} onContact={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} />
      <About />
      <WhyChooseUs />
      <ProductCatalog
        initialCategory={navCategory}
        categories={categories}
        products={products}
        loading={loading}
        error={error}
        onProductDetail={setActiveProduct}
      />
      <ShowcaseBanner onExplore={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} />
      <Contact />
      <InquirySection />
      <Footer categories={categories} onNav={handleNav} />
      <FloatingWA />
      {activeProduct && (
        <ProductDetailModal product={activeProduct} allCategories={categories} onClose={() => setActiveProduct(null)} />
      )}
    </div>
  );
}