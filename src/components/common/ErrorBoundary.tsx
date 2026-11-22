import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '../ui/Button';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-zinc-50 text-center">
          <div className="rounded-full bg-rose-50 p-3 text-rose-600 mb-3 border border-rose-200">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-sm font-semibold text-zinc-900 mb-1">
            {this.props.fallbackTitle || 'An Unexpected Error Occurred'}
          </h2>
          <p className="text-xs text-zinc-600 max-w-md mb-4">
            {this.state.error?.message || 'Something went wrong while rendering this view.'}
          </p>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={this.handleReset}>
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              <span>Return to Dashboard</span>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
