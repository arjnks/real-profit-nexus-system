
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CustomerPasswordsTable = () => {
  const { customers } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

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

  const decryptPassword = async (passwordHash: string) => {
    // For display purposes only - in real apps, passwords should never be decryptable
    // This is a simplified approach for admin access
    return passwordHash ? '••••••••' : 'No password set';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Password Management</CardTitle>
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
                <TableHead>Password Hash</TableHead>
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
                    {visiblePasswords.has(customer.id) 
                      ? customer.passwordHash?.substring(0, 60) + '...' || 'No password'
                      : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'
                    }
                  </TableCell>
                  <TableCell>
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
  );
};

export default CustomerPasswordsTable;
