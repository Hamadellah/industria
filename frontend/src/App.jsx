import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import MainLayout from './layouts/MainLayout';
import AdminCategories from './pages/admin/AdminCategories';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDemandes from './pages/admin/AdminDemandes';
import AdminProducts from './pages/admin/AdminProducts';
import AdminUsers from './pages/admin/AdminUsers';
import Cart from './pages/Cart';
import CategoryPage from './pages/CategoryPage';
import Favorites from './pages/Favorites';
import Home from './pages/Home';
import Login from './pages/Login';
import MyDemandes from './pages/MyDemandes';
import NotFound from './pages/NotFound';
import ProductDetails from './pages/ProductDetails';
import Products from './pages/Products';
import Profile from './pages/Profile';
import Register from './pages/Register';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/categories/:id" element={<CategoryPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-demandes" element={<MyDemandes />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<ProtectedRoute adminOnly />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/demandes" element={<AdminDemandes />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
      </Route>
    </Routes>
  );
}
