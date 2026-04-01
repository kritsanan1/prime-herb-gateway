import { describe, it, expect } from 'vitest';
import { cn } from '../lib/utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('should handle conditional classes', () => {
    expect(cn('base-class', true && 'conditional-true', false && 'conditional-false')).toBe('base-class conditional-true');
  });

  it('should merge Tailwind classes correctly', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4'); // Later class should override
  });

  it('should handle arrays of classes', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });

  it('should handle objects for conditional classes', () => {
    expect(cn({ 'active-class': true, 'inactive-class': false })).toBe('active-class');
  });

  it('should handle mixed inputs', () => {
    expect(cn('base', ['array1', 'array2'], { conditional: true }, null, undefined, '')).toBe('base array1 array2 conditional');
  });
});