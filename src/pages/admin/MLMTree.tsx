
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select';
import { Search, ChevronDown, ChevronUp, ChevronRight, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

const MLMTree = () => {
  const { customers, moveCustomerInMLM } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<string[]>(['A100']);
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  const [newParentCode, setNewParentCode] = useState<string>('');

  // Build the MLM tree
  const buildTree = () => {
    const tree: { [key: string]: any } = {};
    
    customers.forEach(customer => {
      tree[customer.code] = {
        ...customer,
        children: [],
      };
    });
    
    customers.forEach(customer => {
      if (customer.parentCode && tree[customer.parentCode]) {
        tree[customer.parentCode].children.push(tree[customer.code]);
      }
    });
    
    return tree['A100'] || null;
  };

  // Toggle node expansion
  const toggleNode = (code: string) => {
    setExpandedNodes(prev => 
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  // Start editing a customer's parent
  const startEditingParent = (customerCode: string, currentParentCode: string | null) => {
    setEditingCustomer(customerCode);
    setNewParentCode(currentParentCode || 'A100');
  };

  // Save parent change
  const saveParentChange = (customerId: string) => {
    try {
      const finalParentCode = newParentCode === 'A100' ? null : newParentCode;
      moveCustomerInMLM(customerId, finalParentCode);
      setEditingCustomer(null);
      setNewParentCode('');
      toast.success('MLM structure updated successfully');
    } catch (error) {
      toast.error('Failed to update MLM structure');
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingCustomer(null);
    setNewParentCode('');
  };

  // Filter tree based on search
  const filterTree = (node: any) => {
    if (!node) return null;
    
    if (!searchTerm) return node;
    
    const nodeMatches = 
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.phone.includes(searchTerm);
    
    const filteredChildren = node.children
      .map(filterTree)
      .filter(Boolean);
    
    if (nodeMatches || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren,
      };
    }
    
    return null;
  };

  const treeRoot = buildTree();
  const filteredTree = filterTree(treeRoot);

  // Render a tree node
  const renderNode = (node: any, level = 0) => {
    if (!node) return null;
    
    const isExpanded = expandedNodes.includes(node.code);
    const hasChildren = node.children.length > 0;
    const isEditing = editingCustomer === node.id;
    
    const tierColors = {
      Bronze: 'bg-amber-700',
      Silver: 'bg-gray-400',
      Gold: 'bg-yellow-500',
      Diamond: 'bg-blue-500',
    };
    
    return (
      <div key={node.code} className="mb-1">
        <div 
          className={`flex items-center p-2 rounded-md hover:bg-gray-100 ${
            searchTerm && 
            (node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             node.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
             node.phone.includes(searchTerm))
              ? 'bg-yellow-50'
              : ''
          }`}
          style={{ marginLeft: `${level * 20}px` }}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 mr-1"
              onClick={() => toggleNode(node.code)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {!hasChildren && <div className="w-7"></div>}
          
          <div className={`w-3 h-3 rounded-full ${tierColors[node.tier as keyof typeof tierColors]} mr-2`}></div>
          
          <div className="flex-1">
            <div className="flex items-center">
              <span className="font-medium">{node.name}</span>
              {node.isReserved && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">
                  Reserved
                </span>
              )}
            </div>
            <div className="flex text-xs text-gray-500">
              <span className="mr-4">Code: {node.code}</span>
              <span className="mr-4">Points: {node.points}</span>
              {node.miniCoins > 0 && (
                <span className="mr-4">Mini Coins: {node.miniCoins}</span>
              )}
              <span>Parent: {node.parentCode || 'A100'}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-500">
              Level {level + 1}
            </div>
            
            {node.code !== 'A100' && (
              <div className="flex items-center space-x-1">
                {isEditing ? (
                  <>
                    <Select value={newParentCode} onValueChange={setNewParentCode}>
                      <SelectTrigger className="w-24 h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A100">A100</SelectItem>
                        {customers
                          .filter(c => c.id !== node.id && c.code !== node.code)
                          .map((customer) => (
                            <SelectItem key={customer.id} value={customer.code}>
                              {customer.code}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-green-600"
                      onClick={() => saveParentChange(node.id)}
                    >
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-600"
                      onClick={cancelEditing}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => startEditingParent(node.id, node.parentCode)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {isExpanded && node.children.length > 0 && (
          <div>
            {node.children.map((child: any) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">MLM Tree Management</h1>
        <p className="text-muted-foreground">
          Visualize and manage the multi-level marketing structure. Click edit icons to move customers.
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, code or phone..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold">MLM Structure</h3>
              <div className="flex items-center gap-2">
                {['Bronze', 'Silver', 'Gold', 'Diamond'].map((tier) => (
                  <div key={tier} className="flex items-center">
                    <div 
                      className={`w-3 h-3 rounded-full mr-1 ${
                        tier === 'Bronze' ? 'bg-amber-700' :
                        tier === 'Silver' ? 'bg-gray-400' :
                        tier === 'Gold' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} 
                    />
                    <span className="text-xs">{tier}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedNodes(prev => 
                prev.length === 1 && prev[0] === 'A100'
                  ? customers.map(c => c.code)
                  : ['A100']
              )}
            >
              {expandedNodes.length === 1 ? (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Expand All
                </>
              ) : (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Collapse All
                </>
              )}
            </Button>
          </div>
          
          <div className="border rounded-md p-2 max-h-[600px] overflow-auto">
            {filteredTree ? (
              renderNode(filteredTree)
            ) : (
              <p className="text-center py-6 text-muted-foreground">
                No MLM tree data available or no results match your search
              </p>
            )}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <h4 className="font-medium text-sm text-blue-900 mb-2">MLM Distribution Rules:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• When a customer earns points, ₹1 is distributed to each of the 5 parent levels</li>
              <li>• 5 mini coins automatically convert to 1 point</li>
              <li>• Tier thresholds: Bronze (20), Silver (40), Gold (80), Diamond (160) points</li>
              <li>• Click edit icons to reorganize the MLM structure</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default MLMTree;
