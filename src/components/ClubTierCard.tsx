
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageUploader from '@/components/ImageUploader';
import { Edit, Save, X } from 'lucide-react';

interface ClubTierCardProps {
  title: string;
  image: string;
  price: string;
  color: string;
  onUpdate: (image: string, price: string) => void;
  isAdmin?: boolean;
}

const ClubTierCard = ({ title, image, price, color, onUpdate, isAdmin = false }: ClubTierCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editImage, setEditImage] = useState(image);
  const [editPrice, setEditPrice] = useState(price);

  const handleSave = () => {
    onUpdate(editImage, editPrice);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditImage(image);
    setEditPrice(price);
    setIsEditing(false);
  };

  if (isEditing && isAdmin) {
    return (
      <Card className={`border-2 border-${color}`}>
        <CardHeader className="text-center">
          <div className={`w-12 h-12 bg-${color} rounded-full mx-auto mb-2`}></div>
          <CardTitle className={`text-${color.replace('gray-400', 'gray-600')}`}>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUploader
            value={editImage}
            onChange={setEditImage}
            label="Club Image"
          />
          <div>
            <Label htmlFor={`price-${title}`}>Selling Price</Label>
            <Input
              id={`price-${title}`}
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              placeholder="Enter price"
            />
          </div>
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
      <CardContent className="text-center">
        {image && (
          <div className="mb-4">
            <img
              src={image}
              alt={`${title} club`}
              className="w-full h-32 object-cover rounded-md"
            />
          </div>
        )}
        {price && (
          <div>
            <p className="text-2xl font-bold mb-2">{price}</p>
            <p className="text-sm text-gray-600">Special Price</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClubTierCard;
