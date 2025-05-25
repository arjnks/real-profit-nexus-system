
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const EditCustomer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, updateCustomer } = useData();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [points, setPoints] = useState(0);
  const [tier, setTier] = useState('Bronze');
  const [parentCode, setParentCode] = useState('');
  const [isReserved, setIsReserved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Find the customer
  useEffect(() => {
    if (id) {
      const customer = customers.find(c => c.id === id);
      if (customer) {
        setName(customer.name);
        setPhone(customer.phone);
        setCode(customer.code);
        setPoints(customer.points);
        setTier(customer.tier);
        setParentCode(customer.parentCode || 'A100');
        setIsReserved(customer.isReserved || false);
      } else {
        toast.error('Customer not found');
        navigate('/admin/customers');
      }
    }
  }, [id, customers, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setIsLoading(true);
    
    try {
      // Validate parent code exists if not A100
      if (parentCode !== 'A100') {
        const parentExists = customers.some(c => c.code === parentCode);
        if (!parentExists) {
          toast.error(`Parent code ${parentCode} doesn't exist`);
          setIsLoading(false);
          return;
        }
      }
      
      // Update the customer
      updateCustomer(id, {
        name,
        phone,
        code,
        points,
        tier: tier as "Bronze" | "Silver" | "Gold" | "Diamond",
        parentCode: parentCode === 'A100' ? null : parentCode,
        isReserved,
      });
      
      toast.success('Customer updated successfully!');
      navigate('/admin/customers');
    } catch (error) {
      toast.error('Failed to update customer');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Edit Customer</h1>
        <p className="text-muted-foreground">Update customer details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
          <CardDescription>
            Update the details of the customer. Changes may affect their position in the MLM tree.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="edit-customer-form" onSubmit={handleSubmit} className="space-y-6">
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
                <Label htmlFor="code">Customer Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Changing the code may affect the MLM structure
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  min="0"
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will automatically update their tier
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tier">Tier</Label>
                <Select value={tier} onValueChange={setTier}>
                  <SelectTrigger id="tier">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bronze">Bronze</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Diamond">Diamond</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="parentCode">Parent Code</Label>
                <Select value={parentCode} onValueChange={setParentCode}>
                  <SelectTrigger id="parentCode">
                    <SelectValue placeholder="Select parent code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A100">A100 - Admin</SelectItem>
                    {customers
                      .filter(c => c.id !== id) // Filter out the current customer
                      .map((customer) => (
                        <SelectItem key={customer.id} value={customer.code}>
                          {customer.code} - {customer.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
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
            form="edit-customer-form"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </AdminLayout>
  );
};

export default EditCustomer;
