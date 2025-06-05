
import React, { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import ImageUploader from '@/components/ImageUploader';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Products = () => {
  const { products, addProduct, updateProduct, deleteProduct, calculatePointsForProduct } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Form state
  const [name, setName] = useState('');
  const [mrp, setMrp] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');

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
    setDescription('');
    setCategory('');
    setImage('');
    setEditingProduct(null);
  };

  // Handle add product
  const handleAddProduct = () => {
    if (!name || !mrp || !price || !description || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const mrpValue = parseFloat(mrp);
    const priceValue = parseFloat(price);

    if (priceValue > mrpValue) {
      toast.error('Company Profit Price cannot be higher than MRP');
      return;
    }

    addProduct({
      name,
      mrp: mrpValue,
      price: priceValue,
      description,
      category,
      image: image || 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=200',
      inStock: true,
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
    if (!editingProduct || !name || !mrp || !price || !description || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const mrpValue = parseFloat(mrp);
    const priceValue = parseFloat(price);

    if (priceValue > mrpValue) {
      toast.error('Company Profit Price cannot be higher than MRP');
      return;
    }

    updateProduct(editingProduct.id, {
      name,
      mrp: mrpValue,
      price: priceValue,
      description,
      category,
      image: image || editingProduct.image
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
    setDescription(product.description);
    setCategory(product.category);
    setImage(product.image);
    setIsEditDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Add a new product to your inventory with MRP and selling price
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
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Fruits, Dairy, Bakery"
                />
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
              <TableHead>MRP</TableHead>
              <TableHead>Selling Price</TableHead>
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
                  <TableCell>₹{(product.mrp || product.price).toFixed(2)}</TableCell>
                  <TableCell>₹{product.price.toFixed(2)}</TableCell>
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
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details with MRP and selling price
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
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Fruits, Dairy, Bakery"
              />
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
          <DialogFooter>
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
