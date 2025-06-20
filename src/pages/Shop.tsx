
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Layout from '@/components/Layout';
import CartSummary from '@/components/CartSummary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Search, Plus, Minus, Package, AlertTriangle, RefreshCw, Wifi } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Shop = () => {
  const { products, isLoading, refreshData } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  const {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalItems,
    getTotalPrice
  } = useCart();

  // Monitor products loading
  useEffect(() => {
    console.log('Shop: Products state changed -', {
      productsCount: products?.length || 0,
      isLoading,
      hasProducts: products && products.length > 0
    });

    if (!isLoading && (!products || products.length === 0)) {
      console.warn('Shop: No products available after loading completed');
      setLoadingError('No products found. This might be a connection issue.');
    } else if (products && products.length > 0) {
      setLoadingError(null);
    }
  }, [products, isLoading]);

  // Initial data refresh with retry logic
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    const loadWithRetry = async () => {
      try {
        console.log(`Shop: Loading data attempt ${retryCount + 1}/${maxRetries}`);
        await refreshData();
        setLoadingError(null);
      } catch (error) {
        console.error(`Shop: Load attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        
        if (retryCount < maxRetries) {
          setTimeout(loadWithRetry, 2000 * retryCount); // Exponential backoff
        } else {
          setLoadingError('Failed to load products after multiple attempts. Please check your connection.');
        }
      }
    };

    loadWithRetry();
  }, []);

  // Filter products safely
  const filteredProducts = (products || []).filter(product => {
    if (!product) return false;
    
    const productName = product.name || '';
    const productCategory = product.category || '';
    
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         productCategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || productCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories safely
  const categories = ['all', ...Array.from(new Set(
    (products || [])
      .map(p => p?.category)
      .filter(Boolean)
  ))];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLoadingError(null);
    
    try {
      console.log('Shop: Manual refresh initiated');
      await refreshData();
      toast.success('Products refreshed successfully');
    } catch (error) {
      console.error('Shop: Manual refresh failed:', error);
      setLoadingError('Failed to refresh products. Please try again.');
      toast.error('Failed to refresh products');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to proceed with checkout');
      navigate('/login');
      return;
    }
    
    navigate('/checkout');
  };

  const getStockBadge = (stockQuantity: number) => {
    if (stockQuantity === 0) {
      return (
        <Badge variant="destructive" className="text-xs">
          <Package className="h-3 w-3 mr-1" />
          Out of Stock
        </Badge>
      );
    } else if (stockQuantity === 1) {
      return (
        <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Only 1 Left!
        </Badge>
      );
    } else if (stockQuantity <= 5) {
      return (
        <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Low Stock ({stockQuantity} left)
        </Badge>
      );
    }
    return null;
  };

  // Helper function to check if product is in cart
  const getCartQuantity = (productId: string) => {
    const cartItem = items.find(item => item.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  if (isLoading && (!products || products.length === 0)) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-lg">Loading products...</span>
            <p className="text-sm text-gray-500">This may take a moment</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Shop</h1>
          <div className="flex items-center gap-4">
            {loadingError && (
              <div className="flex items-center text-red-600 text-sm">
                <Wifi className="h-4 w-4 mr-1" />
                Connection Issue
              </div>
            )}
            
            <div className="text-sm text-gray-500">
              {(products || []).length} products available
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            {getTotalItems() > 0 && (
              <Button className="relative" onClick={handleCheckout}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Cart ({getTotalItems()})
                <Badge className="absolute -top-2 -right-2 bg-red-500">
                  {getTotalItems()}
                </Badge>
              </Button>
            )}
          </div>
        </div>

        {loadingError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <p className="text-yellow-800 font-medium">Connection Issue</p>
                <p className="text-yellow-600 text-sm">{loadingError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="mt-2"
                  disabled={isRefreshing}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'All Categories' : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const cartQuantity = getCartQuantity(product.id);
            
            return (
              <Card key={product.id} className={`${product.stockQuantity === 0 ? 'opacity-60' : ''}`}>
                <CardHeader className="p-4">
                  <img 
                    src={product.image || '/placeholder.svg'} 
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-md mb-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                  <Badge variant="outline" className="w-fit">{product.category}</Badge>
                  {getStockBadge(product.stockQuantity)}
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    {product.dummyPrice && (
                      <div className="text-sm text-gray-500 line-through">
                        Was ₹{product.dummyPrice.toFixed(2)}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-600">
                        ₹{product.price.toFixed(2)}
                      </span>
                      {product.dummyPrice && (
                        <Badge variant="destructive" className="text-xs">
                          Save ₹{(product.dummyPrice - product.price).toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Stock: {product.stockQuantity} available
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  {product.stockQuantity === 0 ? (
                    <Button disabled className="w-full">
                      Out of Stock
                    </Button>
                  ) : cartQuantity > 0 ? (
                    <div className="flex items-center justify-between w-full">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(product.id, Math.max(0, cartQuantity - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-medium">{cartQuantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(product.id, cartQuantity + 1)}
                        disabled={cartQuantity >= product.stockQuantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => addToCart(product)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {filteredProducts.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">
              {(products || []).length === 0 
                ? 'No products available at the moment.' 
                : searchTerm || selectedCategory !== 'all' 
                  ? 'No products found matching your criteria.' 
                  : 'No products available at the moment.'}
            </p>
            {(products || []).length === 0 && (
              <div className="mt-4">
                <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Try Loading Again
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Cart Summary */}
        <CartSummary
          cartItems={items}
          totalPrice={getTotalPrice()}
          totalItems={getTotalItems()}
          onCheckout={handleCheckout}
          isLoggedIn={!!user}
        />
      </div>
    </Layout>
  );
};

export default Shop;
