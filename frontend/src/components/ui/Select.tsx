import React from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { label: string; value: string }[];
}

export function Select({ className, label, options, ...props }: SelectProps) {
    return (
        <div className="relative">
            <select
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
                    className
                )}
                {...props}
            >
                {label && <option value="" disabled selected>{label}</option>}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
        </div>
    );
}
