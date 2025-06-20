
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { CartProvider } from "@/contexts/CartContext";
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
import LeaderboardPage from "./pages/LeaderboardPage";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCustomers from "./pages/admin/Customers";
import AdminProducts from "./pages/admin/Products";
import AdminServices from "./pages/admin/Services";
import AdminRequests from "./pages/admin/Requests";
import AdminPurchases from "./pages/admin/Purchases";
import AdminClubManagement from "./pages/admin/ClubManagement";
import AddCustomer from "./pages/admin/AddCustomer";
import EditCustomer from "./pages/admin/EditCustomer";
import SalesDashboard from "./pages/admin/SalesDashboard";
import LeaderboardAdmin from "./pages/admin/LeaderboardAdmin";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <DataProvider>
              <CartProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  
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
                    path="/admin/sales" 
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <SalesDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/leaderboard" 
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <LeaderboardAdmin />
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
              </CartProvider>
            </DataProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
