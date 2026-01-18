import { cn } from '../../utils/cn';

interface LoadingSkeletonProps {
    className?: string;
    variant?: 'text' | 'circle' | 'rectangle' | 'card' | 'table';
    count?: number;
}

export function LoadingSkeleton({ className, variant = 'rectangle', count = 1 }: LoadingSkeletonProps) {
    const getSkeletonClass = () => {
        switch (variant) {
            case 'text':
                return 'h-4 w-full rounded';
            case 'circle':
                return 'w-12 h-12 rounded-full';
            case 'rectangle':
                return 'h-20 w-full rounded-md';
            case 'card':
                return 'h-32 w-full rounded-lg';
            case 'table':
                return 'h-12 w-full rounded';
            default:
                return 'h-4 w-full rounded';
        }
    };

    const skeletonBaseClass = 'animate-pulse bg-slate-200 dark:bg-slate-800';
    const skeletonClass = cn(skeletonBaseClass, getSkeletonClass(), className);

    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className={skeletonClass} />
            ))}
        </>
    );
}

// Specific skeleton components for common use cases
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4">
                    <LoadingSkeleton variant="text" className="w-1/6" />
                    <LoadingSkeleton variant="text" className="w-1/4" />
                    <LoadingSkeleton variant="text" className="w-1/6" />
                    <LoadingSkeleton variant="text" className="w-1/4" />
                    <LoadingSkeleton variant="text" className="w-1/6" />
                </div>
            ))}
        </div>
    );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3 dark:border-slate-800">
                    <LoadingSkeleton variant="text" className="w-1/2" />
                    <LoadingSkeleton variant="text" className="w-3/4 h-8" />
                    <LoadingSkeleton variant="text" className="w-1/3" />
                </div>
            ))}
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="w-full h-64 flex items-center justify-center border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-800">
            <div className="text-center space-y-2">
                <div className="animate-spin w-12 h-12 border-4 border-slate-300 dark:border-slate-700 border-t-slate-600 dark:border-t-slate-400 rounded-full mx-auto" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Loading chart data...</p>
            </div>
        </div>
    );
}
