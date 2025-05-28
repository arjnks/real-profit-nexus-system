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
import { CheckCircle, XCircle, Eye } from 'lucide-react';
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
  const { customers, orders, updateCustomer, updateOrder } = useData();
  const [filterType, setFilterType] = useState('all');
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);

  // Get pending orders
  const pendingOrders = orders.filter(order => order.isPendingApproval);
  
  // Get pending customers
  const pendingCustomers = customers.filter(customer => customer.isPending);

  // Filter orders based on filter
  const filteredOrders = filterType === 'all' 
    ? pendingOrders 
    : pendingOrders.filter(order => order.paymentMethod === filterType);

  // Get the currently viewed order details
  const viewedOrder = viewOrderId ? orders.find(order => order.id === viewOrderId) : null;

  // Handle order approval
  const handleApproveOrder = (orderId: string) => {
    updateOrder(orderId, { 
      isPendingApproval: false, 
      status: 'confirmed'
    });
    toast.success('Order approved successfully');
  };

  // Handle order rejection
  const handleRejectOrder = (orderId: string) => {
    updateOrder(orderId, { 
      isPendingApproval: false, 
      status: 'cancelled'
    });
    toast.success('Order rejected successfully');
  };

  // Handle points approval
  const handleApprovePoints = (orderId: string) => {
    const order = orders.find(order => order.id === orderId);
    if (order) {
      // Award points to customer
      const customer = customers.find(c => c.id === order.customerId);
      if (customer) {
        updateCustomer(customer.id, { 
          points: customer.points + order.points 
        });
      }
      // Mark points as awarded
      updateOrder(orderId, { isPointsAwarded: true });
      toast.success('Points awarded successfully');
    }
  };

  // Handle customer approval
  const handleApproveCustomer = (customerId: string) => {
    updateCustomer(customerId, { isPending: false });
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
                  <TableHead>Points</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        {order.customerName}
                        <div className="text-xs text-muted-foreground">{order.customerCode}</div>
                      </TableCell>
                      <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>{order.points}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.paymentMethod === 'cod' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI Payment'}
                        </span>
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
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
              Review the order details before approving or rejecting
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
                  <h3 className="text-sm font-semibold text-muted-foreground">Delivery Information</h3>
                  <p className="text-sm">Pincode: {viewedOrder.pincode}</p>
                  <p className="text-xs text-green-600 mt-1">Delivery Available</p>
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
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Payment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm">Payment Method:</p>
                    <p className="font-medium">
                      {viewedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI Payment'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">Reward Points:</p>
                    <p className="font-medium">{viewedOrder.points} points</p>
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
              
              {viewedOrder && !viewedOrder.isPointsAwarded && viewedOrder.status === 'delivered' && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    handleApprovePoints(viewedOrder.id);
                    setViewOrderId(null);
                  }}
                >
                  Award Points
                </Button>
              )}
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
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Requests;
