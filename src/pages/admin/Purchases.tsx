import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Eye, Package, Clock, CheckCircle, XCircle, Truck, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const Purchases = () => {
  const { orders, customers, isLoading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Add debugging
  useEffect(() => {
    console.log('Purchases page - Orders data:', orders);
    console.log('Purchases page - Orders count:', orders.length);
    console.log('Purchases page - Is loading:', isLoading);
  }, [orders, isLoading]);

  // Filter orders
  const filteredOrders = orders.filter(order =>
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerPhone.includes(searchTerm) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'outline', icon: Clock, color: 'text-yellow-600' },
      confirmed: { variant: 'secondary', icon: CheckCircle, color: 'text-blue-600' },
      shipped: { variant: 'secondary', icon: Truck, color: 'text-purple-600' },
      delivered: { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      cancelled: { variant: 'destructive', icon: XCircle, color: 'text-red-600' },
      refunded: { variant: 'outline', icon: XCircle, color: 'text-gray-600' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCustomerByCode = (code: string | undefined) => {
    if (!code) return null;
    return customers.find(c => c.code === code);
  };

  const getDeliveryAddress = (order: any) => {
    // Priority: order's delivery address, then customer's stored address, then pincode, then fallback
    return order.deliveryAddress || 
           getCustomerByCode(order.customerCode)?.address || 
           (order.pincode ? `Pincode: ${order.pincode}` : 'No address provided');
  };

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const calculateSubtotal = (products: any[]) => {
    return products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase History</h1>
          <p className="text-muted-foreground">
            View all customer orders and purchase history ({orders.length} orders found)
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-6">
          <p>Loading orders...</p>
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <p>No orders found in the database.</p>
          <p className="text-sm mt-2">This might indicate a data fetching issue.</p>
        </div>
      )}

      {!isLoading && orders.length > 0 && (
        <>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name, phone, order ID, or customer code..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Customer Code</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Delivery Address</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Points Earned</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const customer = getCustomerByCode(order.customerCode);
                    const deliveryAddress = getDeliveryAddress(order);
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{order.customerName}</span>
                            {customer && (
                              <Badge variant="outline" className="text-xs w-fit">
                                {customer.tier}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono">
                            {order.customerCode || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.customerPhone}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 max-w-[200px]">
                            <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span className="text-sm truncate" title={deliveryAddress}>
                              {deliveryAddress}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-500" />
                            <span>{order.products.length} item(s)</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">₹{order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-green-600 font-medium">₹{order.amountPaid.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-blue-600 font-medium">₹{order.points}</span>
                            {order.isPointsAwarded && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                                Awarded
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">
                              {format(new Date(order.orderDate), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openOrderDetails(order)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-6 text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Complete information about this order
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {selectedOrder.customerName}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {selectedOrder.customerPhone}
                    </div>
                    <div>
                      <span className="font-medium">Customer Code:</span> 
                      <Badge variant="secondary" className="ml-2">
                        {selectedOrder.customerCode || 'N/A'}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Delivery Address:</span>
                      <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span>{getDeliveryAddress(selectedOrder)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Order Date:</span> {format(new Date(selectedOrder.orderDate), 'MMM dd, yyyy HH:mm')}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> 
                      <span className="ml-2">{getStatusBadge(selectedOrder.status)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Payment Method:</span> {selectedOrder.paymentMethod.toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium">Pincode:</span> {selectedOrder.pincode}
                    </div>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="font-semibold mb-2">Products Ordered</h3>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.products.map((product: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>₹{product.price.toFixed(2)}</TableCell>
                          <TableCell>{product.quantity}</TableCell>
                          <TableCell>₹{(product.price * product.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="border rounded-md p-4 bg-gray-50">
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{calculateSubtotal(selectedOrder.products).toFixed(2)}</span>
                  </div>
                  {selectedOrder.pointsUsed > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Points Used:</span>
                      <span>-₹{selectedOrder.pointsUsed.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total Amount:</span>
                    <span>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>Amount Paid:</span>
                    <span>₹{selectedOrder.amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-blue-600">
                    <span>Points Earned:</span>
                    <span>₹{selectedOrder.points} {selectedOrder.isPointsAwarded ? '(Awarded)' : '(Pending)'}</span>
                  </div>
                </div>
              </div>

              {/* MLM Distribution Log */}
              {selectedOrder.mlmDistributionLog && selectedOrder.mlmDistributionLog.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">MLM Distribution Log</h3>
                  <div className="bg-gray-50 p-3 rounded-md text-sm">
                    {selectedOrder.mlmDistributionLog.map((log: string, index: number) => (
                      <div key={index}>{log}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Purchases;
