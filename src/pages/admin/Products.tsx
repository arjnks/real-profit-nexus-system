import React, { useState, useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import ImageUploader from '@/components/ImageUploader';
import { Plus, Search, Edit, Trash2, Tag, Package, FolderPlus } from 'lucide-react';
import { toast } from 'sonner';

const Products = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, addCategory, calculatePointsForProduct, refreshData } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Form state
  const [name, setName] = useState('');
  const [mrp, setMrp] = useState('');
  const [price, setPrice] = useState('');
  const [dummyPrice, setDummyPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');

  // Category form state
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  // Load data on component mount
  useEffect(() => {
    refreshData();
  }, []);

  // Filter products
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset form
  const resetForm = () => {
    setName('');
    setMrp('');
    setPrice('');
    setDummyPrice('');
    setDescription('');
    setCategory('');
    setImage('');
    setStockQuantity('');
    setEditingProduct(null);
  };

  // Reset category form
  const resetCategoryForm = () => {
    setCategoryName('');
    setCategoryDescription('');
  };

  // Handle add category
  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      console.log('Adding category with data:', { 
        name: categoryName.trim(), 
        description: categoryDescription.trim() || undefined 
      });
      
      await addCategory({
        name: categoryName.trim(),
        description: categoryDescription.trim() || undefined
      });
      
      toast.success('Category added successfully');
      resetCategoryForm();
      setIsCategoryDialogOpen(false);
      
      // Force refresh categories data
      console.log('Refreshing data after category addition...');
      await refreshData();
      console.log('Data refresh completed, categories count:', categories.length);
    } catch (error) {
      console.error('Failed to add category:', error);
      toast.error('Failed to add category');
    }
  };

  // Handle add product
  const handleAddProduct = () => {
    if (!name || !mrp || !price || !description || !category || !stockQuantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const mrpValue = parseFloat(mrp);
    const priceValue = parseFloat(price);
    const dummyPriceValue = dummyPrice ? parseFloat(dummyPrice) : undefined;
    const stockValue = parseInt(stockQuantity);

    if (priceValue > mrpValue) {
      toast.error('Company Profit Price cannot be higher than MRP');
      return;
    }

    if (dummyPriceValue && dummyPriceValue <= mrpValue) {
      toast.error('Dummy price should be higher than MRP to show as an offer');
      return;
    }

    if (stockValue < 0) {
      toast.error('Stock quantity cannot be negative');
      return;
    }

    addProduct({
      name,
      mrp: mrpValue,
      price: priceValue,
      dummyPrice: dummyPriceValue,
      description,
      category,
      image: image || 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=200',
      inStock: stockValue > 0,
      stockQuantity: stockValue,
      tierDiscounts: {
        Bronze: 2,
        Silver: 3,
        Gold: 4,
        Diamond: 5
      }
    });

    const points = calculatePointsForProduct(mrpValue, priceValue);
    console.log('Points calculation:', { mrp: mrpValue, price: priceValue, points });
    toast.success(`Product added successfully! Customers will earn ₹${points} point money per unit.`);
    resetForm();
    setIsAddDialogOpen(false);
  };

  // Handle edit product
  const handleEditProduct = () => {
    if (!editingProduct || !name || !mrp || !price || !description || !category || stockQuantity === '') {
      toast.error('Please fill in all required fields');
      return;
    }

    const mrpValue = parseFloat(mrp);
    const priceValue = parseFloat(price);
    const dummyPriceValue = dummyPrice ? parseFloat(dummyPrice) : undefined;
    const stockValue = parseInt(stockQuantity);

    if (priceValue > mrpValue) {
      toast.error('Company Profit Price cannot be higher than MRP');
      return;
    }

    if (dummyPriceValue && dummyPriceValue <= mrpValue) {
      toast.error('Dummy price should be higher than MRP to show as an offer');
      return;
    }

    if (stockValue < 0) {
      toast.error('Stock quantity cannot be negative');
      return;
    }

    updateProduct(editingProduct.id, {
      name,
      mrp: mrpValue,
      price: priceValue,
      dummyPrice: dummyPriceValue,
      description,
      category,
      image: image || editingProduct.image,
      inStock: stockValue > 0,
      stockQuantity: stockValue
    });

    const points = calculatePointsForProduct(mrpValue, priceValue);
    console.log('Points calculation:', { mrp: mrpValue, price: priceValue, points });
    toast.success(`Product updated successfully! Customers will earn ₹${points} point money per unit.`);
    resetForm();
    setIsEditDialogOpen(false);
  };

  // Handle delete product
  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
      toast.success('Product deleted successfully');
    }
  };

  // Open edit dialog
  const openEditDialog = (product: any) => {
    setEditingProduct(product);
    setName(product.name);
    setMrp(product.mrp?.toString() || product.price.toString());
    setPrice(product.price.toString());
    setDummyPrice(product.dummyPrice?.toString() || '');
    setDescription(product.description);
    setCategory(product.category);
    setImage(product.image);
    setStockQuantity(product.stockQuantity?.toString() || '0');
    setIsEditDialogOpen(true);
  };

  // Open add dialog
  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const getStockBadge = (stockQuantity: number) => {
    if (stockQuantity === 0) {
      return <Badge variant="destructive" className="text-xs">Out of Stock</Badge>;
    } else if (stockQuantity === 1) {
      return <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">Only 1 Left</Badge>;
    } else if (stockQuantity <= 10) {
      return <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">Low Stock</Badge>;
    } else {
      return <Badge variant="outline" className="text-xs text-green-600 border-green-600">In Stock</Badge>;
    }
  };

  console.log('Current categories in Products component:', categories);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <div className="flex gap-2">
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setIsCategoryDialogOpen(true)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>
                  Create a new product category for better organization
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
                  <Label htmlFor="categoryDescription">Description (Optional)</Label>
                  <Input
                    id="categoryDescription"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    placeholder="Enter category description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCategory}>Add Category</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Add a new product to your inventory with pricing details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
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
                  <Label htmlFor="dummyPrice">Dummy Price (Optional) ₹</Label>
                  <Input
                    id="dummyPrice"
                    type="number"
                    step="0.01"
                    value={dummyPrice}
                    onChange={(e) => setDummyPrice(e.target.value)}
                    placeholder="Higher price to show as 'was' price"
                  />
                  <p className="text-xs text-gray-500 mt-1">This will show as crossed-out price to make MRP look like an offer</p>
                </div>
                <div>
                  <Label htmlFor="mrp">Maximum Retail Price (MRP) ₹</Label>
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
                  <Label htmlFor="price">Company Profit Price (Selling Price) ₹</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                  />
                  {mrp && price && (
                    <p className="text-sm text-green-600 mt-1">
                      Point money per unit: ₹{calculatePointsForProduct(parseFloat(mrp) || 0, parseFloat(price) || 0)}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="Enter stock quantity"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md z-[60] max-h-60 overflow-y-auto">
                      {categories.length > 0 ? (
                        categories.map((cat) => (
                          <SelectItem 
                            key={cat.id} 
                            value={cat.name}
                            className="hover:bg-gray-100 cursor-pointer px-3 py-2 text-sm"
                          >
                            {cat.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-categories" disabled className="text-gray-400">
                          No categories available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {categories.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">No categories available. Please add a category first.</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter product description"
                  />
                </div>
                <ImageUploader
                  value={image}
                  onChange={setImage}
                  label="Product Image"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
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
              <TableHead>Dummy Price</TableHead>
              <TableHead>MRP (Display Price)</TableHead>
              <TableHead>Company Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Point Money/Unit</TableHead>
              <TableHead>Description</TableHead>
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
                  <TableCell>
                    {product.dummyPrice ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">₹{product.dummyPrice.toFixed(2)}</span>
                        <Badge variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          Offer
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-bold text-blue-600">₹{product.mrp.toFixed(2)}</TableCell>
                  <TableCell>₹{product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{product.stockQuantity || 0}</span>
                      {getStockBadge(product.stockQuantity || 0)}
                    </div>
                  </TableCell>
                  <TableCell className="text-green-600 font-medium">
                    ₹{calculatePointsForProduct(product.mrp || product.price, product.price)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{product.description}</TableCell>
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
                <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                  <div className="space-y-4">
                    <p>No products found</p>
                    <Button
                      variant="outline"
                      onClick={() => { resetForm(); setIsAddDialogOpen(true); }}
                      className="border-dashed border-2 hover:border-solid hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Product
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details with pricing information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
              <Label htmlFor="edit-dummyPrice">Dummy Price (Optional) ₹</Label>
              <Input
                id="edit-dummyPrice"
                type="number"
                step="0.01"
                value={dummyPrice}
                onChange={(e) => setDummyPrice(e.target.value)}
                placeholder="Higher price to show as 'was' price"
              />
              <p className="text-xs text-gray-500 mt-1">This will show as crossed-out price to make MRP look like an offer</p>
            </div>
            <div>
              <Label htmlFor="edit-mrp">Maximum Retail Price (MRP) ₹</Label>
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
              <Label htmlFor="edit-price">Company Profit Price (Selling Price) ₹</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
              {mrp && price && (
                <p className="text-sm text-green-600 mt-1">
                  Point money per unit: ₹{calculatePointsForProduct(parseFloat(mrp) || 0, parseFloat(price) || 0)}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-stockQuantity">Stock Quantity</Label>
              <Input
                id="edit-stockQuantity"
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="Enter stock quantity"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md z-[60] max-h-60 overflow-y-auto">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <SelectItem 
                        key={cat.id} 
                        value={cat.name}
                        className="hover:bg-gray-100 cursor-pointer px-3 py-2 text-sm"
                      >
                        {cat.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-categories" disabled className="text-gray-400">
                      No categories available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product description"
              />
            </div>
            <ImageUploader
              value={image}
              onChange={setImage}
              label="Product Image"
            />
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
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
