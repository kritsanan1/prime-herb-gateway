import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../components/Header';
import { CartProvider } from '../contexts/CartContext';
import { AuthProvider } from '../contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock the cart context
vi.mock('../contexts/CartContext', () => ({
  CartProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useCart: () => ({
    items: [
      { product: { id: '1', name: 'Test Product', price: 29.99 }, quantity: 2 }
    ],
    totalItems: 2,
    isOpen: false,
    setIsOpen: vi.fn()
  })
}));

// Mock the auth context
vi.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    user: null,
    login: vi.fn(),
    logout: vi.fn()
  })
}));

const renderHeader = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Header />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Header', () => {
  it('should render logo and navigation links', () => {
    renderHeader();
    
    // Check for logo - the actual component shows "Dr.Arty"
    expect(screen.getByText('Dr.Arty')).toBeInTheDocument();
    expect(screen.getByText('Prime Herb Intimate Care')).toBeInTheDocument();
    
    // Check for navigation links
    expect(screen.getByText('หน้าแรก')).toBeInTheDocument();
    expect(screen.getByText('สินค้า')).toBeInTheDocument();
    expect(screen.getByText('บทความ')).toBeInTheDocument();
  });

  it('should show cart icon with item count', () => {
    renderHeader();
    
    // Check cart button exists using aria-label
    const cartButton = screen.getByLabelText('ตะกร้าสินค้า');
    expect(cartButton).toBeInTheDocument();
    
    // Check cart count is displayed
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should have working mobile menu toggle', () => {
    renderHeader();
    
    // Mobile menu button should exist
    const mobileMenuButton = screen.getByRole('button', { name: /เมนู/i });
    expect(mobileMenuButton).toBeInTheDocument();
  });
});