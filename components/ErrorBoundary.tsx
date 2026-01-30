'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Garden Error Boundary caught an error:', error, errorInfo);
    }

    resetError = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            const FallbackComponent = this.props.fallback || DefaultErrorFallback;
            return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
        }

        return this.props.children;
    }
}

const DefaultErrorFallback: React.FC<{ error?: Error; resetError: () => void }> = ({ error, resetError }) => (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-xl border border-black/5 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="font-serif-display text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Your garden encountered an unexpected error. Don't worry - your data is safe in local storage.
            </p>
            {error && (
                <details className="text-left mb-6 bg-gray-50 rounded-lg p-4">
                    <summary className="cursor-pointer text-xs font-medium text-gray-700 mb-2">
                        Technical Details
                    </summary>
                    <code className="text-xs text-red-600 break-all">{error.message}</code>
                </details>
            )}
            <button
                onClick={resetError}
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
                <RefreshCw className="w-4 h-4" />
                Try Again
            </button>
        </div>
    </div>
);