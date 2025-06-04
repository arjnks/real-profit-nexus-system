
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select';
import { UserPlus, Search, Edit, RefreshCw, Loader2 } from 'lucide-react';

const Customers = () => {
  const { customers: contextCustomers, isLoading } = useData();
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');

  // Force sync with localStorage and context
  useEffect(() => {
    const syncCustomers = () => {
      try {
        const storedCustomers = localStorage.getItem("realprofit_customers");
        console.log('Raw localStorage data:', storedCustomers);
        
        if (storedCustomers) {
          const parsed = JSON.parse(storedCustomers);
          console.log('Parsed customers from localStorage:', parsed);
          setCustomers(parsed);
        } else {
          console.log('No customers in localStorage');
          setCustomers([]);
        }
      } catch (error) {
        console.error('Error reading customers from localStorage:', error);
        setCustomers([]);
      }
    };

    // Initial sync
    syncCustomers();

    // Use context customers if available
    if (contextCustomers && contextCustomers.length > 0) {
      console.log('Using context customers:', contextCustomers);
      setCustomers(contextCustomers);
    }

    // Listen for localStorage changes
    const handleStorageChange = () => {
      syncCustomers();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically
    const interval = setInterval(syncCustomers, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [contextCustomers]);

  console.log('Current customers state:', customers);
  console.log('Context customers:', contextCustomers);
  console.log('Is loading:', isLoading);

  // Filter customers based on search and filters
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.phone.includes(searchTerm) ||
                          customer.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTier = filterTier === 'all' || customer.tier.toLowerCase() === filterTier.toLowerCase();
    
    return matchesSearch && matchesTier;
  });

  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    const storedCustomers = localStorage.getItem("realprofit_customers");
    console.log('Manual refresh - localStorage data:', storedCustomers);
    
    if (storedCustomers) {
      try {
        const parsed = JSON.parse(storedCustomers);
        setCustomers(parsed);
        console.log('Manual refresh - parsed customers:', parsed);
      } catch (error) {
        console.error('Error parsing customers during refresh:', error);
      }
    }
  };

  if (isLoading && customers.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading customers...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">Total: {customers.length} customers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button asChild>
            <Link to="/admin/customers/add">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Customer
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone or code..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={filterTier} onValueChange={setFilterTier}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="bronze">Bronze</SelectItem>
            <SelectItem value="silver">Silver</SelectItem>
            <SelectItem value="gold">Gold</SelectItem>
            <SelectItem value="diamond">Diamond</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.code}</TableCell>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{customer.points} points</div>
                      {customer.accumulatedPointMoney > 0 && (
                        <div className="text-xs text-orange-600">
                          +₹{customer.accumulatedPointMoney} pending
                        </div>
                      )}
                      {customer.miniCoins > 0 && (
                        <div className="text-xs text-blue-600">
                          +{customer.miniCoins} mini coins
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      customer.tier === 'Bronze' ? 'bg-amber-100 text-amber-800' :
                      customer.tier === 'Silver' ? 'bg-gray-200 text-gray-800' :
                      customer.tier === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {customer.tier}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(customer.joinedDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                      <Link to={`/admin/customers/edit/${customer.id}`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  {customers.length === 0 ? 'No customers registered yet' : 'No customers found matching your filters'}
                  <div className="text-xs mt-2">
                    Debug: {customers.length} total customers, Context: {contextCustomers.length}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
};

export default Customers;
