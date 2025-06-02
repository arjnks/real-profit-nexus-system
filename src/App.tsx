
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "@/components/ProtectedRoute";

// Public pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Shop from "@/pages/Shop";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Services from "@/pages/Services";
import NotFound from "@/pages/NotFound";

// Membership pages
import MembershipBronze from "@/pages/membership/Bronze";
import MembershipSilver from "@/pages/membership/Silver";
import MembershipGold from "@/pages/membership/Gold";
import MembershipDiamond from "@/pages/membership/Diamond";

// Customer pages
import CustomerDashboard from "@/pages/CustomerDashboard";
import Profile from "@/pages/Profile";
import Orders from "@/pages/Orders";
import Checkout from "@/pages/Checkout";

// Admin pages
import AdminDashboard from "@/pages/admin/Dashboard";
import Customers from "@/pages/admin/Customers";
import AddCustomer from "@/pages/admin/AddCustomer";
import EditCustomer from "@/pages/admin/EditCustomer";
import Products from "@/pages/admin/Products";
import Purchases from "@/pages/admin/Purchases";
import Requests from "@/pages/admin/Requests";
import MLMTree from "@/pages/admin/MLMTree";
import AdminServices from "@/pages/admin/Services";

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/services" element={<Services />} />
              
              {/* Membership routes */}
              <Route path="/membership/bronze" element={<MembershipBronze />} />
              <Route path="/membership/silver" element={<MembershipSilver />} />
              <Route path="/membership/gold" element={<MembershipGold />} />
              <Route path="/membership/diamond" element={<MembershipDiamond />} />
              
              {/* Customer routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute role="customer">
                    <CustomerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute role="customer">
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute role="customer">
                    <Orders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute role="customer">
                    <Checkout />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/customers" 
                element={
                  <ProtectedRoute role="admin">
                    <Customers />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/customers/add" 
                element={
                  <ProtectedRoute role="admin">
                    <AddCustomer />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/customers/edit/:id" 
                element={
                  <ProtectedRoute role="admin">
                    <EditCustomer />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/products" 
                element={
                  <ProtectedRoute role="admin">
                    <Products />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/purchases" 
                element={
                  <ProtectedRoute role="admin">
                    <Purchases />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/requests" 
                element={
                  <ProtectedRoute role="admin">
                    <Requests />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/mlm" 
                element={
                  <ProtectedRoute role="admin">
                    <MLMTree />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/mlm-tree" 
                element={
                  <ProtectedRoute role="admin">
                    <MLMTree />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/services" 
                element={
                  <ProtectedRoute role="admin">
                    <AdminServices />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
