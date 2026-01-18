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
                        "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
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
