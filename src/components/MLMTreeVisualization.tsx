
import React from 'react';
import { useData } from '@/contexts/DataContext';
import { useMLM } from '@/contexts/MLMContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Shield, Activity, Users, Layers } from 'lucide-react';

interface TreeNode {
  customer: any;
  children: TreeNode[];
  level: number;
}

interface MLMTreeVisualizationProps {
  searchTerm?: string;
  expandedNodes: string[];
  onToggleNode: (code: string) => void;
  onEditCustomer?: (customerId: string, parentCode: string | null) => void;
  hasAdminPrivileges?: boolean;
}

const MLMTreeVisualization: React.FC<MLMTreeVisualizationProps> = ({
  searchTerm = '',
  expandedNodes,
  onToggleNode,
  onEditCustomer,
  hasAdminPrivileges = false
}) => {
  const { customers, isAdmin } = useData();
  const { getSlotOccupancy } = useMLM();

  // Get slot occupancy data
  const slotOccupancy = getSlotOccupancy();

  // Build tree structure
  const buildTreeStructure = (): TreeNode | null => {
    const customerMap = new Map();
    
    // Create nodes for all customers
    customers.forEach(customer => {
      customerMap.set(customer.code, {
        customer,
        children: [],
        level: 0
      });
    });

    // Find root customer (A100 or first customer without parent)
    let root = customerMap.get('A100');
    if (!root) {
      const rootCustomers = customers.filter(c => !c.parentCode);
      if (rootCustomers.length > 0) {
        root = customerMap.get(rootCustomers[0].code);
      }
    }

    if (!root) return null;

    // Build parent-child relationships
    customers.forEach(customer => {
      if (customer.parentCode && customerMap.has(customer.parentCode)) {
        const parent = customerMap.get(customer.parentCode);
        const child = customerMap.get(customer.code);
        if (parent && child) {
          child.level = parent.level + 1;
          parent.children.push(child);
        }
      }
    });

    return root;
  };

  // Filter tree based on search
  const filterTree = (node: TreeNode): TreeNode | null => {
    if (!searchTerm) return node;

    const nodeMatches = 
      node.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.customer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.customer.phone.includes(searchTerm);

    const filteredChildren = node.children
      .map(filterTree)
      .filter(Boolean) as TreeNode[];

    if (nodeMatches || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren
      };
    }

    return null;
  };

  // Get tier colors
  const getTierColor = (tier: string) => {
    const colors = {
      Bronze: 'bg-amber-700 text-white',
      Silver: 'bg-gray-400 text-white',
      Gold: 'bg-yellow-500 text-white',
      Diamond: 'bg-blue-500 text-white'
    };
    return colors[tier as keyof typeof colors] || 'bg-gray-300 text-gray-800';
  };

  // Check if customer has recent activity
  const hasRecentActivity = (customer: any) => {
    return customer.lastMLMDistribution && 
      new Date(customer.lastMLMDistribution).getTime() > Date.now() - (24 * 60 * 60 * 1000);
  };

  // Get slot utilization percentage for a level
  const getSlotUtilization = (level: number) => {
    const occupancy = slotOccupancy[level];
    if (!occupancy) return 0;
    return Math.round((occupancy.filled / occupancy.capacity) * 100);
  };

  // Render tree node
  const renderTreeNode = (node: TreeNode) => {
    const { customer } = node;
    const isExpanded = expandedNodes.includes(customer.code);
    const hasChildren = node.children.length > 0;
    const nodeIsAdmin = isAdmin(customer.code);
    const recentActivity = hasRecentActivity(customer);
    const slotsOccupied = customer.points; // Each point = 1 slot

    return (
      <div key={customer.code} className="relative">
        {/* Tree lines */}
        {node.level > 0 && (
          <div className="absolute left-0 top-0 w-6 h-6 border-l-2 border-b-2 border-gray-300"></div>
        )}
        
        {/* Customer card */}
        <div 
          className={`
            ml-${node.level * 8} pl-8 relative
            ${node.level > 0 ? 'border-l-2 border-gray-200' : ''}
          `}
        >
          <Card className={`
            mb-2 transition-all duration-200 hover:shadow-md
            ${recentActivity ? 'border-l-4 border-l-green-500' : ''}
            ${nodeIsAdmin ? 'border-2 border-red-500 bg-red-50' : ''}
            ${searchTerm && (
              customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              customer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
              customer.phone.includes(searchTerm)
            ) ? 'bg-yellow-50' : ''}
          `}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Expand/Collapse button */}
                  {hasChildren && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onToggleNode(customer.code)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  
                  {!hasChildren && <div className="w-6"></div>}

                  {/* Customer info */}
                  <div className="flex items-center space-x-2">
                    {nodeIsAdmin && <Shield className="h-4 w-4 text-red-500" />}
                    {recentActivity && <Activity className="h-3 w-3 text-green-500" />}
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">{customer.name}</span>
                        {nodeIsAdmin && (
                          <Badge variant="destructive" className="text-xs">ADMIN</Badge>
                        )}
                        {customer.isReserved && (
                          <Badge variant="secondary" className="text-xs">Reserved</Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{customer.code}</span>
                        {customer.parentCode && (
                          <span className="ml-2">← Parent: {customer.parentCode}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Tier badge */}
                  <Badge className={getTierColor(customer.tier)}>
                    {customer.tier}
                  </Badge>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {customer.points} pts
                    </div>
                    <div className="text-xs text-gray-500">
                      Level {customer.mlmLevel || 1}
                    </div>
                    {slotsOccupied > 0 && (
                      <div className="text-xs text-blue-600 flex items-center">
                        <Layers className="h-3 w-3 mr-1" />
                        {slotsOccupied} slots
                      </div>
                    )}
                    {customer.miniCoins > 0 && (
                      <div className="text-xs text-orange-600">
                        {customer.miniCoins} coins
                      </div>
                    )}
                  </div>

                  {/* Children count */}
                  {hasChildren && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Users className="h-3 w-3 mr-1" />
                      {node.children.length}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Render children if expanded */}
        {isExpanded && hasChildren && (
          <div className="ml-4">
            {node.children.map(child => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  const treeRoot = buildTreeStructure();
  const filteredTree = treeRoot ? filterTree(treeRoot) : null;

  if (!filteredTree) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No MLM Tree Data</h3>
            <p className="text-sm">
              {searchTerm 
                ? 'No customers match your search criteria.' 
                : 'No customers found or root customer (A100) not available.'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Tree header */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">MLM Tree Structure</h3>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
                <span>Admin</span>
              </div>
              <div className="flex items-center">
                <Activity className="h-3 w-3 text-green-500 mr-1" />
                <span>Recent Activity</span>
              </div>
              <div className="flex items-center">
                <Layers className="h-3 w-3 text-blue-600 mr-1" />
                <span>Slots Occupied</span>
              </div>
              <div className="flex items-center">
                <Users className="h-3 w-3 text-gray-400 mr-1" />
                <span>Children Count</span>
              </div>
            </div>
          </div>

          {/* Level occupancy overview */}
          <div className="bg-blue-50 rounded-md p-3 mb-4">
            <h4 className="font-medium text-sm text-blue-900 mb-2">Level Slot Occupancy:</h4>
            <div className="grid grid-cols-6 gap-2 text-xs">
              {Object.entries(slotOccupancy).map(([level, data]) => (
                <div key={level} className="text-center">
                  <div className="font-medium text-blue-800">Level {level}</div>
                  <div className="text-blue-600">
                    {data.filled}/{data.capacity}
                  </div>
                  <div className="text-blue-500">
                    ({getSlotUtilization(Number(level))}%)
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tree content */}
          <div className="max-h-[600px] overflow-auto">
            {renderTreeNode(filteredTree)}
          </div>

          {/* Tree stats */}
          <div className="border-t pt-4 bg-gray-50 rounded-md p-3">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Tree Statistics:</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
              <div>
                <span className="text-gray-500">Total Customers:</span>
                <div className="font-semibold">{customers.length}</div>
              </div>
              <div>
                <span className="text-gray-500">Total Slots Filled:</span>
                <div className="font-semibold">
                  {Object.values(slotOccupancy).reduce((total, level) => total + level.filled, 0)}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Max Capacity:</span>
                <div className="font-semibold">
                  {Object.values(slotOccupancy).reduce((total, level) => total + level.capacity, 0)}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Active Today:</span>
                <div className="font-semibold">
                  {customers.filter(c => hasRecentActivity(c)).length}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Admin Nodes:</span>
                <div className="font-semibold">
                  {customers.filter(c => isAdmin(c.code)).length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MLMTreeVisualization;
