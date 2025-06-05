
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Loader2, User, Phone, Lock, UserCheck } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    parentCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { addCustomer, customers, getNextAvailableCode } = useData();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate form data
      if (!formData.name || !formData.phone || !formData.password) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setIsLoading(false);
        return;
      }

      // Validate phone number
      if (formData.phone.length < 10) {
        setError('Please enter a valid phone number');
        setIsLoading(false);
        return;
      }

      // Check if phone number already exists
      const existingCustomer = customers.find(c => c.phone === formData.phone);
      if (existingCustomer) {
        setError('Phone number already registered');
        setIsLoading(false);
        return;
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

      // Hash password
      const bcrypt = await import('bcryptjs');
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(formData.password, saltRounds);

      // Get next available code
      const newCode = getNextAvailableCode();
      
      console.log('Registering new customer with code:', newCode);

      // Create and add customer
      const newCustomer = await addCustomer({
        name: formData.name,
        phone: formData.phone,
        code: newCode,
        parentCode: formData.parentCode === 'A100' ? null : formData.parentCode || null,
        isReserved: false,
        passwordHash: passwordHash
      });

      if (newCustomer) {
        console.log('Customer added successfully');

        // Auto-login the customer
        const loginResult = await login(formData.phone, formData.password, false);
        
        if (loginResult.success) {
          toast.success(`Registration successful! Your customer code is ${newCode}`);
          navigate('/');
        } else {
          toast.success(`Registration successful! Your customer code is ${newCode}. Please login.`);
          navigate('/login');
        }
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Join Real Profit and start earning rewards
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentCode">Parent Code (Optional)</Label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="parentCode"
                    name="parentCode"
                    type="text"
                    placeholder="Enter parent code (optional)"
                    value={formData.parentCode}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  If you were referred by someone, enter their customer code
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-realprofit-blue hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Register;
