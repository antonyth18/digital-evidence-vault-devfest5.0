import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { AlertOctagon, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '../utils/api';

export function Alerts() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const data = await api.getAllAlerts();
                if (data.success) {
                    // Map backend alerts to UI format
                    const mappedAlerts = data.alerts.map((a: any) => ({
                        id: a.id,
                        severity: a.riskScore >= 70 ? 'high' : a.riskScore >= 40 ? 'medium' : 'low',
                        title: a.detectedBy === 'AI' ? 'AI Risk Warning' : 'Integrity Mismatch',
                        desc: a.reason,
                        time: new Date(a.timestamp).toLocaleTimeString(),
                        evidenceId: a.evidenceId
                    }));
                    setAlerts(mappedAlerts);
                }
            } catch (error) {
                console.error('Failed to fetch alerts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-500">Loading system alerts...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Alerts & Flags</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Active system integrity warnings.</p>
            </div>

            <div className="space-y-4">
                {alerts.length > 0 ? (
                    alerts.map((alert) => (
                        <Card key={alert.id} className="border-l-4 border-l-transparent data-[severity=high]:border-l-red-500 data-[severity=medium]:border-l-amber-500 data-[severity=low]:border-l-blue-500 dark:bg-slate-900 dark:border-slate-800" data-severity={alert.severity}>
                            <CardContent className="p-6 flex items-start gap-4">
                                <div className="mt-1">
                                    {alert.severity === 'high' && <AlertOctagon className="text-red-600 dark:text-red-400 w-6 h-6" />}
                                    {alert.severity === 'medium' && <AlertTriangle className="text-amber-600 dark:text-amber-400 w-6 h-6" />}
                                    {alert.severity === 'low' && <Info className="text-blue-600 dark:text-blue-400 w-6 h-6" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{alert.title}</h3>
                                        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{alert.time}</span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 mt-1">{alert.desc}</p>
                                    <div className="mt-4 flex gap-2">
                                        <Badge variant="outline" className="font-mono dark:border-slate-700 dark:text-slate-300">{alert.evidenceId}</Badge>
                                        <Badge variant={alert.severity === 'high' ? 'danger' : alert.severity === 'medium' ? 'warning' : 'secondary'}>
                                            {alert.severity.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                        <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">No active alerts. System integrity confirmed.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
