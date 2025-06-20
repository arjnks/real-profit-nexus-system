
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { CartItem } from '@/contexts/CartContext';

interface CartSummaryProps {
  cartItems: CartItem[];
  totalPrice: number;
  totalItems: number;
  onCheckout: () => void;
  isLoggedIn: boolean;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  cartItems,
  totalPrice,
  totalItems,
  onCheckout,
  isLoggedIn
}) => {
  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 min-w-[300px] max-w-[400px] z-50">
      <h3 className="font-semibold mb-2 flex items-center">
        <ShoppingCart className="h-4 w-4 mr-2" />
        Cart Summary
        <Badge className="ml-2 bg-blue-500">
          {totalItems}
        </Badge>
      </h3>
      <div className="space-y-1 text-sm max-h-48 overflow-y-auto">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between items-center">
            <span className="truncate flex-1 mr-2">
              {item.name} x{item.quantity}
            </span>
            <span className="font-medium">
              ₹{(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t pt-2 mt-2">
        <div className="flex justify-between font-semibold text-lg">
          <span>Total:</span>
          <span>₹{totalPrice.toFixed(2)}</span>
        </div>
        <Button 
          className="w-full mt-2" 
          onClick={onCheckout}
          disabled={!isLoggedIn}
        >
          {isLoggedIn ? 'Proceed to Checkout' : 'Login to Checkout'}
        </Button>
      </div>
    </div>
  );
};

export default CartSummary;
