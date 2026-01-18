import React from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    description?: string;
}

export function Dialog({ isOpen, onClose, title, description, children }: DialogProps) {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Content */}
            <div className={cn("relative z-50 w-full max-w-lg scale-100 gap-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-lg sm:rounded-lg animate-in fade-in-0 zoom-in-95 duration-200")}>
                <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold leading-none tracking-tight dark:text-white">{title}</h2>
                        <button onClick={onClose} className="opacity-70 ring-offset-white dark:ring-offset-slate-900 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-slate-300 focus:ring-offset-2 dark:text-slate-400 dark:hover:text-white">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                    </div>
                    {description && <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>}
                </div>
                <div className="mt-4">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
