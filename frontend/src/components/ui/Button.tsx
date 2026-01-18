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
        default: "bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 shadow-apple-sm hover:shadow-apple-md",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-apple-sm",
        outline: "border border-slate-200 dark:border-white/20 bg-transparent hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white",
        secondary: "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20",
        ghost: "hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
    };

    const sizes = {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10 p-2",
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
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
