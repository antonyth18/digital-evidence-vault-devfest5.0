import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { ShieldCheck, Lock } from 'lucide-react';

export function Login() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            addToast("Welcome back, Officer.", "success");
            navigate('/');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-0 shadow-lg">
                <CardHeader className="text-center space-y-4 pb-8 border-b border-slate-100 bg-slate-50/50">
                    <div className="mx-auto w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center">
                        <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight">SENTINEL</CardTitle>
                        <p className="text-sm text-slate-500 mt-1">Evidence Integrity System</p>
                    </div>
                </CardHeader>
                <CardContent className="pt-8">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Badge ID</label>
                            <div className="relative">
                                <Input placeholder="Enter your badge ID..." className="pl-10" required />
                                <ShieldCheck className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Secure Password</label>
                            <div className="relative">
                                <Input type="password" placeholder="••••••••" className="pl-10" required />
                                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                            </div>
                        </div>
                        <Button className="w-full mt-4" size="lg" isLoading={loading}>
                            Authenticate to Blockchain
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-xs text-slate-400">
                        <p>Protected by SHA-256 Encryption</p>
                        <p>Access is logged to immutable audit trail.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
