
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
import { Shield } from 'lucide-react';

const AddCustomer = () => {
  const navigate = useNavigate();
  const { customers, addCustomer, isAdmin } = useData();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [parentCode, setParentCode] = useState('A100');
  const [customCode, setCustomCode] = useState('');
  const [useCustomCode, setUseCustomCode] = useState(false);
  const [mlmLevel, setMlmLevel] = useState('1');
  const [tier, setTier] = useState('Bronze');
  const [isReserved, setIsReserved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if current user has admin privileges
  const hasAdminPrivileges = () => {
    // In a real app, this would check the current logged-in user
    // For now, we'll assume admin access for demonstration
    return true;
  };

  // Generate next available code
  const generateNextCode = () => {
    const activeCodes = customers
      .filter(c => c.code.startsWith('A'))
      .map(c => parseInt(c.code.substring(1)))
      .filter(num => !isNaN(num))
      .sort((a, b) => a - b);
    
    let nextNumber = 101;
    for (const num of activeCodes) {
      if (num === nextNumber) {
        nextNumber++;
      } else {
        break;
      }
    }
    
    return `A${nextNumber}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasAdminPrivileges()) {
      toast.error('Only admin (A100) can add customers');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Validate parent code exists (except for A100 which is root)
      if (parentCode !== 'A100') {
        const parentExists = customers.some(c => c.code === parentCode);
        if (!parentExists) {
          toast.error(`Parent code ${parentCode} doesn't exist`);
          setIsLoading(false);
          return;
        }
      }
      
      // Determine the code for the new customer
      let newCode: string;
      if (useCustomCode && customCode.trim()) {
        // Check if custom code already exists
        const codeExists = customers.some(c => c.code === customCode.trim().toUpperCase());
        if (codeExists) {
          toast.error(`Code ${customCode.toUpperCase()} already exists`);
          setIsLoading(false);
          return;
        }
        newCode = customCode.trim().toUpperCase();
      } else {
        newCode = generateNextCode();
      }
      
      // Calculate MLM level based on parent
      let calculatedLevel = 1;
      if (parentCode !== 'A100') {
        const parent = customers.find(c => c.code === parentCode);
        calculatedLevel = parent ? parent.mlmLevel + 1 : parseInt(mlmLevel);
      } else {
        // Admin can set any level for direct placements under A100
        calculatedLevel = parseInt(mlmLevel);
      }
      
      // Add the customer
      addCustomer({
        name,
        phone,
        code: newCode,
        parentCode: parentCode === 'A100' ? null : parentCode,
        isReserved,
        isPending: false,
        mlmLevel: calculatedLevel,
        directReferrals: [],
        totalDownlineCount: 0,
        monthlyCommissions: {},
        totalCommissions: 0,
        tier: tier as 'Bronze' | 'Silver' | 'Gold' | 'Diamond',
        points: tier === 'Bronze' ? 20 : tier === 'Silver' ? 40 : tier === 'Gold' ? 80 : 160,
      });
      
      toast.success('Customer added successfully!', {
        description: `${name} has been assigned code ${newCode} at level ${calculatedLevel}`,
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
        <p className="text-muted-foreground">Create a new customer account in the MLM system</p>
        {hasAdminPrivileges() && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center">
              <Shield className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm text-blue-800 font-medium">
                Admin Mode: You have full control over customer placement and level assignment
              </span>
            </div>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
          <CardDescription>
            Enter the details of the new customer. As admin, you can control their placement, level, and tier.
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
                    <SelectItem value="A100">A100 - System Admin (ROOT)</SelectItem>
                    {customers
                      .filter(c => c.code !== 'A100')
                      .map((customer) => (
                        <SelectItem key={customer.id} value={customer.code}>
                          {customer.code} - {customer.name} (Level {customer.mlmLevel})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  This determines the customer's position in the MLM tree.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mlmLevel">MLM Level</Label>
                <Select value={mlmLevel} onValueChange={setMlmLevel}>
                  <SelectTrigger id="mlmLevel">
                    <SelectValue placeholder="Select MLM level" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        Level {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  As admin, you can place customers at any level.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tier">Customer Tier</Label>
                <Select value={tier} onValueChange={setTier}>
                  <SelectTrigger id="tier">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bronze">Bronze (20+ points)</SelectItem>
                    <SelectItem value="Silver">Silver (40+ points)</SelectItem>
                    <SelectItem value="Gold">Gold (80+ points)</SelectItem>
                    <SelectItem value="Diamond">Diamond (160+ points)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  This determines their benefits and discount levels.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    id="useCustomCode"
                    checked={useCustomCode}
                    onChange={(e) => setUseCustomCode(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-realprofit-blue focus:ring-realprofit-blue"
                  />
                  <Label htmlFor="useCustomCode" className="text-sm font-medium">
                    Use Custom Code
                  </Label>
                </div>
                {useCustomCode && (
                  <Input
                    id="customCode"
                    placeholder="Enter custom code (e.g., A500)"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                  />
                )}
                {!useCustomCode && (
                  <p className="text-xs text-muted-foreground">
                    Next available code: {generateNextCode()}
                  </p>
                )}
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

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Admin Privileges:</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Place customers at any level in the MLM hierarchy</li>
                <li>• Assign custom codes or use auto-generated ones</li>
                <li>• Set initial tier and points for new customers</li>
                <li>• Override normal MLM level calculation rules</li>
                <li>• Create reserved codes for future use</li>
              </ul>
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
