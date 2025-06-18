
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { User, Phone, CreditCard, Mail, Award } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const { customers } = useData();

  if (!user || user.role !== 'customer') {
    return <Layout><div>Access denied</div></Layout>;
  }

  const customer = customers.find(c => c.id === user.id);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account information and view your rewards</p>
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
                <CreditCard className="h-5 w-5 mr-2" />
                Account Information
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
                <label className="text-sm font-medium text-gray-500">Total Spent</label>
                <p className="text-lg font-semibold">₹{customer?.totalSpent?.toFixed(2) || '0.00'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rewards Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Rewards & Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{customer?.points || 0}</div>
                <p className="text-sm font-medium text-blue-800">Total Points Earned</p>
                <p className="text-xs text-blue-600 mt-1">Earn points with every purchase!</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  ₹{((customer?.points || 0) * 5).toFixed(2)}
                </div>
                <p className="text-sm font-medium text-green-800">Points Value</p>
                <p className="text-xs text-green-600 mt-1">Each point = ₹5 discount</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button asChild variant="outline">
                <Link to="/shop">Continue Shopping</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/orders">View Orders</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/leaderboard">View Leaderboard</Link>
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
