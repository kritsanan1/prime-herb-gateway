/**
 * Performance monitoring utilities
 * Helps track and optimize app performance
 */

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry;
        this.metrics.largestContentfulPaint = lastEntry.startTime;
        console.log('📊 LCP:', lastEntry.startTime.toFixed(2), 'ms');
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (e) {
      console.warn('LCP observer not supported');
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const firstInput = list.getEntries()[0] as PerformanceEntry;
        this.metrics.firstInputDelay = firstInput.processingStart - firstInput.startTime;
        console.log('📊 FID:', this.metrics.firstInputDelay.toFixed(2), 'ms');
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch (e) {
      console.warn('FID observer not supported');
    }

    // Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.metrics.cumulativeLayoutShift = clsValue;
        console.log('📊 CLS:', clsValue.toFixed(4));
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (e) {
      console.warn('CLS observer not supported');
    }
  }

  measurePageLoad(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
          this.metrics.timeToInteractive = navigation.domInteractive - navigation.fetchStart;
          
          console.log('📊 Page Load Metrics:', {
            pageLoadTime: this.metrics.pageLoadTime?.toFixed(2) + 'ms',
            timeToInteractive: this.metrics.timeToInteractive?.toFixed(2) + 'ms',
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart + 'ms'
          });
        }
      }, 100);
    });
  }

  measureComponentRender<T extends (...args: any[]) => any>(
    componentName: string,
    fn: T,
    ...args: Parameters<T>
  ): ReturnType<T> {
    const startMark = `${componentName}-start`;
    const endMark = `${componentName}-end`;
    const measureName = `${componentName}-render`;

    performance.mark(startMark);
    const result = fn(...args);
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);

    const measures = performance.getEntriesByName(measureName);
    const latestMeasure = measures[measures.length - 1];
    
    if (latestMeasure) {
      console.log(`⏱️ ${componentName} render:`, latestMeasure.duration.toFixed(2), 'ms');
    }

    return result;
  }

  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  reportMetrics(): void {
    console.table(this.metrics);
  }

  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  if (typeof window === 'undefined') return null;
  
  return performanceMonitor;
}