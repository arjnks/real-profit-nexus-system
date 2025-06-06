
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Filter, Tag } from 'lucide-react';
import { toast } from 'sonner';

const Shop = () => {
  const { products, offers, customers, calculatePointsForProduct } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<{ product: any; quantity: number }[]>([]);

  // Get customer data if user is a customer
  const customer = user?.role === 'customer' && user?.id 
    ? customers.find(c => c.id === user.id) 
    : null;

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get relevant offers for the current user's tier
  const userOffers = customer?.tier
    ? offers.filter(offer => {
        const tierRanking = {
          Bronze: 1,
          Silver: 2,
          Gold: 3,
          Platinum: 4,
          Diamond: 5
        };
        const userRanking = tierRanking[customer.tier as keyof typeof tierRanking];
        const offerRanking = tierRanking[offer.minTier as keyof typeof tierRanking];
        return userRanking >= offerRanking;
      })
    : [];

  // Add to cart
  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
    toast.success(`Added ${product.name} to cart`);
  };

  // Calculate cart total using MRP
  const cartTotal = cart.reduce(
    (total, item) => total + item.product.mrp * item.quantity,
    0
  );

  // Handle checkout
  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }
    
    if (user.role !== 'customer') {
      toast.error('Only customers can place orders');
      return;
    }
    
    navigate('/checkout', { state: { cart } });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shop Products</h1>
            <p className="mt-2 text-gray-600">
              Browse our selection of quality products
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                className="pl-8 w-full md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Special Offers */}
        {userOffers.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center mb-4">
              <Tag className="h-5 w-5 mr-2 text-realprofit-blue" />
              <h2 className="text-xl font-semibold">Special Offers</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userOffers.map(offer => (
                <Card key={offer.id} className="overflow-hidden border-2 border-realprofit-blue/20">
                  <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${offer.image})` }}></div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{offer.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{offer.description}</p>
                      </div>
                      <div className="bg-realprofit-blue text-white text-sm font-bold rounded-full h-10 w-10 flex items-center justify-center">
                        {offer.discountPercentage}%
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      Valid until: {new Date(offer.validUntil).toLocaleDateString()}
                    </div>
                  </CardContent>
                  <CardFooter className="bg-realprofit-lightBlue p-4">
                    <span className="text-sm text-realprofit-blue font-medium">
                      {offer.minTier} tier and above
                    </span>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    {product.dummyPrice && (
                      <span className="text-gray-400 line-through text-sm">₹{product.dummyPrice.toFixed(2)}</span>
                    )}
                    <span className="text-realprofit-blue font-bold">₹{product.mrp.toFixed(2)}</span>
                    {product.dummyPrice && (
                      <Badge variant="destructive" className="text-xs">
                        OFFER
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    Earn ₹{calculatePointsForProduct(product.mrp || product.price, product.price)} point money
                  </span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button 
                  className="w-full"
                  onClick={() => addToCart(product)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found matching your search.</p>
          </div>
        )}

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="fixed bottom-0 right-0 mb-4 mr-4 bg-white rounded-lg shadow-lg border p-4 max-w-md w-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Cart Summary</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCart([])}
              >
                Clear
              </Button>
            </div>
            
            <div className="max-h-40 overflow-y-auto mb-3">
              {cart.map(item => (
                <div key={item.product.id} className="flex justify-between items-center mb-2">
                  <span className="text-sm">{item.product.name} × {item.quantity}</span>
                  <span className="text-sm font-medium">₹{(item.product.mrp * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center py-2 border-t">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-realprofit-blue">₹{cartTotal.toFixed(2)}</span>
            </div>
            
            <Button className="w-full mt-3" onClick={handleCheckout}>
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Shop;
