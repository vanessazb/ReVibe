import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { InventoryProvider } from './context/InventoryContext';
import { ToastProvider } from './components/ui/Toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Home } from './pages/buyer/Home';
import { Catalog } from './pages/buyer/Catalog';
import { ProductDetail } from './pages/buyer/ProductDetail';
import { Cart } from './pages/buyer/Cart';
import { Checkout } from './pages/buyer/Checkout';
import { OrderConfirmation } from './pages/buyer/OrderConfirmation';
import { SellerDashboard } from './pages/seller/SellerDashboard';
import { UploadProduct } from './pages/seller/UploadProduct';
import { MyListings } from './pages/seller/MyListings';
import { AdminDashboard } from './pages/admin/AdminDashboard';

function RequireAuth({
  children,
  requiredRole,
}: {
  children: React.ReactElement;
  requiredRole?: 'seller' | 'admin';
}) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#C8B89A] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && profile?.role !== requiredRole && profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/catalogo" element={<PublicLayout><Catalog /></PublicLayout>} />
      <Route path="/producto/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />

      {/* Buyer (auth required) */}
      <Route
        path="/carrito"
        element={
          <RequireAuth>
            <PublicLayout>
              <Cart />
            </PublicLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/checkout"
        element={
          <RequireAuth>
            <PublicLayout>
              <Checkout />
            </PublicLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/orden-confirmada"
        element={
          <RequireAuth>
            <PublicLayout>
              <OrderConfirmation />
            </PublicLayout>
          </RequireAuth>
        }
      />

      {/* Seller */}
      <Route
        path="/vendedor"
        element={
          <RequireAuth requiredRole="seller">
            <PublicLayout>
              <SellerDashboard />
            </PublicLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/vendedor/consignar"
        element={
          <RequireAuth requiredRole="seller">
            <PublicLayout>
              <UploadProduct />
            </PublicLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/vendedor/mis-prendas"
        element={
          <RequireAuth requiredRole="seller">
            <PublicLayout>
              <MyListings />
            </PublicLayout>
          </RequireAuth>
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <RequireAuth requiredRole="admin">
            <AdminDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/inventario"
        element={
          <RequireAuth requiredRole="admin">
            <AdminDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/ventas"
        element={
          <RequireAuth requiredRole="admin">
            <AdminDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/usuarios"
        element={
          <RequireAuth requiredRole="admin">
            <AdminDashboard />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <InventoryProvider>
            <CartProvider>
              <AppRoutes />
            </CartProvider>
          </InventoryProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
