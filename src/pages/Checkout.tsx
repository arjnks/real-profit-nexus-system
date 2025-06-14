
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useMLM } from '@/contexts/MLMContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ShoppingCart, CreditCard } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addOrder, customers, products } = useData();
  const { calculateMLMDistribution } = useMLM();
  
  const [pincode, setPincode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const allowedPincodes = ['680305', '680684', '680683'];

  // Get cart from location state or redirect to shop
  const cart = location.state?.cart || [];

  if (!user || user.role !== 'customer') {
    return <Layout><div>Access denied</div></Layout>;
  }

  if (cart.length === 0) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button asChild>
            <a href="/shop">Continue Shopping</a>
          </Button>
        </div>
      </Layout>
    );
  }

  // Get customer data from DataContext
  const customer = customers.find(c => c.id === user.id);
  // Use MRP (display price) for customer display
  const subtotal = cart.reduce((sum: number, item: any) => sum + (item.product.mrp * item.quantity), 0);
  const totalAmount = subtotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pincode.trim()) {
      toast.error('Please enter pincode');
      return;
    }

    if (!allowedPincodes.includes(pincode)) {
      toast.error(`Delivery not available for this pincode. Available pincodes: ${allowedPincodes.join(', ')}`);
      return;
    }

    setIsLoading(true);

    try {
      const orderProducts = cart.map((item: any) => {
        // Get the actual product data to access the real selling price
        const productData = products.find(p => p.id === item.product.id);
        return {
          productId: item.product.id,
          name: item.product.name,
          price: productData?.price || item.product.price, // Use actual selling price, not MRP
          quantity: item.quantity
        };
      });

      const orderId = await addOrder({
        customerId: user.id,
        customerName: customer?.name || user.name || '',
        customerPhone: customer?.phone || '',
        customerCode: customer?.code || '',
        products: orderProducts,
        totalAmount: subtotal, // Customer still pays MRP
        pointsUsed: 0,
        amountPaid: totalAmount, // Customer pays MRP
        points: Math.floor(totalAmount / 5), // Calculate points earned
        status: 'pending',
        paymentMethod: 'cod',
        pincode: pincode.trim(),
        isPendingApproval: true,
        isPointsAwarded: false,
        deliveryApproved: false,
        pointsApproved: false,
        usedPointsDiscount: false,
        mlmDistributionLog: []
      });

      // Trigger MLM distribution after successful order creation
      if (customer?.code && totalAmount > 0) {
        console.log(`Triggering MLM distribution for customer ${customer.code} with purchase amount ${totalAmount}`);
        await calculateMLMDistribution(customer.code, totalAmount, orderId);
        toast.success('Order placed and MLM distribution completed!');
      } else {
        toast.success('Order placed successfully!');
      }

      toast.success('Order placed successfully!', {
        description: `Order ${orderId} is now pending approval.`
      });

      navigate('/orders');
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
      console.error('Checkout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600">Complete your order</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Show customer address if available */}
                {customer?.address && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Delivery Address:</h4>
                    <p className="text-sm text-gray-600">{customer.address}</p>
                  </div>
                )}
                
                {cart.map((item: any) => (
                  <div key={item.product.id} className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium">₹{(item.product.mrp * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter pincode"
                    required
                  />
                  {allowedPincodes.includes(pincode) && (
                    <p className="text-sm text-green-600">
                      ✓ Delivery available
                    </p>
                  )}
                  {pincode && !allowedPincodes.includes(pincode) && (
                    <p className="text-sm text-red-600">
                      ✗ Delivery not available for this pincode. Available: {allowedPincodes.join(', ')}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="p-3 border rounded-md bg-gray-50">
                    <p className="text-sm font-medium">Cash on Delivery (COD)</p>
                    <p className="text-xs text-gray-600">Pay when your order is delivered</p>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !pincode || !allowedPincodes.includes(pincode)}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {isLoading ? 'Placing Order...' : `Place Order - ₹${totalAmount.toFixed(2)}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
