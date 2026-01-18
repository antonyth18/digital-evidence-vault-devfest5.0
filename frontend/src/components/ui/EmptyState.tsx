import { type ReactNode } from 'react';
import { FileQuestion, AlertCircle, FolderX } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
    icon?: 'file' | 'alert' | 'folder' | ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function EmptyState({ icon = 'file', title, description, action, className }: EmptyStateProps) {
    const getIcon = () => {
        if (typeof icon !== 'string') return icon;

        const iconClass = "w-16 h-16 text-slate-400 dark:text-slate-600 mb-4";

        switch (icon) {
            case 'file':
                return <FileQuestion className={iconClass} />;
            case 'alert':
                return <AlertCircle className={iconClass} />;
            case 'folder':
                return <FolderX className={iconClass} />;
            default:
                return <FileQuestion className={iconClass} />;
        }
    };

    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800",
            className
        )}>
            {getIcon()}
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">
                    {description}
                </p>
            )}
            {action && (
                <Button onClick={action.onClick}>
                    {action.label}
                </Button>
            )}
        </div>
    );
}
