
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Eye, Gift, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Requests = () => {
  const { customers, orders, updateCustomer, updateOrder, awardPoints, calculatePointsForProduct } = useData();
  const [filterType, setFilterType] = useState('all');
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);

  // Get pending orders - using correct field name
  const pendingOrders = orders.filter(order => order.isPendingApproval);
  
  // Get pending customers
  const pendingCustomers = customers.filter(customer => customer.isPending);

  // Filter orders based on filter
  const filteredOrders = filterType === 'all' 
    ? pendingOrders 
    : pendingOrders.filter(order => order.paymentMethod === filterType);

  // Get the currently viewed order details
  const viewedOrder = viewOrderId ? orders.find(order => order.id === viewOrderId) : null;

  // Helper function to get delivery address
  const getDeliveryAddress = (order: any) => {
    const customer = customers.find(c => c.id === order.customerId);
    
    console.log('Order delivery address:', order.deliveryAddress);
    console.log('Customer address:', customer?.address);
    console.log('Order pincode:', order.pincode);
    
    if (order.deliveryAddress) {
      return order.deliveryAddress;
    }
    
    if (customer?.address) {
      return customer.address;
    }
    
    if (order.pincode) {
      return `Pincode: ${order.pincode}`;
    }
    
    return 'No address provided';
  };

  // Calculate actual points that will be awarded after accumulation
  const calculateActualPointsAwarded = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    const customer = customers.find(c => c.id === order?.customerId);
    
    if (!order || !customer) return { pointMoney: 0, actualPoints: 0, remainingMoney: 0 };
    
    const pointMoney = order.points; // This is the point money from the order
    const totalAccumulated = customer.accumulatedPointMoney + pointMoney;
    const actualPoints = Math.floor(totalAccumulated / 5);
    const remainingMoney = totalAccumulated % 5;
    
    return { pointMoney, actualPoints, remainingMoney };
  };

  // Handle order approval - using correct snake_case field names
  const handleApproveOrder = (orderId: string) => {
    updateOrder(orderId, { 
      is_pending_approval: false, 
      status: 'confirmed'
    });
    toast.success('Order approved successfully');
  };

  // Handle order rejection - using correct snake_case field names
  const handleRejectOrder = (orderId: string) => {
    updateOrder(orderId, { 
      is_pending_approval: false, 
      status: 'cancelled'
    });
    toast.success('Order rejected successfully');
  };

  // Handle delivery confirmation and points awarding - using correct snake_case field names
  const handleConfirmDelivery = (orderId: string) => {
    const order = orders.find(order => order.id === orderId);
    if (order && !order.isPointsAwarded) {
      // Award the point money (which will handle accumulation and conversion)
      awardPoints(order.customerId, order.points);
      
      // Update order status - using correct snake_case field names
      updateOrder(orderId, { 
        status: 'delivered',
        is_points_awarded: true,
        delivery_approved: true 
      });
      
      const { pointMoney, actualPoints, remainingMoney } = calculateActualPointsAwarded(orderId);
      
      toast.success(`Delivery confirmed! Customer earned ${actualPoints} points from ₹${pointMoney} point money. ₹${remainingMoney} remains for next purchase.`);
    }
  };

  // Handle customer approval - using correct snake_case field names
  const handleApproveCustomer = (customerId: string) => {
    updateCustomer(customerId, { is_pending: false });
    toast.success('Customer approved successfully');
  };

  // Handle customer rejection
  const handleRejectCustomer = (customerId: string) => {
    // In a real app, you might want to delete the customer or mark them as rejected
    toast.success('Customer rejected successfully');
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Pending Requests</h1>
        <p className="text-muted-foreground">
          Manage pending order requests and customer registrations
        </p>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="orders" className="text-base">
            Order Requests ({pendingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="customers" className="text-base">
            Customer Registrations ({pendingCustomers.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders">
          <div className="mb-4 flex justify-end">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Types</SelectItem>
                <SelectItem value="cod">Cash on Delivery</SelectItem>
                <SelectItem value="upi">UPI Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Point Money</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivery Address</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const { actualPoints, remainingMoney } = calculateActualPointsAwarded(order.id);
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          {order.customerName}
                          <div className="text-xs text-muted-foreground">{order.customerCode}</div>
                        </TableCell>
                        <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            ₹{order.points}
                            <div className="text-xs text-green-600">
                              Will award: {actualPoints} points
                            </div>
                            {remainingMoney > 0 && (
                              <div className="text-xs text-orange-600">
                                Remaining: ₹{remainingMoney}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.paymentMethod === 'cod' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI Payment'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="text-sm truncate" title={getDeliveryAddress(order)}>
                            {getDeliveryAddress(order)}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setViewOrderId(order.id)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            
                            {order.isPendingApproval && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-600"
                                  onClick={() => handleApproveOrder(order.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="sr-only">Approve</span>
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600"
                                  onClick={() => handleRejectOrder(order.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                  <span className="sr-only">Reject</span>
                                </Button>
                              </>
                            )}
                            
                            {order.status === 'confirmed' && !order.isPointsAwarded && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-purple-600"
                                onClick={() => handleConfirmDelivery(order.id)}
                                title="Confirm Delivery & Award Points"
                              >
                                <Gift className="h-4 w-4" />
                                <span className="sr-only">Confirm Delivery</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                      No pending order requests
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="customers">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Parent Code</TableHead>
                  <TableHead>Date Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingCustomers.length > 0 ? (
                  pendingCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.code}</TableCell>
                      <TableCell>{customer.parentCode || 'N/A'}</TableCell>
                      <TableCell>{new Date(customer.joinedDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600"
                            onClick={() => handleApproveCustomer(customer.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span className="sr-only">Approve</span>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                            onClick={() => handleRejectCustomer(customer.id)}
                          >
                            <XCircle className="h-4 w-4" />
                            <span className="sr-only">Reject</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No pending customer registrations
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Order Details Dialog */}
      <Dialog open={!!viewOrderId} onOpenChange={(open) => !open && setViewOrderId(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details - {viewedOrder?.id}</DialogTitle>
            <DialogDescription>
              Review the order details and point allocation
            </DialogDescription>
          </DialogHeader>
          
          {viewedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground">Customer Information</h3>
                  <p className="font-medium">{viewedOrder.customerName}</p>
                  <p className="text-sm">{viewedOrder.customerCode}</p>
                  <p className="text-sm">{viewedOrder.customerPhone}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Delivery Information</h3>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-blue-900">{getDeliveryAddress(viewedOrder)}</p>
                        <p className="text-sm text-blue-700 mt-1">Pincode: {viewedOrder.pincode}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Order Items</h3>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewedOrder.products.map((product) => (
                        <TableRow key={product.productId}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell className="text-right">₹{product.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{product.quantity}</TableCell>
                          <TableCell className="text-right">₹{(product.price * product.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-semibold">Total:</TableCell>
                        <TableCell className="text-right font-semibold">₹{viewedOrder.totalAmount.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Reward Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm">Point Money Earned:</p>
                    <p className="font-medium text-green-600">₹{viewedOrder.points}</p>
                  </div>
                  <div>
                    <p className="text-sm">Actual Points Awarded:</p>
                    <p className="font-medium text-blue-600">
                      {calculateActualPointsAwarded(viewedOrder.id).actualPoints} points
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">Remaining Money:</p>
                    <p className="font-medium text-orange-600">
                      ₹{calculateActualPointsAwarded(viewedOrder.id).remainingMoney}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Payment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm">Payment Method:</p>
                    <p className="font-medium">
                      {viewedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI Payment'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">Status:</p>
                    <p className="font-medium">{viewedOrder.status}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setViewOrderId(null)}
              >
                Close
              </Button>
            </div>
            
            <div className="flex gap-2">
              {viewedOrder && viewedOrder.isPendingApproval && (
                <>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      handleRejectOrder(viewedOrder.id);
                      setViewOrderId(null);
                    }}
                  >
                    Reject Order
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      handleApproveOrder(viewedOrder.id);
                      setViewOrderId(null);
                    }}
                  >
                    Approve Order
                  </Button>
                </>
              )}
              
              {viewedOrder && viewedOrder.status === 'confirmed' && !viewedOrder.isPointsAwarded && (
                <Button 
                  onClick={() => {
                    handleConfirmDelivery(viewedOrder.id);
                    setViewOrderId(null);
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Gift className="mr-2 h-4 w-4" />
                  Confirm Delivery & Award Points
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Requests;
