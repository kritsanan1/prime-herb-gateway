import { describe, it, expect } from 'vitest';
import { cn } from '../lib/utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('px-2', 'py-4');
    expect(result).toBe('px-2 py-4');
  });

  it('should handle conditional classes', () => {
    const result = cn('base-class', true && 'conditional-class', false && 'not-included');
    expect(result).toBe('base-class conditional-class');
  });

  it('should handle array of classes', () => {
    const result = cn(['px-2', 'py-4'], 'mb-4');
    expect(result).toBe('px-2 py-4 mb-4');
  });

  it('should handle empty inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle undefined and null values', () => {
    const result = cn('px-2', undefined, null, 'py-4');
    expect(result).toBe('px-2 py-4');
  });

  it('should merge tailwind classes correctly', () => {
    const result = cn('px-2', 'px-4'); // Should merge to the last one
    expect(result).toBe('px-4');
  });
});