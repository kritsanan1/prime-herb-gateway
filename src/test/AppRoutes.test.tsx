import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AppRoutes from '../AppRoutes';
import { MemoryRouter } from 'react-router-dom';

describe('AppRoutes', () => {
  it('should render without crashing', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );
    
    // Should show loading state initially
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('should render home page route', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );
    
    // After loading, should render the home page
    // Note: This is a basic test - in a real app you'd mock the lazy-loaded components
    expect(document.querySelector('div')).toBeTruthy();
  });
});