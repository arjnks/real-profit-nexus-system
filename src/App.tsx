
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { Toaster } from 'sonner';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Profile from '@/pages/Profile';
import Shop from '@/pages/Shop';
import Checkout from '@/pages/Checkout';
import Orders from '@/pages/Orders';
import Dashboard from '@/pages/admin/Dashboard';
import Products from '@/pages/admin/Products';
import Customers from '@/pages/admin/Customers';
import AddCustomer from '@/pages/admin/AddCustomer';
import EditCustomer from '@/pages/admin/EditCustomer';
import Services from '@/pages/admin/Services';
import MLMNetwork from '@/pages/admin/MLMNetwork';
import MLMTree from '@/pages/admin/MLMTree';
import Purchases from '@/pages/admin/Purchases';
import Requests from '@/pages/admin/Requests';
import ClubManagement from '@/pages/admin/ClubManagement';
import SimpleReferralSystem from '@/components/SimpleReferralSystem';
import MLMProvider from '@/contexts/MLMContext';
import NotFound from '@/pages/NotFound';
import About from '@/pages/About';
import Contact from '@/pages/Contact';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <DataProvider>
            <MLMProvider>
              <Toaster />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/services" element={<Services />} />
                {/* Admin Routes */}
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/products" element={<Products />} />
                <Route path="/admin/customers" element={<Customers />} />
                <Route path="/admin/customers/add" element={<AddCustomer />} />
                <Route path="/admin/customers/:id/edit" element={<EditCustomer />} />
                <Route path="/admin/services" element={<Services />} />
                <Route path="/admin/purchases" element={<Purchases />} />
                <Route path="/admin/requests" element={<Requests />} />
                <Route path="/admin/club-management" element={<ClubManagement />} />
                {/* MLM */}
                <Route path="/admin/mlm-network" element={<MLMNetwork />} />
                <Route path="/admin/mlm-tree" element={<MLMTree />} />
                <Route path="/admin/mlm" element={<MLMTree />} />
                {/* Referral test */}
                <Route path="/referral/:customerCode" element={<SimpleReferralSystem customerCode="A100" />} />
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MLMProvider>
          </DataProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
