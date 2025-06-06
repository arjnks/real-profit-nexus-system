
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Search, Plus, Minus, Package, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const Shop = () => {
  const { products } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  // Add to cart
  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.stockQuantity === 0) {
      toast.error('This product is out of stock');
      return;
    }

    const currentQuantity = cart[productId] || 0;
    if (currentQuantity >= product.stockQuantity) {
      toast.error(`Only ${product.stockQuantity} items available in stock`);
      return;
    }

    setCart(prev => ({
      ...prev,
      [productId]: currentQuantity + 1
    }));
    toast.success('Added to cart');
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId] -= 1;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  // Get total items in cart
  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };

  // Calculate total price using MRP
  const getTotalPrice = () => {
    return Object.entries(cart).reduce((sum, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return sum + (product ? product.mrp * quantity : 0);
    }, 0);
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Shop</h1>
          {getTotalItems() > 0 && (
            <Button className="relative">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Cart ({getTotalItems()})
              <Badge className="absolute -top-2 -right-2 bg-red-500">
                {getTotalItems()}
              </Badge>
            </Button>
          )}
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
                      onClick={() => addToCart(product.id)}
                      disabled={cart[product.id] >= product.stockQuantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => addToCart(product.id)}
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
            <p className="text-muted-foreground">No products found matching your criteria.</p>
          </div>
        )}

        {/* Cart Summary */}
        {getTotalItems() > 0 && (
          <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 min-w-[300px]">
            <h3 className="font-semibold mb-2">Cart Summary</h3>
            <div className="space-y-1 text-sm">
              {Object.entries(cart).map(([productId, quantity]) => {
                const product = products.find(p => p.id === productId);
                return product ? (
                  <div key={productId} className="flex justify-between">
                    <span>{product.name} x{quantity}</span>
                    <span>₹{(product.mrp * quantity).toFixed(2)}</span>
                  </div>
                ) : null;
              })}
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total: ₹{getTotalPrice().toFixed(2)}</span>
              </div>
              <Button className="w-full mt-2" disabled={!user}>
                {user ? 'Proceed to Checkout' : 'Login to Checkout'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Shop;
