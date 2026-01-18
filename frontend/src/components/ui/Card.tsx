import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Card({ className, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "bg-white border border-slate-200 rounded-lg shadow-sm p-6",
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
