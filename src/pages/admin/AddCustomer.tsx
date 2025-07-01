
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { ArrowLeft, UserPlus } from 'lucide-react';
import bcrypt from 'bcryptjs';

const AddCustomer = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    password: '',
    code: '',
    parentCode: '',
    isReserved: false,
    isPending: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { addCustomer, customers, getNextAvailableCode } = useData();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name || !formData.phone) {
        setError('Name and phone are required');
        setIsLoading(false);
        return;
      }

      // Check if phone number already exists
      const existingCustomer = customers.find(c => c.phone === formData.phone);
      if (existingCustomer) {
        setError('Phone number already exists');
        setIsLoading(false);
        return;
      }

      // Check if code already exists (if provided)
      if (formData.code) {
        const existingCode = customers.find(c => c.code === formData.code);
        if (existingCode) {
          setError('Customer code already exists');
          setIsLoading(false);
          return;
        }
      }

      // Validate parent code if provided
      if (formData.parentCode && formData.parentCode !== 'A100') {
        const parentExists = customers.find(c => c.code === formData.parentCode);
        if (!parentExists) {
          setError('Invalid parent code');
          setIsLoading(false);
          return;
        }
      }

      // Generate code if not provided
      const customerCode = formData.code || getNextAvailableCode();

      // Hash password if provided
      let passwordHash = undefined;
      if (formData.password) {
        passwordHash = await bcrypt.hash(formData.password, 10);
      }

      console.log('Adding customer with code:', customerCode);

      // Create customer data using snake_case field names
      const customerData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address || '',
        code: customerCode,
        parent_code: formData.parentCode === 'A100' ? null : formData.parentCode || null,
        is_reserved: formData.isReserved,
        is_pending: formData.isPending,
        password_hash: passwordHash,
        points: 0,
        tier: 'Bronze' as const,
        joined_date: new Date().toISOString(),
        total_spent: 0,
        monthly_spent: {},
        accumulated_point_money: 0
      };

      const customerId = await addCustomer(customerData);
      
      if (customerId) {
        toast.success('Customer added successfully!');
        navigate('/admin/customers');
      } else {
        setError('Failed to add customer');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      setError('An error occurred while adding the customer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/customers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Add New Customer</h1>
            <p className="text-muted-foreground">Create a new customer account</p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Customer Code</Label>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="Leave empty to auto-generate"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Next available: {getNextAvailableCode()}
                  </p>
                </div>
                <div>
                  <Label htmlFor="parentCode">Parent Code</Label>
                  <Input
                    id="parentCode"
                    name="parentCode"
                    value={formData.parentCode}
                    onChange={handleInputChange}
                    placeholder="Optional parent code"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password (Optional)</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Leave empty for no password"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isReserved"
                    checked={formData.isReserved}
                    onChange={handleInputChange}
                  />
                  Reserved
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isPending"
                    checked={formData.isPending}
                    onChange={handleInputChange}
                  />
                  Pending
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Customer'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/admin/customers')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AddCustomer;
