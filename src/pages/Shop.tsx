
import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import CartSummary from '@/components/CartSummary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ShoppingCart, Plus, Minus, Star, Package, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const Shop = () => {
  const { products, categories, customers } = useData();
  const { 
    cartItems, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotalPrice, 
    getTotalItems 
  } = useCart();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCart, setShowCart] = useState(false);

  // Get customer data if logged in
  const customer = user?.role === 'customer' 
    ? customers.find(c => c.id === user.id) 
    : null;

  // Calculate tier-based discount
  const getTierDiscount = (product: any) => {
    if (!customer) return 0;
    return product.tier_discounts?.[customer.tier] || 0;
  };

  // Calculate discounted price
  const getDiscountedPrice = (product: any) => {
    const discount = getTierDiscount(product);
    return product.price * (1 - discount / 100);
  };

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
      return matchesSearch && matchesCategory && product.in_stock;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleAddToCart = (product: any) => {
    if (product.stock_quantity <= 0) {
      toast.error('Product is out of stock');
      return;
    }
    
    const currentQuantity = cartItems.find(item => item.id === product.id)?.quantity || 0;
    if (currentQuantity >= product.stock_quantity) {
      toast.error('Cannot add more items than available in stock');
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: getDiscountedPrice(product),
      originalPrice: product.price,
      image: product.image,
      maxQuantity: product.stock_quantity
    });
    
    toast.success(`${product.name} added to cart`);
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to checkout');
      return;
    }
    // Implement checkout logic
    console.log('Checkout with items:', cartItems);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
            <p className="text-gray-600">
              {customer && `Welcome ${customer.name}! You're a ${customer.tier} member.`}
            </p>
          </div>
          
          <Button 
            onClick={() => setShowCart(!showCart)}
            className="relative"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart ({getTotalItems()})
            {getTotalItems() > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500">
                {getTotalItems()}
              </Badge>
            )}
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products */}
          <div className="lg:col-span-3">
            {filteredProducts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map(product => {
                  const cartItem = cartItems.find(item => item.id === product.id);
                  const tierDiscount = getTierDiscount(product);
                  const discountedPrice = getDiscountedPrice(product);
                  
                  return (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                        {tierDiscount > 0 && (
                          <Badge className="absolute top-2 right-2 bg-green-500">
                            {tierDiscount}% OFF
                          </Badge>
                        )}
                        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                          <Badge variant="destructive" className="absolute top-2 left-2">
                            Only {product.stock_quantity} left
                          </Badge>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {tierDiscount > 0 ? (
                              <>
                                <span className="text-lg font-bold text-green-600">
                                  ₹{discountedPrice.toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  ₹{product.price.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-bold">
                                ₹{product.price.toFixed(2)}
                              </span>
                            )}
                          </div>
                          {product.dummy_price && (
                            <span className="text-xs text-gray-400 line-through">
                              MRP: ₹{product.dummy_price.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Stock: {product.stock_quantity}
                          </span>
                          
                          {cartItem ? (
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{cartItem.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (cartItem.quantity < product.stock_quantity) {
                                    updateQuantity(product.id, cartItem.quantity + 1);
                                  } else {
                                    toast.error('Cannot add more than available stock');
                                  }
                                }}
                                disabled={cartItem.quantity >= product.stock_quantity}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock_quantity <= 0}
                              size="sm"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add to Cart
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
                  <p className="text-gray-600">
                    {searchTerm || selectedCategory 
                      ? 'Try adjusting your search or filters' 
                      : 'No products available at the moment'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl">
              <CartSummary
                cartItems={cartItems}
                totalPrice={getTotalPrice()}
                totalItems={getTotalItems()}
                onCheckout={handleCheckout}
                isLoggedIn={!!user}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Shop;
