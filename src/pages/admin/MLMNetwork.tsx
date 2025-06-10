
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Users, TrendingUp, Network, DollarSign, Target, ChevronDown, ChevronRight } from 'lucide-react';

const MLMNetwork = () => {
  const { customers, getDownlineStructure, getMLMStatistics, getMLMCommissionStructure } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);

  // Filter customers for search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get commission statistics
  const totalCustomers = customers.length;
  const totalCommissions = customers.reduce((sum, c) => sum + c.totalCommissions, 0);
  const activeReferrers = customers.filter(c => c.directReferrals.length > 0).length;
  const currentMonth = new Date().toISOString().substring(0, 7);
  const monthlyCommissions = customers.reduce((sum, c) => sum + (c.monthlyCommissions[currentMonth] || 0), 0);

  // Toggle node expansion
  const toggleNode = (code: string) => {
    setExpandedNodes(prev => 
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  // Render network tree
  const renderNetworkNode = (node: any, level = 0) => {
    if (!node || level > 6) return null;
    
    const isExpanded = expandedNodes.includes(node.code);
    const hasChildren = node.children && node.children.length > 0;
    const stats = getMLMStatistics(node.code);
    
    return (
      <div key={node.code} className="mb-1">
        <div 
          className={`flex items-center p-3 rounded-md hover:bg-gray-50 border-l-4 ${
            level === 0 ? 'border-l-blue-500 bg-blue-50' :
            level === 1 ? 'border-l-green-500' :
            level === 2 ? 'border-l-yellow-500' :
            level === 3 ? 'border-l-orange-500' :
            level === 4 ? 'border-l-red-500' :
            'border-l-purple-500'
          }`}
          style={{ marginLeft: `${level * 20}px` }}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 mr-2"
              onClick={() => toggleNode(node.code)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {!hasChildren && <div className="w-8"></div>}
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{node.name}</span>
                  <Badge variant="outline">{node.code}</Badge>
                  <Badge variant={node.tier === 'Diamond' ? 'default' : 'secondary'}>
                    {node.tier}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Level {level + 1}
                  </Badge>
                </div>
                <div className="flex gap-4 text-xs text-gray-600 mt-1">
                  <span>Direct: {stats.directReferrals}/5</span>
                  <span>Downline: {stats.totalDownline}</span>
                  <span>Monthly: ₹{stats.monthlyCommissions.toFixed(2)}</span>
                  <span>Total: ₹{stats.totalCommissions.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {node.children.map((child: any) => renderNetworkNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">MLM Network Management</h1>
        <p className="text-muted-foreground">
          Complete view of the multi-level marketing network structure and commission distribution.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {activeReferrers} active referrers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{monthlyCommissions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              This month's total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalCommissions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Depth</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">
              Maximum levels
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="network" className="space-y-4">
        <TabsList>
          <TabsTrigger value="network">Network Structure</TabsTrigger>
          <TabsTrigger value="commissions">Commission Structure</TabsTrigger>
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>MLM Network Tree</CardTitle>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search member to view their network..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setExpandedNodes(prev => 
                    prev.length > 0 ? [] : customers.map(c => c.code)
                  )}
                >
                  {expandedNodes.length > 0 ? 'Collapse All' : 'Expand All'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {searchTerm && filteredCustomers.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Select a member to view their network:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {filteredCustomers.slice(0, 6).map(customer => (
                      <Button
                        key={customer.id}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCustomer(customer.code);
                          setExpandedNodes([customer.code]);
                        }}
                        className="justify-start"
                      >
                        {customer.name} ({customer.code})
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="border rounded-md p-4 max-h-[600px] overflow-auto">
                {selectedCustomer ? (
                  (() => {
                    const structure = getDownlineStructure(selectedCustomer);
                    return structure ? renderNetworkNode(structure) : (
                      <p className="text-center py-4 text-muted-foreground">
                        No network data found for selected member.
                      </p>
                    );
                  })()
                ) : (
                  <div className="text-center py-8">
                    <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Search for a member above to view their complete network structure.
                    </p>
                    <p className="text-sm text-gray-500">
                      The network shows up to 6 levels with maximum 5 direct referrals per member.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Level</TableHead>
                    <TableHead>Commission Rate</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Example on ₹1000 Purchase</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4, 5, 6].map(level => {
                    const rate = getMLMCommissionStructure(level);
                    return (
                      <TableRow key={level}>
                        <TableCell>
                          <Badge variant={level === 1 ? 'default' : 'outline'}>
                            Level {level}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {(rate * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          {level === 1 ? 'Direct Referrals' : `${level}${level === 2 ? 'nd' : level === 3 ? 'rd' : 'th'} Level Down`}
                        </TableCell>
                        <TableCell className="text-green-600 font-medium">
                          ₹{(1000 * rate).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <h4 className="font-medium text-blue-900 mb-2">Commission Rules:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Commissions are calculated on the actual amount paid by customers</li>
                  <li>• Each member can have maximum 5 direct referrals</li>
                  <li>• Network extends to 6 levels maximum</li>
                  <li>• Commissions are automatically converted to mini coins and points</li>
                  <li>• All commission tracking is hidden from customers</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Direct Referrals</TableHead>
                    <TableHead>Total Downline</TableHead>
                    <TableHead>Monthly Commissions</TableHead>
                    <TableHead>Total Commissions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers
                    .filter(c => c.totalCommissions > 0)
                    .sort((a, b) => b.totalCommissions - a.totalCommissions)
                    .slice(0, 10)
                    .map(customer => {
                      const stats = getMLMStatistics(customer.code);
                      return (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{customer.code}</Badge>
                          </TableCell>
                          <TableCell>{stats.directReferrals}/5</TableCell>
                          <TableCell>{stats.totalDownline}</TableCell>
                          <TableCell className="text-green-600">
                            ₹{stats.monthlyCommissions.toFixed(2)}
                          </TableCell>
                          <TableCell className="font-medium text-green-600">
                            ₹{stats.totalCommissions.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
              {customers.filter(c => c.totalCommissions > 0).length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No commission data available yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default MLMNetwork;
