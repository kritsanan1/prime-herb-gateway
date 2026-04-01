/**
 * Debug utility for development
 * Provides consistent logging and debugging capabilities
 */

export interface DebugConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  prefix: string;
}

class DebugLogger {
  private config: DebugConfig;

  constructor(config: Partial<DebugConfig> = {}) {
    this.config = {
      enabled: process.env.NODE_ENV === 'development',
      level: 'debug',
      prefix: '🐛',
      ...config
    };
  }

  private shouldLog(level: string): boolean {
    if (!this.config.enabled) return false;
    
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevel = levels.indexOf(this.config.level);
    const messageLevel = levels.indexOf(level);
    
    return messageLevel >= currentLevel;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = this.config.prefix;
    const formattedMessage = `[${timestamp}] ${prefix} [${level.toUpperCase()}] ${message}`;
    
    if (data !== undefined) {
      return `${formattedMessage} ${JSON.stringify(data, null, 2)}`;
    }
    
    return formattedMessage;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message: string, data?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, data));
    }
  }

  // Performance measurement utility
  measure(name: string, fn: () => any): any {
    if (!this.config.enabled) return fn();
    
    const start = performance.now();
    this.info(`🚀 Starting ${name}`);
    
    try {
      const result = fn();
      if (result && typeof result.then === 'function') {
        // Handle promises
        return result.finally(() => {
          const end = performance.now();
          this.info(`✅ Completed ${name} in ${(end - start).toFixed(2)}ms`);
        });
      } else {
        const end = performance.now();
        this.info(`✅ Completed ${name} in ${(end - start).toFixed(2)}ms`);
        return result;
      }
    } catch (error) {
      const end = performance.now();
      this.error(`❌ Failed ${name} in ${(end - start).toFixed(2)}ms`, error);
      throw error;
    }
  }

  // Component render counter for debugging
  createRenderCounter(componentName: string) {
    let count = 0;
    return () => {
      count++;
      this.debug(`${componentName} rendered`, { renderCount: count });
      return count;
    };
  }
}

// Global debug instance
export const debug = new DebugLogger();

// Component-specific debuggers
export const cartDebug = new DebugLogger({ prefix: '🛒' });
export const authDebug = new DebugLogger({ prefix: '🔐' });
export const apiDebug = new DebugLogger({ prefix: '🌐' });
export const uiDebug = new DebugLogger({ prefix: '🎨' });

// Type-safe debug utility for TypeScript
export function createDebugger(namespace: string) {
  return new DebugLogger({ prefix: namespace });
}