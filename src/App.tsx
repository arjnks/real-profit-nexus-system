
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { MLMProvider } from "@/contexts/MLMContext";
import { MatrixMLMProvider } from "@/contexts/MatrixMLMContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import Shop from "./pages/Shop";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerDashboard from "./pages/CustomerDashboard";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCustomers from "./pages/admin/Customers";
import AdminProducts from "./pages/admin/Products";
import AdminServices from "./pages/admin/Services";
import AdminRequests from "./pages/admin/Requests";
import AdminPurchases from "./pages/admin/Purchases";
import AdminMLMTree from "./pages/admin/MLMTree";
import AdminMLMNetwork from "./pages/admin/MLMNetwork";
import AdminClubManagement from "./pages/admin/ClubManagement";
import AddCustomer from "./pages/admin/AddCustomer";
import EditCustomer from "./pages/admin/EditCustomer";

// Membership pages
import Bronze from "./pages/membership/Bronze";
import Silver from "./pages/membership/Silver";
import Gold from "./pages/membership/Gold";
import Diamond from "./pages/membership/Diamond";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <DataProvider>
              <MLMProvider>
                <MatrixMLMProvider>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/checkout" element={<Checkout />} />
                    
                    {/* Customer routes */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <CustomerDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/orders" 
                      element={
                        <ProtectedRoute>
                          <Orders />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Membership routes */}
                    <Route path="/membership/bronze" element={<Bronze />} />
                    <Route path="/membership/silver" element={<Silver />} />
                    <Route path="/membership/gold" element={<Gold />} />
                    <Route path="/membership/diamond" element={<Diamond />} />
                    
                    {/* Admin routes */}
                    <Route 
                      path="/admin/dashboard" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/customers" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminCustomers />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/customers/add" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AddCustomer />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/customers/edit/:id" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <EditCustomer />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/products" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminProducts />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/services" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminServices />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/requests" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminRequests />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/purchases" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminPurchases />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/mlm-tree" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminMLMTree />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/mlm-network" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminMLMNetwork />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/club-management" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminClubManagement />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </MatrixMLMProvider>
              </MLMProvider>
            </DataProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
