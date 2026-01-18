import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    label?: string;
    value?: string;
    options: { label: string; value: string }[];
    onChange?: (e: { target: { value: string } }) => void;
    placeholder?: string;
}

export function Select({ className, label, value, options, onChange, placeholder = "Select...", ...props }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    // Handle clicking outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (optionValue: string) => {
        if (onChange) {
            // Mock event object for compatibility with existing code
            onChange({ target: { value: optionValue } });
        }
        setIsOpen(false);
    };

    return (
        <div className={cn("relative w-full", className)} ref={containerRef} {...props}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm transition-all duration-200",
                    "hover:border-slate-300 hover:bg-slate-50",
                    "focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue",
                    "dark:bg-slate-900/50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5",
                    isOpen && "border-brand-blue ring-2 ring-brand-blue/20 dark:border-brand-blue/50"
                )}
            >
                <span className={cn("truncate", !selectedOption && "text-slate-400")}>
                    {selectedOption ? selectedOption.label : (label || placeholder)}
                </span>
                <ChevronDown
                    className={cn(
                        "ml-2 h-4 w-4 text-slate-400 transition-transform duration-200",
                        isOpen && "transform rotate-180 text-brand-blue"
                    )}
                />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute z-50 mt-2 w-full min-w-[140px] overflow-hidden rounded-xl border border-slate-100 bg-white/95 p-1 shadow-apple-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95"
                    >
                        {label && !value && (
                            <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider opacity-70">
                                {label}
                            </div>
                        )}
                        <div className="max-h-[240px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={cn(
                                        "relative flex w-full select-none items-center rounded-lg py-2 pl-2 pr-8 text-sm outline-none transition-colors",
                                        "hover:bg-slate-100 dark:hover:bg-white/10",
                                        "focus:bg-slate-100 dark:focus:bg-white/10",
                                        option.value === value
                                            ? "font-medium text-brand-blue bg-brand-blue/5 dark:bg-brand-blue/10"
                                            : "text-slate-700 dark:text-slate-200"
                                    )}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {option.value === value && (
                                        <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                                            <Check className="h-4 w-4" />
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
