
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageUploader from '@/components/ImageUploader';
import ImageModal from '@/components/ImageModal';
import { Edit, Save, X, Plus, Trash2 } from 'lucide-react';

interface ClubImage {
  id: string;
  image: string;
  title: string;
  description: string;
  price: string;
}

interface ClubTierCardProps {
  title: string;
  images: ClubImage[];
  color: string;
  onUpdate: (images: ClubImage[]) => void;
  isAdmin?: boolean;
}

const ClubTierCard = ({ title, images = [], color, onUpdate, isAdmin = false }: ClubTierCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editImages, setEditImages] = useState<ClubImage[]>(images);

  const handleSave = () => {
    onUpdate(editImages);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditImages(images);
    setIsEditing(false);
  };

  const addNewImage = () => {
    const newImage: ClubImage = {
      id: Date.now().toString(),
      image: '',
      title: '',
      description: '',
      price: ''
    };
    setEditImages([...editImages, newImage]);
  };

  const removeImage = (id: string) => {
    setEditImages(editImages.filter(img => img.id !== id));
  };

  const updateImage = (id: string, field: keyof ClubImage, value: string) => {
    setEditImages(editImages.map(img => 
      img.id === id ? { ...img, [field]: value } : img
    ));
  };

  if (isEditing && isAdmin) {
    return (
      <Card className={`border-2 border-${color}`}>
        <CardHeader className="text-center">
          <div className={`w-12 h-12 bg-${color} rounded-full mx-auto mb-2`}></div>
          <CardTitle className={`text-${color.replace('gray-400', 'gray-600')}`}>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {editImages.map((img, index) => (
            <div key={img.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Image {index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeImage(img.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <ImageUploader
                value={img.image}
                onChange={(value) => updateImage(img.id, 'image', value)}
                label="Image"
              />
              
              <div>
                <Label htmlFor={`title-${img.id}`}>Title</Label>
                <Input
                  id={`title-${img.id}`}
                  value={img.title}
                  onChange={(e) => updateImage(img.id, 'title', e.target.value)}
                  placeholder="Enter title"
                />
              </div>
              
              <div>
                <Label htmlFor={`description-${img.id}`}>Description</Label>
                <Input
                  id={`description-${img.id}`}
                  value={img.description}
                  onChange={(e) => updateImage(img.id, 'description', e.target.value)}
                  placeholder="Enter description"
                />
              </div>
              
              <div>
                <Label htmlFor={`price-${img.id}`}>Price</Label>
                <Input
                  id={`price-${img.id}`}
                  value={img.price}
                  onChange={(e) => updateImage(img.id, 'price', e.target.value)}
                  placeholder="Enter price"
                />
              </div>
            </div>
          ))}
          
          <Button
            onClick={addNewImage}
            variant="outline"
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Image
          </Button>
          
          <div className="flex space-x-2">
            <Button onClick={handleSave} size="sm" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm" className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 border-${color}`}>
      <CardHeader className="text-center">
        <div className={`w-12 h-12 bg-${color} rounded-full mx-auto mb-2`}></div>
        <CardTitle className={`text-${color.replace('gray-400', 'gray-600')}`}>{title}</CardTitle>
        {isAdmin && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="ghost"
            size="sm"
            className="mt-2"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {images.length > 0 ? (
          images.map((img, index) => (
            <div key={img.id} className="border rounded-lg p-3">
              {img.image && (
                <div className="mb-3">
                  <ImageModal 
                    src={img.image} 
                    alt={img.title || `${title} image ${index + 1}`}
                  >
                    <img
                      src={img.image}
                      alt={img.title || `${title} image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md hover:opacity-90 transition-opacity"
                    />
                  </ImageModal>
                </div>
              )}
              {img.title && (
                <h4 className="font-semibold text-sm mb-1">{img.title}</h4>
              )}
              {img.description && (
                <p className="text-sm text-gray-600 mb-2">{img.description}</p>
              )}
              {img.price && (
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{img.price}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 text-sm">No images added yet</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ClubTierCard;
