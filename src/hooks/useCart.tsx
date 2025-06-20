
import { useState, useEffect } from 'react';
import { Product } from '@/types';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export const useCart = () => {
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product): boolean => {
    setCart(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1
    }));
    return true;
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[productId];
      return newCart;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prev => ({
        ...prev,
        [productId]: quantity
      }));
    }
  };

  const clearCart = () => {
    setCart({});
  };

  const getTotalItems = (): number => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const getCartItems = (products: Product[]): CartItem[] => {
    return Object.entries(cart).map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      if (!product) return null;
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image
      };
    }).filter(Boolean) as CartItem[];
  };

  const getTotalPrice = (products?: Product[]): number => {
    if (!products) {
      // For checkout page where items are already available
      return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + (product ? product.price * quantity : 0);
    }, 0);
  };

  // Get cart items directly for checkout
  const items = Object.entries(cart).map(([productId, quantity]) => {
    // This will be populated by the checkout page with actual product data
    return { id: productId, quantity };
  });

  return {
    cart,
    items: [], // Will be populated by components that have access to products
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getCartItems,
    getTotalPrice
  };
};
