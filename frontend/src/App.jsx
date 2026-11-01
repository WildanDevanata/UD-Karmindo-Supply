
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicSite from './LandingPages';
import Login from './login/login';
import AdminLayout from './admin/layout/layout';
import Dashboard from './admin/dashboard/dashboard';
import Products from './admin/products/Products';
import Categories from './admin/categories/categories';
import Media from './admin/media/media';
import Settings from './admin/settings/settings';
import ProductForm from './admin/products/ProductForm/ProductForm';

function App() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<PublicSite />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Admin Layout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />

        {/* Dashboard */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* Products */}
        <Route path="products" element={<Products />} />
        <Route path="products/ProductForm" element={<ProductForm />} />

        {/* Edit Product */}
        <Route path="products/edit/:id" element={<ProductForm />} />

        {/* Other Pages */}
        <Route path="categories" element={<Categories />} />
        <Route path="media" element={<Media />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
