
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ShoppingCart, CreditCard } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addOrder, customers, calculateTierBenefits } = useData();
  
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [usePoints, setUsePoints] = useState(false);
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
  const subtotal = cart.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
  
  // Calculate points discount if using points
  let pointsDiscount = 0;
  if (usePoints && customer) {
    const tierBenefit = calculateTierBenefits(customer.tier);
    const maxPointsUsable = Math.floor((subtotal * tierBenefit) / 100);
    pointsDiscount = Math.min(maxPointsUsable, customer.points);
  }

  const totalAmount = subtotal - pointsDiscount;

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
      const orderProducts = cart.map((item: any) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }));

      const orderId = addOrder({
        customerId: user.id,
        customerName: customer?.name || user.name || '',
        customerPhone: customer?.phone || '',
        customerCode: customer?.code || '',
        products: orderProducts,
        totalAmount: subtotal,
        pointsUsed: pointsDiscount,
        amountPaid: totalAmount,
        status: 'pending',
        paymentMethod,
        pincode: pincode.trim(),
        usedPointsDiscount: pointsDiscount > 0
      });

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
                {cart.map((item: any) => (
                  <div key={item.product.id} className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Points Discount:</span>
                      <span>-₹{pointsDiscount.toFixed(2)}</span>
                    </div>
                  )}
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
                      ✓ Delivery available • UPI: deepchandran911@okaxis
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
                  <Select value={paymentMethod} onValueChange={(value: 'cod' | 'upi') => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cod">Cash on Delivery</SelectItem>
                      <SelectItem value="upi">UPI Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {customer && customer.points > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="usePoints"
                        checked={usePoints}
                        onChange={(e) => setUsePoints(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="usePoints" className="text-sm">
                        Use available points ({customer.points} points available)
                      </Label>
                    </div>
                    {usePoints && (
                      <p className="text-xs text-gray-500">
                        You can use up to ₹{Math.min(Math.floor((subtotal * calculateTierBenefits(customer.tier)) / 100), customer.points)} from your points balance
                      </p>
                    )}
                  </div>
                )}
                
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
