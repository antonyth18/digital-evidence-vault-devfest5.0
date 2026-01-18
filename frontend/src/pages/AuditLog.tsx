import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Loader2 } from 'lucide-react';
import { api } from '../utils/api';

export function AuditLog() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await api.getAuditLogs();
                if (data.success) {
                    setLogs(data.logs);
                }
            } catch (error) {
                console.error('Failed to fetch audit logs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-500">Loading immutable ledger...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Audit Log</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Immutable chronological system ledger.</p>
            </div>

            <Card className="dark:bg-slate-900 dark:border-slate-800">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[180px] dark:text-slate-200">Timestamp</TableHead>
                            <TableHead className="dark:text-slate-200">Ref ID</TableHead>
                            <TableHead className="dark:text-slate-200">Actor</TableHead>
                            <TableHead className="dark:text-slate-200">Action</TableHead>
                            <TableHead className="text-right dark:text-slate-200">Context/Hash</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length > 0 ? (
                            logs.map((log) => (
                                <TableRow key={log.id} className="dark:border-slate-800 dark:hover:bg-slate-800/50">
                                    <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs dark:text-slate-300">{log.id}</TableCell>
                                    <TableCell className="dark:text-slate-300">
                                        <span className={log.actor.includes('AI') || log.actor.includes('BLOCKCHAIN') ? "text-blue-500 font-semibold" : ""}>
                                            {log.actor}
                                        </span>
                                    </TableCell>
                                    <TableCell className="dark:text-slate-300">{log.action}</TableCell>
                                    <TableCell className="text-right font-mono text-xs text-slate-400 dark:text-slate-500">
                                        <div className="flex flex-col items-end">
                                            <span className="truncate max-w-[150px]">{log.hash}</span>
                                            <span className="text-[10px] text-slate-500 mt-1">{log.details}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                                    No transaction records found on the ledger.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
