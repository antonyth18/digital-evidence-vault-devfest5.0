import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';

export function Layout() {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-slate-100 selection:bg-brand-blue selection:text-white relative">
            {/* Ambient Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/30 dark:bg-brand-blue/20 rounded-full blur-[120px] opacity-70 animate-blob" />
                <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] bg-emerald-500/30 dark:bg-emerald-500/20 rounded-full blur-[120px] opacity-70 animate-blob animation-delay-2000" />
                <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-purple-500/30 dark:bg-purple-500/20 rounded-full blur-[120px] opacity-70 animate-blob animation-delay-4000" />
            </div>

            <Sidebar />
            <main className="flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 z-10 relative">
                <div className="container max-w-7xl mx-auto px-8 py-12 md:px-16 md:py-16">
                     <div className="animate-fade-in-up space-y-8">
                        <Outlet />
                     </div>
                </div>
            </main>
        </div>
    );
}
