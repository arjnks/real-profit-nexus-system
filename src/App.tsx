
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Context Providers
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";

// Auth Guard
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Shop from "./pages/Shop";
import NotFound from "./pages/NotFound";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import Customers from "./pages/admin/Customers";
import AddCustomer from "./pages/admin/AddCustomer";
import EditCustomer from "./pages/admin/EditCustomer";
import Requests from "./pages/admin/Requests";
import MLMTree from "./pages/admin/MLMTree";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/shop" element={<Shop />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute role="admin">
                    <Dashboard />
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
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
