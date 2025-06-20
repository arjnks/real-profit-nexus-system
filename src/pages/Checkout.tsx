
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Minus, Plus, ShoppingBag, CreditCard, Truck } from 'lucide-react';

const Checkout = () => {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const { addOrder, customers } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    pincode: '',
    address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [pointsToUse, setPointsToUse] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const customer = customers.find(c => c.id === user?.id || c.phone === user?.phone);
  const availablePoints = customer?.points || 0;
  const totalPrice = getTotalPrice();
  const maxPointsUsable = Math.min(availablePoints, Math.floor(totalPrice * 0.5)); // Max 50% of total
  const pointDiscount = pointsToUse * 1; // 1 rupee per point
  const finalAmount = Math.max(0, totalPrice - pointDiscount);

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-4">Add some products to your cart to proceed with checkout.</p>
          <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!customerInfo.name || !customerInfo.phone || !customerInfo.pincode) {
        toast.error('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      const orderData = {
        customerId: customer?.id || '',
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerCode: customer?.code || '',
        products: items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: finalAmount,
        pointsUsed: pointsToUse,
        amountPaid: finalAmount,
        points: Math.floor(finalAmount * 0.1), // 10% points
        status: 'pending' as const,
        paymentMethod,
        pincode: customerInfo.pincode,
        deliveryAddress: customerInfo.address,
        isPendingApproval: true,
        isPointsAwarded: false,
        deliveryApproved: false,
        pointsApproved: false
      };

      const orderId = await addOrder(orderData);
      
      if (orderId) {
        clearCart();
        toast.success('Order placed successfully!');
        navigate('/orders');
      } else {
        toast.error('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('An error occurred while placing your order.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  {pointsToUse > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Points Discount ({pointsToUse} points):</span>
                      <span>-₹{pointDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₹{finalAmount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!user && (
                    <Alert>
                      <AlertDescription>
                        Please login to proceed with checkout or fill in your details below.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={customerInfo.pincode}
                      onChange={(e) => setCustomerInfo({...customerInfo, pincode: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Delivery Address</Label>
                    <Input
                      id="address"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                      placeholder="Optional delivery address"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Points Usage */}
              {user && availablePoints > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Use Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        You have {availablePoints} points available. You can use up to {maxPointsUsable} points for this order.
                      </p>
                      <div>
                        <Label htmlFor="points">Points to use</Label>
                        <Input
                          id="points"
                          type="number"
                          min="0"
                          max={maxPointsUsable}
                          value={pointsToUse}
                          onChange={(e) => setPointsToUse(Math.min(maxPointsUsable, parseInt(e.target.value) || 0))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                      />
                      Cash on Delivery
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'upi')}
                      />
                      UPI Payment
                    </label>
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Placing Order...' : `Place Order - ₹${finalAmount}`}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
