
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import Layout from '@/components/Layout';
import CartSummary from '@/components/CartSummary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Search, Plus, Minus, Package, AlertTriangle, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Shop = () => {
  const { products, isLoading, error, refreshData } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const {
    cart,
    addToCart,
    removeFromCart,
    getTotalItems,
    getCartItems,
    getTotalPrice
  } = useCart();

  useEffect(() => {
    console.log('Shop page - Products updated:', products?.length || 0, 'products loaded');
    console.log('Shop page - Products data:', products);
    if ((!products || products.length === 0) && !isLoading && !error) {
      console.warn('No products found in shop page');
    }
  }, [products, isLoading, error]);

  useEffect(() => {
    console.log('Shop page mounted, refreshing data...');
    refreshData();
  }, [refreshData]);

  // Filter products safely
  const filteredProducts = React.useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) {
      console.warn('Products is not an array or empty:', products);
      return [];
    }

    return products.filter(product => {
      if (!product || typeof product !== 'object') {
        console.warn('Invalid product object:', product);
        return false;
      }

      const productName = product.name || '';
      const productCategory = product.category || '';
      
      const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           productCategory.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || productCategory === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Get unique categories safely
  const categories = React.useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) {
      return ['all'];
    }

    const uniqueCategories = new Set(
      products
        .filter(p => p && p.category)
        .map(p => p.category)
    );
    
    return ['all', ...Array.from(uniqueCategories)];
  }, [products]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log('Manual refresh triggered...');
      await refreshData();
      console.log('Manual refresh completed, products count:', products?.length || 0);
      toast.success('Products refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh products:', error);
      toast.error(`Failed to refresh products: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    
    try {
      const cartItems = getCartItems(products || []).map(item => ({
        product: {
          id: item.productId,
          name: item.name,
          price: item.price,
          mrp: item.mrp
        },
        quantity: item.quantity
      }));

      navigate('/checkout', { 
        state: { cart: cartItems }
      });
    } catch (error) {
      console.error('Error preparing checkout:', error);
      toast.error('Failed to prepare checkout. Please try again.');
    }
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

  const handleAddToCart = (product: any) => {
    try {
      if (!product || !product.id) {
        toast.error('Invalid product data');
        return;
      }
      addToCart(product);
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    try {
      removeFromCart(productId);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mr-3" />
            <span className="text-lg">Loading products...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <div>
                  <p className="text-red-600 font-medium">Failed to load products</p>
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              </div>
              <Button 
                onClick={handleRefresh} 
                className="mt-4"
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Try Again
              </Button>
            </CardContent>
          </Card>
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
            <div className="text-sm text-gray-500">
              {(products?.length || 0)} products available
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
            if (!product || !product.id) {
              return null;
            }

            const stockQuantity = product.stockQuantity || 0;
            const isOutOfStock = stockQuantity === 0;
            const cartQuantity = cart[product.id] || 0;

            return (
              <Card key={product.id} className={`${isOutOfStock ? 'opacity-60' : ''}`}>
                <CardHeader className="p-4">
                  <img 
                    src={product.image || '/placeholder.svg'} 
                    alt={product.name || 'Product'}
                    className="w-full h-48 object-cover rounded-md mb-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                  <CardTitle className="text-lg">{product.name || 'Unnamed Product'}</CardTitle>
                  <p className="text-sm text-muted-foreground">{product.description || 'No description available'}</p>
                  <Badge variant="outline" className="w-fit">{product.category || 'Uncategorized'}</Badge>
                  {getStockBadge(stockQuantity)}
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    {product.dummyPrice && (
                      <div className="text-sm text-gray-500 line-through">
                        Was ₹{Number(product.dummyPrice).toFixed(2)}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-600">
                        ₹{Number(product.mrp || 0).toFixed(2)}
                      </span>
                      {product.dummyPrice && (
                        <Badge variant="destructive" className="text-xs">
                          Save ₹{(Number(product.dummyPrice) - Number(product.mrp || 0)).toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Stock: {stockQuantity} available
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  {isOutOfStock ? (
                    <Button disabled className="w-full">
                      Out of Stock
                    </Button>
                  ) : cartQuantity > 0 ? (
                    <div className="flex items-center justify-between w-full">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveFromCart(product.id)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-medium">{cartQuantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleAddToCart(product)}
                        disabled={cartQuantity >= stockQuantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => handleAddToCart(product)}
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">
              {(!products || products.length === 0)
                ? 'No products available at the moment.' 
                : searchTerm || selectedCategory !== 'all' 
                  ? 'No products found matching your criteria.' 
                  : 'No products available at the moment.'}
            </p>
            {(!products || products.length === 0) && (
              <div className="mt-4">
                <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh Products
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Cart Summary */}
        <CartSummary
          cartItems={getCartItems(products || [])}
          totalPrice={getTotalPrice(products || [])}
          totalItems={getTotalItems()}
          onCheckout={handleCheckout}
          isLoggedIn={!!user}
        />
      </div>
    </Layout>
  );
};

export default Shop;
