import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUploader from '@/components/ImageUploader';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Package } from 'lucide-react';
import { toast } from 'sonner';

const Products = () => {
  const { 
    products, 
    categories, 
    addProduct, 
    updateProduct, 
    deleteProduct,
    addCategory
  } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Product form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [dummy_price, setDummyPrice] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [in_stock, setInStock] = useState(true);
  const [stock_quantity, setStockQuantity] = useState('');

  // Category form state
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  // Filter products
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset product form
  const resetProductForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setMrp('');
    setDummyPrice('');
    setImage('');
    setCategory('');
    setInStock(true);
    setStockQuantity('');
    setEditingProduct(null);
  };

  // Reset category form
  const resetCategoryForm = () => {
    setCategoryName('');
    setCategoryDescription('');
  };

  // Handle add category
  const handleAddCategory = () => {
    if (!categoryName) {
      toast.error('Please enter category name');
      return;
    }

    addCategory({
      name: categoryName,
      description: categoryDescription,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    toast.success('Category added successfully');
    resetCategoryForm();
    setIsAddCategoryDialogOpen(false);
  };

  // Handle add product
  const handleAddProduct = () => {
    if (!name || !description || !price || !mrp || !category || !stock_quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    addProduct({
      name,
      description,
      price: parseFloat(price),
      mrp: parseFloat(mrp),
      dummy_price: dummy_price ? parseFloat(dummy_price) : undefined,
      image: image || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=400',
      category,
      in_stock,
      stock_quantity: parseInt(stock_quantity),
      tier_discounts: {
        Bronze: 2,
        Silver: 3,
        Gold: 4,
        Diamond: 5
      }
    });

    toast.success('Product added successfully');
    resetProductForm();
    setIsAddProductDialogOpen(false);
  };

  // Handle edit product
  const handleEditProduct = () => {
    if (!editingProduct || !name || !description || !price || !mrp || !category || !stock_quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updates: any = {
      name,
      description,
      price: parseFloat(price),
      mrp: parseFloat(mrp),
      dummy_price: dummy_price ? parseFloat(dummy_price) : undefined,
      image: image || editingProduct.image,
      category,
      in_stock,
      stock_quantity: parseInt(stock_quantity)
    };

    updateProduct(editingProduct.id, updates);

    toast.success('Product updated successfully');
    resetProductForm();
    setIsEditProductDialogOpen(false);
  };

  // Handle delete product
  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
      toast.success('Product deleted successfully');
    }
  };

  // Toggle product stock status
  const toggleProductStock = (productId: string, currentStatus: boolean) => {
    updateProduct(productId, { in_stock: !currentStatus });
    toast.success(`Product ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
  };

  // Open edit dialog
  const openEditDialog = (product: any) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setMrp(product.mrp.toString());
    setDummyPrice(product.dummy_price ? product.dummy_price.toString() : '');
    setImage(product.image);
    setCategory(product.category);
    setInStock(product.in_stock);
    setStockQuantity(product.stock_quantity.toString());
    setIsEditProductDialogOpen(true);
  };

  console.log('Current categories in Products component:', categories);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Products Management</h1>
        <div className="flex space-x-2">
          <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>
                  Create a new product category
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Enter category name"
                  />
                </div>
                <div>
                  <Label htmlFor="categoryDescription">Description</Label>
                  <Textarea
                    id="categoryDescription"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    placeholder="Enter category description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddCategoryDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCategory}>Add Category</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Add a new product to your inventory
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter product description"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mrp">MRP (₹)</Label>
                    <Input
                      id="mrp"
                      type="number"
                      step="0.01"
                      value={mrp}
                      onChange={(e) => setMrp(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dummyPrice">Dummy Price (₹)</Label>
                    <Input
                      id="dummyPrice"
                      type="number"
                      step="0.01"
                      value={dummy_price}
                      onChange={(e) => setDummyPrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    value={stock_quantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="Enter stock quantity"
                  />
                </div>

                <ImageUploader
                  value={image}
                  onChange={setImage}
                  label="Product Image"
                />

                <div className="flex items-center space-x-2">
                  <Switch
                    id="inStock"
                    checked={in_stock}
                    onCheckedChange={setInStock}
                  />
                  <Label htmlFor="inStock">In Stock</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddProductDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddProduct}>Add Product</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>MRP</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>₹{product.price.toFixed(2)}</TableCell>
                  <TableCell>₹{product.mrp.toFixed(2)}</TableCell>
                  <TableCell>
                    {product.dummy_price && (
                      <span className="text-xs text-gray-400 block">
                        Dummy: ₹{product.dummy_price.toFixed(2)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${
                        product.stock_quantity <= 5 ? 'text-red-600 font-medium' : 'text-gray-600'
                      }`}>
                        {product.stock_quantity}
                      </span>
                      {product.stock_quantity <= 5 && (
                        <span className="text-xs text-red-500">Low</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleProductStock(product.id, product.in_stock)}
                        className={product.in_stock ? 'text-green-600' : 'text-red-600'}
                      >
                        {product.in_stock ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        product.in_stock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.in_stock ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-600"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditProductDialogOpen} onOpenChange={setIsEditProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Product Name</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-price">Price (₹)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="edit-mrp">MRP (₹)</Label>
                <Input
                  id="edit-mrp"
                  type="number"
                  step="0.01"
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="edit-dummyPrice">Dummy Price (₹)</Label>
                <Input
                  id="edit-dummyPrice"
                  type="number"
                  step="0.01"
                  value={dummy_price}
                  onChange={(e) => setDummyPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-stockQuantity">Stock Quantity</Label>
              <Input
                id="edit-stockQuantity"
                type="number"
                value={stock_quantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="Enter stock quantity"
              />
            </div>

            <ImageUploader
              value={image}
              onChange={setImage}
              label="Product Image"
            />

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-inStock"
                checked={in_stock}
                onCheckedChange={setInStock}
              />
              <Label htmlFor="edit-inStock">In Stock</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProductDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProduct}>Update Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Products;
