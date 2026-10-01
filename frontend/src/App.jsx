import { Routes, Route, Navigate } from 'react-router-dom';
import PublicSite from './LandingPages';
import Login from './login/login';
import AdminLayout from './admin/layout/layout'; // Path layout kamu
import Dashboard from './admin/dashboard/dashboard';
import Products from './admin/products/Products';
import Categories from './admin/categories/categories';
import Media from './admin/media/media';
import Settings from './admin/settings/settings';

function App() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<PublicSite />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Group Admin Layout (Nested Routes) */}
      <Route path="/admin" element={<AdminLayout />}>
        {/* Redirect /admin langsung ke /admin/dashboard */}
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        
        {/* Sub-halaman Admin */}
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Kamu bisa tambah halaman admin lain di sini nanti: */}
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="media" element={<Media />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;