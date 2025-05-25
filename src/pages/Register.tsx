
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select';
import { toast } from 'sonner';

const Register = () => {
  const navigate = useNavigate();
  const { customers, addCustomer } = useData();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [parentCode, setParentCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get available parent codes (customers who can have children)
  const availableParents = customers.filter(customer => !customer.isPending);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate parent code if provided
      if (parentCode && !availableParents.some(c => c.code === parentCode)) {
        toast.error('Invalid parent code selected');
        setIsLoading(false);
        return;
      }
      
      // Check if phone number already exists
      const existingCustomer = customers.find(c => c.phone === phone);
      if (existingCustomer) {
        toast.error('Phone number already registered');
        setIsLoading(false);
        return;
      }
      
      // Generate temporary code (will be replaced with real code after first order approval)
      const tempCode = `TEMP_${Date.now()}`;
      
      // Add customer as pending
      addCustomer({
        name,
        phone,
        code: tempCode,
        parentCode: parentCode || 'A100', // Default to admin if no parent selected
        isReserved: false,
        isPending: true,
      });
      
      toast.success('Registration submitted successfully!', {
        description: 'Your account will be activated after your first order is approved.',
      });
      
      navigate('/login');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-realprofit-blue">
              Join Real Profit
            </CardTitle>
            <CardDescription>
              Create your account to start shopping and earning rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full"
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
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="parentCode">Referral Code (Optional)</Label>
                <Select value={parentCode} onValueChange={setParentCode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select referral code (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableParents.map((customer) => (
                      <SelectItem key={customer.id} value={customer.code}>
                        {customer.code} - {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Enter a referral code if you were referred by an existing member
                </p>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-realprofit-blue hover:underline">
                Sign in here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default Register;
