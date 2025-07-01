
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const CustomerPasswordsTable = () => {
  const { customers, refreshData, isLoading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePasswordVisibility = (customerId: string) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(customerId)) {
      newVisible.delete(customerId);
    } else {
      newVisible.add(customerId);
    }
    setVisiblePasswords(newVisible);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Password Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading customers...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Customer Password Management
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or code..."
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
                <TableHead>Customer Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Password Status</TableHead>
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
                  <TableCell className="font-mono text-xs">
                    {customer.password_hash ? (
                      visiblePasswords.has(customer.id) 
                        ? customer.password_hash.substring(0, 60) + '...'
                        : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        No Password Set
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.password_hash && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePasswordVisibility(customer.id)}
                      >
                        {visiblePasswords.has(customer.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filteredCustomers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'No customers found matching your search.' : 'No customers found.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerPasswordsTable;
