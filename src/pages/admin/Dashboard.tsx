
import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  ClipboardList,
  UserPlus,
  BarChart4,
  Calendar,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const DashboardCard = ({
  title,
  value,
  description,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  color: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-4 w-4 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { customers, orders } = useData();
  
  // Calculate stats
  const totalCustomers = customers.length;
  const pendingCustomers = customers.filter(customer => customer.is_pending).length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.is_pending_approval).length;
  const totalSales = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const totalPoints = orders.reduce((sum, order) => sum + order.points, 0);
  
  // Today's date
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">{formattedDate}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link to="/admin/customers/add">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Customer
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Customers"
          value={totalCustomers}
          icon={Users}
          color="text-blue-500"
        />
        <DashboardCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingCart}
          color="text-green-500"
        />
        <DashboardCard
          title="Total Sales"
          value={`₹${totalSales.toFixed(2)}`}
          icon={DollarSign}
          color="text-yellow-500"
        />
        <DashboardCard
          title="Total Points Awarded"
          value={totalPoints}
          icon={TrendingUp}
          color="text-purple-500"
        />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-4">
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button asChild variant="outline" className="h-auto py-4 justify-start">
                <Link to="/admin/purchases" className="flex flex-col items-center text-center">
                  <ShoppingCart className="h-6 w-6 mb-2" />
                  <span>New Purchase</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 justify-start">
                <Link to="/admin/customers/add" className="flex flex-col items-center text-center">
                  <UserPlus className="h-6 w-6 mb-2" />
                  <span>Add Customer</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 justify-start">
                <Link to="/admin/sales-dashboard" className="flex flex-col items-center text-center">
                  <BarChart4 className="h-6 w-6 mb-2" />
                  <span>Sales Dashboard</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 justify-start">
                <Link to="/admin/leaderboard" className="flex flex-col items-center text-center">
                  <Trophy className="h-6 w-6 mb-2" />
                  <span>Leaderboard</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>
              {pendingCustomers} customer registrations and {pendingOrders} orders pending approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingCustomers > 0 && (
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-md border border-yellow-200">
                  <div>
                    <h4 className="font-medium text-yellow-800">Customer Registrations</h4>
                    <p className="text-sm text-yellow-700">
                      {pendingCustomers} registrations awaiting approval
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/admin/customers">Review</Link>
                  </Button>
                </div>
              )}
              
              {pendingOrders > 0 && (
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md border border-blue-200">
                  <div>
                    <h4 className="font-medium text-blue-800">Order Approvals</h4>
                    <p className="text-sm text-blue-700">
                      {pendingOrders} orders awaiting approval
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/admin/requests">Review</Link>
                  </Button>
                </div>
              )}
              
              {pendingCustomers === 0 && pendingOrders === 0 && (
                <div className="p-3 bg-green-50 rounded-md border border-green-200">
                  <p className="text-green-700 text-center">
                    No pending approvals at the moment
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <h4 className="font-medium">{order.customer_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Order #{order.id} - ₹{order.total_amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(order.order_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
