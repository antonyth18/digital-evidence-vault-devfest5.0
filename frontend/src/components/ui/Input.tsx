import React from "react";
import { cn } from "../../utils/cn";
import { AlertCircle } from "lucide-react";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, ...props }, ref) => {
        return (
            <div className="relative">
                <input
                    type={type}
                    className={cn(
                        "flex h-12 w-full rounded-2xl border-none bg-slate-100 dark:bg-slate-800/50 px-4 py-2 text-sm ring-offset-transparent file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-inner",
                        error && "border-red-500 focus-visible:ring-red-500",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <div className="absolute right-3 top-2.5 text-red-500 pointer-events-none">
                        <AlertCircle className="h-5 w-5" />
                    </div>
                )}
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
        );
    }
);
Input.displayName = "Input";
