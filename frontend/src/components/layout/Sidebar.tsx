import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Upload,
    GitCommit,
    ShieldCheck,
    AlertTriangle,
    History,
    Settings,
    Moon,
    Sun
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Evidence Vault', href: '/vault', icon: FileText },
    { name: 'Upload Evidence', href: '/upload', icon: Upload },
    { name: 'Chain of Custody', href: '/custody', icon: GitCommit },
    { name: 'Verification', href: '/verification', icon: ShieldCheck },
    { name: 'Alerts & Flags', href: '/alerts', icon: AlertTriangle },
    { name: 'Audit Log', href: '/audit', icon: History },
    { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { theme, toggleTheme } = useTheme();

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 flex flex-col w-[280px] bg-slate-50/95 dark:bg-black/95 backdrop-blur-xl border-r border-slate-200/50 dark:border-white/10 min-h-screen transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:bg-slate-50/80 dark:md:bg-black/80",
                isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
            )}>
                <div className="p-8 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-blue rounded-xl shadow-lg shadow-brand-blue/20">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white leading-none">
                                    Sentinel
                                </h1>
                                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                                    Evidence Integrity
                                </p>
                            </div>
                        </div>
                        {/* Mobile Close Button (Optional, backdrop click is usually enough but explicit is nice) */}
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            onClick={() => onClose?.()} // Close sidebar on mobile nav click
                            className={({ isActive }) => cn(
                                "group flex items-center px-4 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-200 ease-out",
                                isActive
                                    ? "bg-white dark:bg-white/10 text-brand-blue shadow-apple-sm dark:text-white"
                                    : "text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={cn(
                                        "w-[18px] h-[18px] mr-3 transition-colors",
                                        isActive ? "text-brand-blue dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                                    )} />
                                    {item.name}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Theme Toggle & Status */}
                <div className="p-6 border-t border-slate-200/50 dark:border-white/5 space-y-4">
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/10 transition-all shadow-sm"
                    >
                        <span>Appearance</span>
                        <div className="flex items-center gap-2">
                            {theme === 'dark' ? (
                                <Moon className="w-3.5 h-3.5" />
                            ) : (
                                <Sun className="w-3.5 h-3.5 text-amber-500" />
                            )}
                        </div>
                    </button>

                </div>
            </div>
        </>
    );
}
