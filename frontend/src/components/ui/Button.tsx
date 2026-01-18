import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    isLoading?: boolean;
}

export function Button({
    className,
    variant = "default",
    size = "default",
    isLoading = false,
    children,
    disabled,
    ...props
}: ButtonProps) {
    const variants = {
        default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90 shadow-sm",
        destructive: "bg-red-600 text-slate-50 hover:bg-red-700 shadow-sm",
        outline: "border border-slate-200 bg-white shadow-sm hover:bg-slate-100 hover:text-slate-900",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200/80",
        ghost: "hover:bg-slate-100 hover:text-slate-900",
    };

    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
}
