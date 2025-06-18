
import React from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ImageModalProps {
  src: string;
  alt: string;
  children: React.ReactNode;
}

const ImageModal = ({ src, alt, children }: ImageModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          {children}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <div className="relative">
          <img 
            src={src} 
            alt={alt}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;
