import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient } from 'react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { Toaster } from 'sonner';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Profile from '@/pages/Profile';
import Shop from '@/pages/Shop';
import ProductDetails from '@/pages/ProductDetails';
import Checkout from '@/pages/Checkout';
import Orders from '@/pages/Orders';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminCustomers from '@/pages/admin/AdminCustomers';
import AddCustomer from '@/pages/admin/AddCustomer';
import EditCustomer from '@/pages/admin/EditCustomer';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminServices from '@/pages/admin/AdminServices';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminOffers from '@/pages/admin/AdminOffers';
import MLMNetwork from '@/pages/admin/MLMNetwork';
import MLMTree from '@/pages/admin/MLMTree';
import AddProduct from '@/pages/admin/AddProduct';
import EditProduct from '@/pages/admin/EditProduct';
import AddCategory from '@/pages/admin/AddCategory';
import EditCategory from '@/pages/admin/EditCategory';
import AddService from '@/pages/admin/AddService';
import EditService from '@/pages/admin/EditService';
import Unauthorized from '@/pages/Unauthorized';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import SimpleReferralSystem from '@/components/SimpleReferralSystem';
import MLMProvider from '@/contexts/MLMContext';

function App() {
  return (
    <Router>
      <QueryClient>
        <AuthProvider>
          <DataProvider>
            <MLMProvider>
              <Toaster />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/products/add" element={<AddProduct />} />
                <Route path="/admin/products/edit/:id" element={<EditProduct />} />
                <Route path="/admin/customers" element={<AdminCustomers />} />
                <Route path="/admin/customers/add" element={<AddCustomer />} />
                <Route path="/admin/customers/edit/:id" element={<EditCustomer />} />
                <Route path="/admin/categories" element={<AdminCategories />} />
                <Route path="/admin/categories/add" element={<AddCategory />} />
                <Route path="/admin/categories/edit/:id" element={<EditCategory />} />
                <Route path="/admin/services" element={<AdminServices />} />
                <Route path="/admin/services/add" element={<AddService />} />
                <Route path="/admin/services/edit/:id" element={<EditService />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/offers" element={<AdminOffers />} />
                {/* MLM */}
                <Route path="/admin/mlm-network" element={<MLMNetwork />} />
                <Route path="/admin/mlm-tree" element={<MLMTree />} />
                {/* Referral test */}
                <Route path="/referral/:customerCode" element={<SimpleReferralSystem customerCode="A100" />} />
              </Routes>
            </MLMProvider>
          </DataProvider>
        </AuthProvider>
      </QueryClient>
    </Router>
  );
}

export default App;
