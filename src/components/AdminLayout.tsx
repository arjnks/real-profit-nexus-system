
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  GitBranch,
  CreditCard,
  ClipboardList,
  Tag,
  Calendar,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [customersExpanded, setCustomersExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItem = ({
    to,
    icon: Icon,
    label,
    expandable = false,
    expanded = false,
    onToggle,
    count,
  }: {
    to: string;
    icon: React.ElementType;
    label: string;
    expandable?: boolean;
    expanded?: boolean;
    onToggle?: () => void;
    count?: number;
  }) => {
    const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);

    return (
      <div>
        {expandable ? (
          <button
            onClick={onToggle}
            className={`w-full flex items-center justify-between p-2 rounded-md ${
              isActive ? 'bg-realprofit-blue/10 text-realprofit-blue' : 'hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center">
              <Icon className="h-5 w-5 mr-3" />
              {sidebarOpen && <span>{label}</span>}
            </div>
            {sidebarOpen && (
              <div className="flex items-center">
                {count !== undefined && (
                  <span className="text-xs bg-realprofit-blue text-white rounded-full px-2 py-0.5 mr-1">
                    {count}
                  </span>
                )}
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            )}
          </button>
        ) : (
          <Link
            to={to}
            className={`flex items-center justify-between p-2 rounded-md ${
              isActive ? 'bg-realprofit-blue/10 text-realprofit-blue' : 'hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center">
              <Icon className="h-5 w-5 mr-3" />
              {sidebarOpen && <span>{label}</span>}
            </div>
            {sidebarOpen && count !== undefined && (
              <span className="text-xs bg-realprofit-blue text-white rounded-full px-2 py-0.5">
                {count}
              </span>
            )}
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="rounded-full"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 transform ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out bg-white border-r ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link to="/admin/dashboard" className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-realprofit-blue flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">RP</span>
              </div>
              {sidebarOpen && <span className="text-lg font-bold text-realprofit-blue">Real Profit</span>}
            </Link>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSidebarOpen(false)}
                className="lg:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-1">
              <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem
                to="/admin/customers"
                icon={Users}
                label="Customers"
                expandable
                expanded={customersExpanded}
                onToggle={() => setCustomersExpanded(!customersExpanded)}
              />
              {customersExpanded && sidebarOpen && (
                <div className="ml-8 space-y-1 mt-1">
                  <Link
                    to="/admin/customers/add"
                    className={`flex items-center p-2 rounded-md ${
                      location.pathname === '/admin/customers/add'
                        ? 'bg-realprofit-blue/10 text-realprofit-blue'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Add Customer
                  </Link>
                  <Link
                    to="/admin/customers/edit"
                    className={`flex items-center p-2 rounded-md ${
                      location.pathname === '/admin/customers/edit'
                        ? 'bg-realprofit-blue/10 text-realprofit-blue'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Edit Customer
                  </Link>
                </div>
              )}
              <NavItem to="/admin/purchases" icon={ShoppingCart} label="Purchases" />
              <NavItem to="/admin/mlm" icon={GitBranch} label="MLM Tree" />
              <NavItem to="/admin/transactions" icon={CreditCard} label="Transactions" />
              <NavItem to="/admin/requests" icon={ClipboardList} label="Requests" count={2} />
              <NavItem to="/admin/offers" icon={Tag} label="Offers" />
              <NavItem to="/admin/reservations" icon={Calendar} label="Reservations" />

              <Separator className="my-4" />

              <Button
                variant="ghost"
                className={`w-full justify-start p-2 ${!sidebarOpen && 'justify-center'}`}
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-3" />
                {sidebarOpen && <span>Logout</span>}
              </Button>
            </nav>
          </div>

          {/* Sidebar footer */}
          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-realprofit-blue flex items-center justify-center mr-2">
                <span className="text-white font-bold text-xs">A</span>
              </div>
              {sidebarOpen && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user?.name || 'Admin'}</span>
                  <span className="text-xs text-gray-500">{user?.code || 'A100'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b h-16 flex items-center px-6">
          <h1 className="text-xl font-semibold text-gray-800">
            Real Profit Admin
          </h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
