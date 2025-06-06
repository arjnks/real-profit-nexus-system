
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { User, Phone, CreditCard, Trophy, Mail } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const { customers } = useData();

  if (!user || user.role !== 'customer') {
    return <Layout><div>Access denied</div></Layout>;
  }

  const customer = customers.find(c => c.id === user.id);

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-lg font-semibold">{customer?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  {customer?.phone}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Member Since</label>
                <p>{customer?.joinedDate ? new Date(customer.joinedDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                Membership Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Customer Code</label>
                <p className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  {customer?.code}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Current Tier</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getTierColor(customer?.tier || 'Bronze')}`}>
                  {customer?.tier}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Spent</label>
                <p className="text-lg font-semibold">₹{customer?.totalSpent?.toFixed(2) || '0.00'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button asChild variant="outline">
                <Link to="/shop">Continue Shopping</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/orders">View Orders</Link>
              </Button>
              <Button asChild variant="outline">
                <a href="mailto:werealprofit@gmail.com">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </a>
              </Button>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="destructive" onClick={logout}>
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
