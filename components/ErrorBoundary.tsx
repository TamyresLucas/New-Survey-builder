import React from 'react';

interface Props {
    children: React.ReactNode;
    fallback: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
        this.props.onError?.(error, errorInfo);

        // Log to localStorage for debugging
        const errorLog = {
            timestamp: new Date().toISOString(),
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
        };

        try {
            const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
            logs.push(errorLog);
            localStorage.setItem('error_logs', JSON.stringify(logs.slice(-10))); // Keep last 10
        } catch (e) {
            console.error('Failed to log error', e);
        }
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

// Fallback components
export const AppErrorFallback: React.FC<{ error?: Error }> = ({ error }) => (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">The application encountered an error. Your work has been saved.</p>
            <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            >
                Reload Application
            </button>
            {error && (
                <details className="mt-4 text-xs">
                    <summary className="cursor-pointer text-gray-500">Technical Details</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                        {error.message}
                    </pre>
                </details>
            )}
        </div>
    </div>
);
