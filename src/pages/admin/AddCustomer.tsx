import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const AddCustomer = () => {
  const navigate = useNavigate();
  const { customers, addCustomer } = useData();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [parentCode, setParentCode] = useState('A100');
  const [isReserved, setIsReserved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Generate next available code
  const generateNextCode = () => {
    // For simplicity, just increment the last customer code
    const lastCustomer = customers[customers.length - 1];
    const lastCode = lastCustomer?.code || 'A100';
    const lastNumber = parseInt(lastCode.substring(1));
    return `A${lastNumber + 1}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate parent code exists
      const parentExists = customers.some(c => c.code === parentCode);
      if (!parentExists) {
        toast.error(`Parent code ${parentCode} doesn't exist`);
        setIsLoading(false);
        return;
      }
      
      // Generate a code for the new customer
      const newCode = generateNextCode();
      
      // Add the customer
      addCustomer({
        name,
        phone,
        code: newCode,
        parentCode,
        isReserved,
        isPending: false,
        mlmLevel: 1,
        directReferrals: [],
        totalDownlineCount: 0,
        monthlyCommissions: {},
        totalCommissions: 0,
      });
      
      toast.success('Customer added successfully!', {
        description: `${name} has been assigned code ${newCode}`,
      });
      
      navigate('/admin/customers');
    } catch (error) {
      toast.error('Failed to add customer');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Add New Customer</h1>
        <p className="text-muted-foreground">Create a new customer account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
          <CardDescription>
            Enter the details of the new customer. A unique code will be assigned automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="add-customer-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="parentCode">Parent Code</Label>
                <Select value={parentCode} onValueChange={setParentCode}>
                  <SelectTrigger id="parentCode">
                    <SelectValue placeholder="Select parent code" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.code}>
                        {customer.code} - {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  This determines the customer's position in the MLM tree
                </p>
              </div>
              
              <div className="space-y-2 flex items-end">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isReserved"
                    checked={isReserved}
                    onChange={(e) => setIsReserved(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-realprofit-blue focus:ring-realprofit-blue"
                  />
                  <Label htmlFor="isReserved" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Mark as Reserved Code
                  </Label>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/customers')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-customer-form"
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Customer'}
          </Button>
        </CardFooter>
      </Card>
    </AdminLayout>
  );
};

export default AddCustomer;
