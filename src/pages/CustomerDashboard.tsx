
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trophy, 
  CreditCard,
  Package,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Mail
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { orders, customers, offers } = useData();

  if (!user || user.role !== 'customer') {
    return <Layout><div>Access denied</div></Layout>;
  }

  // Get customer data
  const customer = customers.find(c => c.id === user.id);
  const customerOrders = orders.filter(o => o.customerId === user.id);
  
  // Get tier-based offers
  const availableOffers = offers.filter(offer => {
    const tierOrder = ['Bronze', 'Silver', 'Gold', 'Diamond'];
    const customerTierIndex = tierOrder.indexOf(customer?.tier || 'Bronze');
    const offerTierIndex = tierOrder.indexOf(offer.minTier);
    return customerTierIndex >= offerTierIndex;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'shipped': return <Truck className="h-4 w-4 text-purple-500" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'text-amber-700 bg-amber-100';
      case 'Silver': return 'text-gray-700 bg-gray-100';
      case 'Gold': return 'text-yellow-700 bg-yellow-100';
      case 'Diamond': return 'text-blue-700 bg-blue-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {customer?.name}!</h1>
          <p className="text-gray-600">Manage your orders and explore exclusive offers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCard className="h-8 w-8 text-realprofit-blue" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Customer Code</p>
                  <p className="text-lg font-semibold text-gray-900">{customer?.code}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Trophy className="h-8 w-8 text-realprofit-green" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Your Tier</p>
                  <span className={`text-lg font-semibold px-2 py-1 rounded-full text-xs ${getTierColor(customer?.tier || 'Bronze')}`}>
                    {customer?.tier}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingBag className="h-8 w-8 text-purple-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Spent</p>
                  <p className="text-lg font-semibold text-gray-900">₹{customer?.totalSpent?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {customerOrders.length > 0 ? (
                <div className="space-y-4">
                  {customerOrders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(order.status)}
                        <div>
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{order.totalAmount.toFixed(2)}</p>
                        <p className="text-sm text-gray-500 capitalize">{order.status}</p>
                      </div>
                    </div>
                  ))}
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/orders">View All Orders</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No orders yet</p>
                  <Button asChild className="mt-4">
                    <Link to="/shop">Start Shopping</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exclusive Offers */}
          <Card>
            <CardHeader>
              <CardTitle>Exclusive {customer?.tier} Offers</CardTitle>
            </CardHeader>
            <CardContent>
              {availableOffers.length > 0 ? (
                <div className="space-y-4">
                  {availableOffers.slice(0, 3).map(offer => (
                    <div key={offer.id} className="p-3 bg-gradient-to-r from-realprofit-blue/10 to-realprofit-green/10 rounded-lg border border-realprofit-blue/20">
                      <h4 className="font-medium text-realprofit-blue">{offer.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{offer.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Valid until {new Date(offer.validUntil).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  <Button asChild className="w-full">
                    <Link to="/shop">Shop Now</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No exclusive offers available</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Keep shopping to unlock better tier benefits!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button asChild variant="outline" className="h-20 flex-col">
                <Link to="/shop">
                  <ShoppingBag className="h-6 w-6 mb-2" />
                  Continue Shopping
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col">
                <Link to="/orders">
                  <Package className="h-6 w-6 mb-2" />
                  Track Orders
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col">
                <a href="mailto:werealprofit@gmail.com">
                  <Mail className="h-6 w-6 mb-2" />
                  Contact Support
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CustomerDashboard;
