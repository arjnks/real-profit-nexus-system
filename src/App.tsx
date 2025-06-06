
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import Shop from "./pages/Shop";
import Profile from "./pages/Profile";
import CustomerDashboard from "./pages/CustomerDashboard";
import Orders from "./pages/Orders";
import Checkout from "./pages/Checkout";
import Bronze from "./pages/membership/Bronze";
import Silver from "./pages/membership/Silver";
import Gold from "./pages/membership/Gold";
import Diamond from "./pages/membership/Diamond";
import Dashboard from "./pages/admin/Dashboard";
import Customers from "./pages/admin/Customers";
import AddCustomer from "./pages/admin/AddCustomer";
import EditCustomer from "./pages/admin/EditCustomer";
import Products from "./pages/admin/Products";
import AdminServices from "./pages/admin/Services";
import Purchases from "./pages/admin/Purchases";
import Requests from "./pages/admin/Requests";
import MLMTree from "./pages/admin/MLMTree";
import ClubManagement from "./pages/admin/ClubManagement";
import NotFound from "./pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <DataProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/services" element={<Services />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/dashboard" element={<CustomerDashboard />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/membership/bronze" element={<Bronze />} />
                <Route path="/membership/silver" element={<Silver />} />
                <Route path="/membership/gold" element={<Gold />} />
                <Route path="/membership/diamond" element={<Diamond />} />
                
                {/* Protected Admin Routes */}
                <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/admin/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
                <Route path="/admin/customers/add" element={<ProtectedRoute><AddCustomer /></ProtectedRoute>} />
                <Route path="/admin/customers/edit/:id" element={<ProtectedRoute><EditCustomer /></ProtectedRoute>} />
                <Route path="/admin/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                <Route path="/admin/services" element={<ProtectedRoute><AdminServices /></ProtectedRoute>} />
                <Route path="/admin/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
                <Route path="/admin/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
                <Route path="/admin/club-management" element={<ProtectedRoute><ClubManagement /></ProtectedRoute>} />
                <Route path="/admin/mlm-tree" element={<ProtectedRoute><MLMTree /></ProtectedRoute>} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </DataProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
