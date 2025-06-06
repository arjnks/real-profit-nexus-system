
import { useState, useCallback } from 'react';
import { Product } from '@/contexts/DataContext';
import { toast } from 'sonner';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  mrp: number;
  quantity: number;
  maxStock: number;
}

export const useCart = () => {
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  const addToCart = useCallback((product: Product) => {
    if (product.stockQuantity === 0) {
      toast.error('This product is out of stock');
      return false;
    }

    const currentQuantity = cart[product.id] || 0;
    if (currentQuantity >= product.stockQuantity) {
      toast.error(`Only ${product.stockQuantity} items available in stock`);
      return false;
    }

    setCart(prev => ({
      ...prev,
      [product.id]: currentQuantity + 1
    }));
    toast.success('Added to cart');
    return true;
  }, [cart]);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId] -= 1;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({});
  }, []);

  const getTotalItems = useCallback(() => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  }, [cart]);

  const getCartItems = useCallback((products: Product[]): CartItem[] => {
    return Object.entries(cart).map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return product ? {
        productId: product.id,
        name: product.name,
        price: product.price,
        mrp: product.mrp,
        quantity,
        maxStock: product.stockQuantity
      } : null;
    }).filter(Boolean) as CartItem[];
  }, [cart]);

  const getTotalPrice = useCallback((products: Product[]) => {
    return Object.entries(cart).reduce((sum, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return sum + (product ? product.mrp * quantity : 0);
    }, 0);
  }, [cart]);

  return {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalItems,
    getCartItems,
    getTotalPrice
  };
};
