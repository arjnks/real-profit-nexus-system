
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select';
import { Search, Plus, Minus, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

const Purchases = () => {
  const { customers, products, addOrder } = useData();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');

  // Filter customers for search
  const filteredCustomers = customers.filter(customer => 
    !customer.isPending && (
      customer.code.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.phone.includes(customerSearch)
    )
  );

  // Add product to cart
  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      }]);
    }
  };

  // Update cart quantity
  const updateQuantity = (productId: string, change: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQuantity = item.quantity + change;
        return newQuantity <= 0 ? null : { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate how much customer can pay with points
  let pointsDiscount = 0;
  let maxPointsUsable = 0;
  if (selectedCustomer) {
    const tierBenefit = selectedCustomer.tier === 'Diamond' ? 70 :
                      selectedCustomer.tier === 'Gold' ? 30 :
                      selectedCustomer.tier === 'Silver' ? 20 : 10;
    maxPointsUsable = Math.floor((subtotal * tierBenefit) / 100);
    pointsDiscount = Math.min(maxPointsUsable, selectedCustomer.points);
  }

  const totalAmount = subtotal - pointsDiscount;

  // Handle order submission
  const handleSubmitOrder = () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }
    
    if (cart.length === 0) {
      toast.error('Please add items to cart');
      return;
    }
    
    if (!address || !pincode) {
      toast.error('Please enter address and pincode');
      return;
    }

    if (pincode !== '680305') {
      toast.error('Delivery not available for this pincode');
      return;
    }

    const orderId = addOrder({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      customerCode: selectedCustomer.code,
      products: cart,
      totalAmount: subtotal,
      pointsUsed: pointsDiscount,
      amountPaid: totalAmount,
      status: 'pending',
      paymentMethod,
      address,
      pincode,
      usedPointsDiscount: pointsDiscount > 0
    });

    toast.success(`Order ${orderId} created successfully`);
    
    // Reset form
    setCart([]);
    setAddress('');
    setPincode('');
    setSelectedCustomer(null);
    setCustomerSearch('');
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Create Purchase</h1>
        <p className="text-muted-foreground">
          Create new orders for customers
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by code, name or phone..."
                  className="pl-8"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
              </div>
              
              {customerSearch && (
                <div className="max-h-40 overflow-y-auto border rounded-md">
                  {filteredCustomers.map(customer => (
                    <div
                      key={customer.id}
                      className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setCustomerSearch('');
                      }}
                    >
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.code} • {customer.phone}</div>
                      <div className="text-xs text-gray-400">
                        {customer.tier} • {customer.points} points
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedCustomer && (
                <div className="p-3 bg-green-50 rounded-md border border-green-200">
                  <div className="font-medium text-green-800">{selectedCustomer.name}</div>
                  <div className="text-sm text-green-700">{selectedCustomer.code} • {selectedCustomer.phone}</div>
                  <div className="text-xs text-green-600">
                    {selectedCustomer.tier} • {selectedCustomer.points} points available
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Add Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {products.map(product => (
                <div key={product.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">₹{product.price}</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addToCart(product)}
                    disabled={!product.inStock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Shopping Cart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.productId} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">₹{item.price} each</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.productId, -1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="mx-2">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.productId, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <span className="ml-4 font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {selectedCustomer && pointsDiscount > 0 && (
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Details */}
      {cart.length > 0 && selectedCustomer && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address">Delivery Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter full address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter pincode"
                />
                {pincode === '680305' && (
                  <p className="text-sm text-green-600">
                    ✓ Delivery available • UPI ID: realprofit@google.pay
                  </p>
                )}
                {pincode && pincode !== '680305' && (
                  <p className="text-sm text-red-600">
                    ✗ Delivery not available for this pincode
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
              
              <div className="space-y-2">
                <Button
                  onClick={handleSubmitOrder}
                  className="w-full"
                  disabled={!pincode || pincode !== '680305'}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Create Order
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
};

export default Purchases;
