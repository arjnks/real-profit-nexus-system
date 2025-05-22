
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserCircle, LogOut, Home, ShoppingCart, UserPlus, Phone } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-realprofit-blue flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">RP</span>
              </div>
              <span className="text-lg font-bold text-realprofit-blue">Real Profit</span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="text-gray-600 hover:text-realprofit-blue transition">
              Home
            </Link>
            <Link to="/shop" className="text-gray-600 hover:text-realprofit-blue transition">
              Shop
            </Link>
            {!user && (
              <>
                <Link to="/register" className="text-gray-600 hover:text-realprofit-blue transition">
                  Register
                </Link>
                <Link to="/login" className="text-gray-600 hover:text-realprofit-blue transition">
                  Login
                </Link>
              </>
            )}
            <Link to="/track-order" className="text-gray-600 hover:text-realprofit-blue transition">
              Track Order
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-realprofit-blue transition">
              Contact Us
            </Link>
          </nav>

          <div className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full">
                    <UserCircle className="h-6 w-6 text-realprofit-blue" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user.name || user.username}</span>
                      {user.code && (
                        <span className="text-xs text-muted-foreground">Code: {user.code}</span>
                      )}
                      {user.role === 'admin' ? (
                        <span className="text-xs font-medium text-realprofit-green">Admin</span>
                      ) : user.tier ? (
                        <span className="text-xs font-medium text-realprofit-gold">{user.tier} Member</span>
                      ) : null}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === 'admin' ? (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard" className="w-full flex items-center">
                        <Home className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="w-full flex items-center">
                          <UserCircle className="mr-2 h-4 w-4" />
                          My Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/orders" className="w-full flex items-center">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          My Orders
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="space-x-2">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">
                    Login
                  </Link>
                </Button>
                <Button asChild variant="default" size="sm">
                  <Link to="/register">
                    Register
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
