
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import AdminLayout from '@/components/AdminLayout';
import CustomerPasswordsTable from '@/components/CustomerPasswordsTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, TrendingUp, Crown, Star } from 'lucide-react';

const Customers = () => {
  const { customers, isLoading } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => !c.isReserved && !c.isPending).length;
  const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const tierCounts = customers.reduce((acc, customer) => {
    acc[customer.tier] = (acc[customer.tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading customers...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="text-muted-foreground">Manage and view customer information</p>
          </div>
          <Button asChild>
            <Link to="/admin/add-customer">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Link>
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                {activeCustomers} active customers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From all customer purchases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Diamond Tier</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tierCounts.Diamond || 0}</div>
              <p className="text-xs text-muted-foreground">
                Premium customers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Spent</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{activeCustomers > 0 ? Math.round(totalSpent / activeCustomers).toLocaleString() : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Per active customer
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Customer Management Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Customer Overview</TabsTrigger>
            <TabsTrigger value="passwords">Password Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer List</CardTitle>
                <CardDescription>
                  View and manage all customers in the system
                </CardDescription>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.code}</TableCell>
                          <TableCell>{customer.name}</TableCell>
                          <TableCell>{customer.phone}</TableCell>
                          <TableCell>
                            <Badge variant={
                              customer.tier === 'Diamond' ? 'default' :
                              customer.tier === 'Gold' ? 'secondary' :
                              customer.tier === 'Silver' ? 'outline' : 'secondary'
                            }>
                              {customer.tier}
                            </Badge>
                          </TableCell>
                          <TableCell>{customer.points}</TableCell>
                          <TableCell>₹{customer.totalSpent.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={
                              customer.isReserved ? 'destructive' :
                              customer.isPending ? 'outline' : 'default'
                            }>
                              {customer.isReserved ? 'Reserved' :
                               customer.isPending ? 'Pending' : 'Active'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/admin/customers/${customer.id}/edit`}>
                                Edit
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {filteredCustomers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No customers found matching your search.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="passwords" className="space-y-4">
            <CustomerPasswordsTable />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Customers;
