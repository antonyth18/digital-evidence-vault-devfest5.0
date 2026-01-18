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

export function Sidebar() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex flex-col w-64 bg-slate-900 dark:bg-slate-950 text-white min-h-screen border-r border-slate-800 dark:border-slate-900">
            <div className="p-6 border-b border-slate-800 dark:border-slate-900">
                <h1 className="text-lg font-bold tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    <span>SENTINEL</span>
                </h1>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">Evidence Integrity</p>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {navigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) => cn(
                            "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                            isActive
                                ? "bg-slate-800 dark:bg-slate-900 text-white border-l-4 border-emerald-500"
                                : "text-slate-400 dark:text-slate-500 hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white"
                        )}
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            {/* Theme Toggle */}
            <div className="p-4 border-t border-slate-800 dark:border-slate-900 space-y-3">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-4 py-2 rounded-md bg-slate-800 dark:bg-slate-900 hover:bg-slate-700 dark:hover:bg-slate-800 transition-colors text-sm"
                >
                    <span className="text-slate-300 dark:text-slate-400">Theme</span>
                    <div className="flex items-center gap-2">
                        {theme === 'dark' ? (
                            <Moon className="w-4 h-4 text-slate-400" />
                        ) : (
                            <Sun className="w-4 h-4 text-amber-400" />
                        )}
                    </div>
                </button>

                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">NET: MAINNET-BETA</span>
                </div>
            </div>
        </div>
    );
}
