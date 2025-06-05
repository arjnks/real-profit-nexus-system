
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
}

const ImageUploader = ({ value, onChange, className, label = "Image" }: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [useUrl, setUseUrl] = useState(!!value && !value.startsWith('data:'));
  const [previewUrl, setPreviewUrl] = useState<string>(value);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onChange(base64String);
      setPreviewUrl(base64String);
      setIsUploading(false);
      setUseUrl(false);
    };
    reader.onerror = () => {
      console.error('Error reading file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    onChange(url);
    setPreviewUrl(url);
  };

  const toggleMode = () => {
    setUseUrl(!useUrl);
    if (!useUrl) {
      // Switching to URL mode
      onChange('');
      setPreviewUrl('');
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="image">{label}</Label>
      
      <div className="flex items-center space-x-2 mb-2">
        <Button 
          type="button" 
          variant={useUrl ? "outline" : "default"} 
          size="sm"
          onClick={() => !useUrl && toggleMode()}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
        <Button 
          type="button" 
          variant={useUrl ? "default" : "outline"} 
          size="sm"
          onClick={() => useUrl && toggleMode()}
        >
          <LinkIcon className="w-4 h-4 mr-2" />
          URL
        </Button>
      </div>

      {useUrl ? (
        <Input
          id="image-url"
          value={value}
          onChange={handleUrlChange}
          placeholder="https://example.com/image.jpg"
        />
      ) : (
        <div className="space-y-2">
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          {isUploading && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing image...</span>
            </div>
          )}
        </div>
      )}

      {previewUrl && !isUploading && (
        <div className="mt-2">
          <div className="text-sm text-muted-foreground mb-1">Preview:</div>
          <div className="relative w-20 h-20 rounded overflow-hidden border">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-full object-cover"
              onError={() => setPreviewUrl('')}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
