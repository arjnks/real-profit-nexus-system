import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useMLM } from '@/contexts/MLMContext';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Shield, UserPlus, RefreshCw, TreePine, Play, RotateCcw, Zap } from 'lucide-react';
import { toast } from 'sonner';
import MLMTreeVisualization from '@/components/MLMTreeVisualization';

const MLMTree = () => {
  const { customers, orders, addCustomer, isAdmin, refreshData } = useData();
  const { createDummyCustomers, simulatePurchase, resetAdminPoints } = useMLM();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<string[]>(['A100']);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreatingDummies, setIsCreatingDummies] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationAmount, setSimulationAmount] = useState(150); // ₹150 = 30 points

  // Auto-refresh every 30 seconds when user is on the page
  useEffect(() => {
    const interval = setInterval(async () => {
      console.log('Auto-refreshing MLM data...');
      await refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshData]);

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      toast.success('MLM tree refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh MLM tree');
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Check if current user has admin privileges
  const hasAdminPrivileges = () => {
    return true; // For demonstration purposes
  };

  // Navigate to add customer page
  const handleAddCustomer = () => {
    navigate('/admin/customers/add');
  };

  // Create dummy customers
  const handleCreateDummies = async () => {
    setIsCreatingDummies(true);
    try {
      await resetAdminPoints();
      await createDummyCustomers();
      toast.success('Dummy customers created! Admin reset to 0 points.');
      setTimeout(() => {
        handleRefresh();
      }, 2000);
    } catch (error) {
      toast.error('Failed to create dummy customers');
      console.error('Error creating dummies:', error);
    } finally {
      setIsCreatingDummies(false);
    }
  };

  // Simulate purchase that generates 30 points
  const handleSimulatePurchase = async () => {
    setIsSimulating(true);
    try {
      // Use C001 (Alice) to make the purchase
      await simulatePurchase('C001', simulationAmount);
      toast.success(`Simulated ₹${simulationAmount} purchase by C001 (Alice) - ${Math.floor(simulationAmount / 5)} points earned!`);
      setTimeout(() => {
        handleRefresh();
      }, 3000);
    } catch (error) {
      toast.error('Failed to simulate purchase');
      console.error('Error simulating purchase:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  // Get admin's current earnings
  const getAdminEarnings = () => {
    const admin = customers.find(c => c.code === 'A100');
    return {
      points: admin?.points || 0,
      miniCoins: admin?.miniCoins || 0,
      tier: admin?.tier || 'Bronze'
    };
  };

  // Ensure A100 root customer exists
  const ensureRootCustomer = async () => {
    const rootExists = customers.find(c => c.code === 'A100');
    if (!rootExists) {
      try {
        await addCustomer({
          name: 'System Admin',
          phone: 'admin100',
          address: 'System Administrator',
          code: 'A100',
          parentCode: null,
          isReserved: false,
          isPending: false,
          mlmLevel: 1,
          directReferrals: [],
          totalDownlineCount: 0,
          monthlyCommissions: {},
          totalCommissions: 0,
        });
        toast.success('Root admin A100 created');
        await refreshData();
      } catch (error) {
        toast.error('Failed to create root admin');
        console.error('Error creating root admin:', error);
      }
    } else {
      toast.info('Root admin A100 already exists');
    }
  };

  // Get recent MLM activity
  const getRecentMLMActivity = () => {
    return orders
      .filter(order => order.isPointsAwarded && order.mlmDistributionLog && order.mlmDistributionLog.length > 0)
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 10);
  };

  // Toggle node expansion
  const toggleNode = (code: string) => {
    setExpandedNodes(prev => 
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  // Expand/collapse all nodes
  const toggleAllNodes = () => {
    if (expandedNodes.length === 1 && expandedNodes[0] === 'A100') {
      // Expand all
      setExpandedNodes(customers.map(c => c.code));
    } else {
      // Collapse all to root
      setExpandedNodes(['A100']);
    }
  };

  const recentActivity = getRecentMLMActivity();
  const adminEarnings = getAdminEarnings();

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <TreePine className="h-6 w-6 text-green-600" />
              MLM Tree Management
            </h1>
            <p className="text-muted-foreground">
              Visualize and manage the multi-level marketing structure. Each point earned by customers fills slots in the MLM levels. Points earned = slots occupied.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={handleRefresh} 
              variant="outline"
              disabled={isRefreshing}
              className="flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button onClick={handleAddCustomer} className="bg-green-600 hover:bg-green-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </div>
        {hasAdminPrivileges() && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <Shield className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-sm text-red-800 font-medium">
                Admin Mode: You have full access to modify the MLM structure
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Demo Control Panel */}
      <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            MLM Demonstration Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Current Admin Status */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Admin A100 Status</h4>
              <div className="space-y-1 text-sm">
                <div>Points: <span className="font-bold text-blue-600">{adminEarnings.points}</span></div>
                <div>Mini Coins: <span className="font-bold text-orange-600">{adminEarnings.miniCoins}</span></div>
                <div>Tier: <span className="font-bold text-purple-600">{adminEarnings.tier}</span></div>
              </div>
            </div>

            {/* Create Dummy Customers */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Setup Demo</h4>
              <Button 
                onClick={handleCreateDummies}
                disabled={isCreatingDummies}
                className="w-full text-xs"
                variant="outline"
              >
                <UserPlus className="h-3 w-3 mr-1" />
                {isCreatingDummies ? 'Creating...' : 'Create Dummy Customers'}
              </Button>
              <p className="text-xs text-gray-500 mt-1">Resets admin to 0 points & creates test customers</p>
            </div>

            {/* Simulate Purchase */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Simulate Purchase</h4>
              <div className="space-y-2">
                <Input
                  type="number"
                  value={simulationAmount}
                  onChange={(e) => setSimulationAmount(Number(e.target.value))}
                  placeholder="Amount in ₹"
                  className="text-xs h-8"
                />
                <Button 
                  onClick={handleSimulatePurchase}
                  disabled={isSimulating || !customers.find(c => c.code === 'C001')}
                  className="w-full text-xs"
                  variant="default"
                >
                  <Play className="h-3 w-3 mr-1" />
                  {isSimulating ? 'Simulating...' : `Simulate ₹${simulationAmount}`}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                C001 (Alice) buys → Earns {Math.floor(simulationAmount / 5)} points
              </p>
            </div>

            {/* Expected Results */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Expected Result</h4>
              <div className="space-y-1 text-xs">
                <div>Purchase: ₹{simulationAmount}</div>
                <div>Points Earned: {Math.floor(simulationAmount / 5)}</div>
                <div className="text-green-600 font-medium">Admin will earn proportional share from level 1</div>
                <div className="text-blue-600">Other customers earn based on their slots</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tree" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="tree">Tree View</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="tree">
          <div className="space-y-4">
            {/* Search and controls */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, code or phone..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={toggleAllNodes} variant="outline" size="sm">
                {expandedNodes.length === 1 ? 'Expand All' : 'Collapse All'}
              </Button>
              <Button onClick={ensureRootCustomer} variant="outline" size="sm">
                Ensure Root A100
              </Button>
            </div>

            {/* Tree visualization */}
            <MLMTreeVisualization
              searchTerm={searchTerm}
              expandedNodes={expandedNodes}
              onToggleNode={toggleNode}
              hasAdminPrivileges={hasAdminPrivileges()}
            />

            {/* MLM Information */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-sm text-blue-900 mb-2">MLM Slot Distribution Rules:</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Each point earned by a customer fills 1 slot in their assigned MLM level</li>
                  <li>• Customers with more points occupy more slots and earn proportionally more from distributions</li>
                  <li>• 6 levels total: Level 1 (1 slot), Level 2 (5 slots), Level 3 (25 slots), Level 4 (125 slots), Level 5 (625 slots), Level 6 (3125 slots)</li>
                  <li>• When levels fill up, customers are automatically assigned to higher available levels</li>
                  <li>• Earnings are distributed proportionally based on slot occupancy within each level</li>
                  <li>• Tree visualization shows actual slot usage and level occupancy percentages</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent MLM Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((order) => (
                    <div key={order.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">Order {order.id}</h4>
                          <p className="text-sm text-gray-600">
                            Customer: {order.customerName} ({order.customerCode})
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">₹{order.points} Point Money</p>
                          <p className="text-xs text-green-600">Distributed</p>
                        </div>
                      </div>
                      
                      {order.mlmDistributionLog && order.mlmDistributionLog.length > 0 && (
                        <div className="bg-gray-50 rounded-md p-3 mt-3">
                          <h5 className="text-xs font-medium text-gray-700 mb-2">Distribution Log:</h5>
                          <div className="space-y-1">
                            {order.mlmDistributionLog.map((log, index) => (
                              <p key={index} className="text-xs text-gray-600">
                                {log}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    No recent MLM activity found. When customers make purchases and earn points, they'll automatically join the MLM system and activity will appear here.
                  </p>
                  <Button onClick={handleAddCustomer} className="bg-green-600 hover:bg-green-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add First Customer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default MLMTree;
