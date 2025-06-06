import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import Layout from '@/components/Layout';
import CartSummary from '@/components/CartSummary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Search, Plus, Minus, Package, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Shop = () => {
  const { products, isLoading, refreshData } = useData();
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

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      toast.success('Products refreshed');
    } catch (error) {
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
    
    // Convert cart items to the format expected by checkout page
    const cartItems = getCartItems(products).map(item => ({
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Shop</h1>
          <div className="flex items-center gap-4">
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
          {filteredProducts.map((product) => (
            <Card key={product.id} className={`${product.stockQuantity === 0 ? 'opacity-60' : ''}`}>
              <CardHeader className="p-4">
                <img 
                  src={product.image} 
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
                      ₹{product.mrp.toFixed(2)}
                    </span>
                    {product.dummyPrice && (
                      <Badge variant="destructive" className="text-xs">
                        Save ₹{(product.dummyPrice - product.mrp).toFixed(2)}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-green-600">
                    Earn ₹{Math.floor(product.mrp - product.price)} point money
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
                ) : cart[product.id] ? (
                  <div className="flex items-center justify-between w-full">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeFromCart(product.id)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-medium">{cart[product.id]}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => addToCart(product)}
                      disabled={cart[product.id] >= product.stockQuantity}
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
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">
              {searchTerm || selectedCategory !== 'all' 
                ? 'No products found matching your criteria.' 
                : 'No products available at the moment.'}
            </p>
          </div>
        )}

        {/* Cart Summary */}
        <CartSummary
          cartItems={getCartItems(products)}
          totalPrice={getTotalPrice(products)}
          totalItems={getTotalItems()}
          onCheckout={handleCheckout}
          isLoggedIn={!!user}
        />
      </div>
    </Layout>
  );
};

export default Shop;
