
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Public pages
import Index from '@/pages/Index';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Shop from '@/pages/Shop';
import Services from '@/pages/Services';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';

// Customer pages
import CustomerDashboard from '@/pages/CustomerDashboard';
import Profile from '@/pages/Profile';
import Orders from '@/pages/Orders';
import Checkout from '@/pages/Checkout';

// Membership pages
import Bronze from '@/pages/membership/Bronze';
import Silver from '@/pages/membership/Silver';
import Gold from '@/pages/membership/Gold';
import Diamond from '@/pages/membership/Diamond';

// Admin pages
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminCustomers from '@/pages/admin/Customers';
import AdminProducts from '@/pages/admin/Products';
import AdminServices from '@/pages/admin/Services';
import AdminPurchases from '@/pages/admin/Purchases';
import AdminRequests from '@/pages/admin/Requests';
import ClubManagement from '@/pages/admin/ClubManagement';
import MLMTree from '@/pages/admin/MLMTree';
import AddCustomer from '@/pages/admin/AddCustomer';
import EditCustomer from '@/pages/admin/EditCustomer';

import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DataProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/services" element={<Services />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Customer routes */}
                <Route path="/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                
                {/* Membership routes */}
                <Route path="/membership/bronze" element={<Bronze />} />
                <Route path="/membership/silver" element={<Silver />} />
                <Route path="/membership/gold" element={<Gold />} />
                <Route path="/membership/diamond" element={<Diamond />} />
                
                {/* Admin routes */}
                <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/customers" element={<ProtectedRoute><AdminCustomers /></ProtectedRoute>} />
                <Route path="/admin/add-customer" element={<ProtectedRoute><AddCustomer /></ProtectedRoute>} />
                <Route path="/admin/customers/:id/edit" element={<ProtectedRoute><EditCustomer /></ProtectedRoute>} />
                <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
                <Route path="/admin/services" element={<ProtectedRoute><AdminServices /></ProtectedRoute>} />
                <Route path="/admin/purchases" element={<ProtectedRoute><AdminPurchases /></ProtectedRoute>} />
                <Route path="/admin/requests" element={<ProtectedRoute><AdminRequests /></ProtectedRoute>} />
                <Route path="/admin/club-management" element={<ProtectedRoute><ClubManagement /></ProtectedRoute>} />
                <Route path="/admin/mlm-tree" element={<ProtectedRoute><MLMTree /></ProtectedRoute>} />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
          <Toaster />
        </DataProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
