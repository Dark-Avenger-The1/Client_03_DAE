import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import RequireAuth from './components/RequireAuth'

//  Routes & Paths
import HomeSeller from './pages/HomeSeller'
import Landing from './pages/Landing'
import Catalog from './pages/Catalog'
import Farms from './pages/Farms'
import FarmDetail from './pages/FarmDetail'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import Login from './pages/Login'
import SellerLogin from './pages/SellerLogin'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Customer / buyer side — browsing is open to everyone */}
            <Route path="/" element={<Landing />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/farms" element={<Farms />} />
            <Route path="/farm/:id" element={<FarmDetail />} />
            <Route path="/login" element={<Login />} />

            {/* Ordering needs an account */}
            <Route
              path="/cart"
              element={
                <RequireAuth reason="order">
                  <Cart />
                </RequireAuth>
              }
            />
            <Route
              path="/orders"
              element={
                <RequireAuth reason="account">
                  <Orders />
                </RequireAuth>
              }
            />

            {/* Seller side */}
            <Route path="/seller/login" element={<SellerLogin />} />
            <Route path="/seller" element={<HomeSeller />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
