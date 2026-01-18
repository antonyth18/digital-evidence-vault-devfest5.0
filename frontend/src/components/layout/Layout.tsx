import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';

export function Layout() {
    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
            <Sidebar />
            <main className="flex-1 overflow-auto">
                <div className="container max-w-7xl mx-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
