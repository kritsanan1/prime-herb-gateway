import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Here you would send to your error tracking service
      // Example: Sentry.captureException(error);
    }

    this.setState({
      error,
      errorInfo
    });

    // Call user-provided error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            
            <h1 className="text-lg font-semibold text-gray-900 mb-2">
              เกิดข้อผิดพลาด
            </h1>
            
            <p className="text-gray-600 mb-4">
              ขออภัย มีบางอย่างผิดพลาด กรุณาลองใหม่อีกครั้ง
            </p>

            {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-100 rounded-md p-4 mb-4 text-left">
                <p className="text-sm font-medium text-gray-700 mb-1">Error Details:</p>
                <p className="text-sm text-gray-600 font-mono break-all">
                  {this.state.error?.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                ลองใหม่
              </button>
              
              <button
                onClick={this.handleReload}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                โหลดใหม่
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Home className="mr-2 h-4 w-4" />
                กลับหน้าแรก
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Error boundary wrapper for components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return React.forwardRef<any, P>((props, ref) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} ref={ref} />
    </ErrorBoundary>
  ));
}