import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Card({ className, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "bg-white dark:bg-slate-900/50 rounded-3xl shadow-apple-sm hover:shadow-apple-lg hover:-translate-y-1 transition-all duration-300 ease-out border border-transparent dark:border-white/5 p-6 backdrop-blur-sm",
                className
            )}
            {...props}
        />
    );
}

export function CardHeader({ className, ...props }: CardProps) {
    return (
        <div
            className={cn("flex flex-col space-y-1.5 pb-4", className)}
            {...props}
        />
    );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={cn("text-lg font-semibold leading-none tracking-tight text-slate-900", className)}
            {...props}
        />
    );
}

export function CardContent({ className, ...props }: CardProps) {
    return <div className={cn("pt-0", className)} {...props} />;
}
