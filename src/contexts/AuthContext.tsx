
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

type UserRole = "admin" | "customer" | null;

type User = {
  id: string;
  username: string;
  role: UserRole;
  name?: string;
  phone?: string;
  code?: string;
  tier?: "Bronze" | "Silver" | "Gold" | "Diamond";
};

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem("realprofit_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("realprofit_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Admin login (hardcoded as specified)
      if (username === "admin123" && password === "admin123") {
        const adminUser: User = {
          id: "admin",
          username: "admin123",
          role: "admin",
          name: "Admin",
          code: "A100"
        };
        
        localStorage.setItem("realprofit_user", JSON.stringify(adminUser));
        setUser(adminUser);
        toast.success("Welcome to Real Profit Admin!");
        setIsLoading(false);
        return true;
      }
      
      // Customer login - validate against registered customers (no pending check)
      const customers = JSON.parse(localStorage.getItem("realprofit_customers") || "[]");
      const customer = customers.find((c: any) => c.phone === username);
      
      if (customer) {
        // For customers, password is not required in this system
        const customerUser: User = {
          id: customer.id,
          username: customer.phone,
          role: "customer",
          name: customer.name,
          phone: customer.phone,
          code: customer.code,
          tier: customer.tier
        };
        
        localStorage.setItem("realprofit_user", JSON.stringify(customerUser));
        setUser(customerUser);
        toast.success(`Welcome back, ${customer.name}!`);
        setIsLoading(false);
        return true;
      }
      
      toast.error("Invalid phone number or account not found");
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("realprofit_user");
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
