import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../contexts/CartContext';
import { ReactNode } from 'react';

// Mock data for testing
const mockProduct = {
  id: '1',
  name: 'Test Product',
  description: 'Test description',
  shortDesc: 'Test short description',
  price: 29.99,
  image: '/test-image.jpg',
  stock: 10,
  features: ['Feature 1', 'Feature 2'],
  category: 'Herbs'
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe('CartContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(mockProduct);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.id).toBe(mockProduct.id);
    expect(result.current.items[0].quantity).toBe(1);
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    // Add item first
    act(() => {
      result.current.addItem(mockProduct);
    });

    // Remove the item
    act(() => {
      result.current.removeItem(mockProduct.id.toString());
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    // Add item first
    act(() => {
      result.current.addItem(mockProduct);
    });

    // Update quantity
    act(() => {
      result.current.updateQuantity(mockProduct.id.toString(), 3);
    });

    expect(result.current.items[0].quantity).toBe(3);
  });

  it('should clear cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    // Add multiple items
    act(() => {
      result.current.addItem(mockProduct);
      result.current.addItem({ ...mockProduct, id: 2, name: 'Another Product' });
    });

    expect(result.current.items).toHaveLength(2);

    // Clear cart
    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('should calculate total correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(mockProduct);
      result.current.updateQuantity(mockProduct.id.toString(), 2); // 2 * 29.99 = 59.98
    });

    expect(result.current.subtotal).toBeCloseTo(59.98, 2);
  });

  it('should persist cart to localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(mockProduct);
    });

    const storedCart = localStorage.getItem('cart');
    expect(storedCart).toBeTruthy();
    
    const parsedCart = JSON.parse(storedCart!);
    expect(parsedCart).toHaveLength(1);
    expect(parsedCart[0].product.id).toBe(mockProduct.id);
  });

  it('should load cart from localStorage on mount', () => {
    // Pre-populate localStorage with correct CartItem structure
    const existingCart = [{ product: mockProduct, quantity: 2 }];
    localStorage.setItem('cart', JSON.stringify(existingCart));

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });
});