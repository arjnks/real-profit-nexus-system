
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
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const Services = () => {
  const { services, addService, updateService, deleteService } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Filter services
  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset form
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory('');
    setImage('');
    setIsActive(true);
    setEditingService(null);
  };

  // Handle add service
  const handleAddService = () => {
    if (!title || !description || !price || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    addService({
      title,
      description,
      price,
      category,
      image: image || 'https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?q=80&w=400',
      isActive
    });

    toast.success('Service added successfully');
    resetForm();
    setIsAddDialogOpen(false);
  };

  // Handle edit service
  const handleEditService = () => {
    if (!editingService || !title || !description || !price || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    updateService(editingService.id, {
      title,
      description,
      price,
      category,
      image: image || editingService.image,
      isActive
    });

    toast.success('Service updated successfully');
    resetForm();
    setIsEditDialogOpen(false);
  };

  // Handle delete service
  const handleDeleteService = (serviceId: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      deleteService(serviceId);
      toast.success('Service deleted successfully');
    }
  };

  // Toggle service status
  const toggleServiceStatus = (serviceId: string, currentStatus: boolean) => {
    updateService(serviceId, { isActive: !currentStatus });
    toast.success(`Service ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
  };

  // Open edit dialog
  const openEditDialog = (service: any) => {
    setEditingService(service);
    setTitle(service.title);
    setDescription(service.description);
    setPrice(service.price);
    setCategory(service.category);
    setImage(service.image);
    setIsActive(service.isActive);
    setIsEditDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Services Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
              <DialogDescription>
                Add a new service to your offerings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <Label htmlFor="title">Service Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter service title"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Digital Services, Consulting, etc."
                />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g., ₹500, ₹500/hour, Contact for quote"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the service in detail"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="image">Image URL (Optional)</Label>
                <Input
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="isActive">Service Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddService}>Add Service</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
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
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{service.title}</TableCell>
                  <TableCell>{service.category}</TableCell>
                  <TableCell>{service.price}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleServiceStatus(service.id, service.isActive)}
                        className={service.isActive ? 'text-green-600' : 'text-red-600'}
                      >
                        {service.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        service.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{service.description}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => openEditDialog(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-600"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No services found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update service details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <Label htmlFor="edit-title">Service Title</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter service title"
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Digital Services, Consulting, etc."
              />
            </div>
            <div>
              <Label htmlFor="edit-price">Price</Label>
              <Input
                id="edit-price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., ₹500, ₹500/hour, Contact for quote"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the service in detail"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-image">Image URL</Label>
              <Input
                id="edit-image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="edit-isActive">Service Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditService}>Update Service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Services;
