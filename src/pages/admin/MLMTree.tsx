
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';

const MLMTree = () => {
  const { customers } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<string[]>(['A100']); // Admin is expanded by default

  // Build the MLM tree
  const buildTree = () => {
    const tree: { [key: string]: any } = {};
    
    // First, add all customers to the tree
    customers.forEach(customer => {
      tree[customer.code] = {
        ...customer,
        children: [],
      };
    });
    
    // Then, build the tree structure
    customers.forEach(customer => {
      if (customer.parentCode && tree[customer.parentCode]) {
        tree[customer.parentCode].children.push(tree[customer.code]);
      }
    });
    
    // Return the root node (Admin)
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

  // Filter tree based on search
  const filterTree = (node: any) => {
    if (!node) return null;
    
    if (!searchTerm) return node;
    
    // Check if current node matches search
    const nodeMatches = 
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.phone.includes(searchTerm);
    
    // Filter children
    const filteredChildren = node.children
      .map(filterTree)
      .filter(Boolean);
    
    // Return node if it matches or has matching children
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
    
    // Tier colors
    const tierColors = {
      Bronze: 'bg-amber-700',
      Silver: 'bg-gray-400',
      Gold: 'bg-yellow-500',
      Platinum: 'bg-gray-700',
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
              <span>Points: {node.points}</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            Level {level + 1}
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
        <h1 className="text-2xl font-bold tracking-tight">MLM Tree</h1>
        <p className="text-muted-foreground">
          Visualize and manage the multi-level marketing structure
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
                {['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'].map((tier) => (
                  <div key={tier} className="flex items-center">
                    <div 
                      className={`w-3 h-3 rounded-full mr-1 ${
                        tier === 'Bronze' ? 'bg-amber-700' :
                        tier === 'Silver' ? 'bg-gray-400' :
                        tier === 'Gold' ? 'bg-yellow-500' :
                        tier === 'Platinum' ? 'bg-gray-700' :
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
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default MLMTree;
