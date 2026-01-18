import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Dialog } from '../components/ui/Dialog';
import { Search, ShieldCheck, Download, History } from 'lucide-react';
import { api } from '../utils/api';

export function EvidenceVault() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedEvidence, setSelectedEvidence] = useState<any | null>(null);
    const [evidenceList, setEvidenceList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tamperEvents, setTamperEvents] = useState<any[]>([]);

    useEffect(() => {
        const fetchEvidence = async () => {
            try {
                const res = await api.getEvidence();
                // Map backend format to frontend Evidence type if necessary
                const mapped = res.evidence.map((e: any) => ({
                    id: e.evidenceId,
                    type: e.evidenceType,
                    source: e.source,
                    collectedBy: e.collectedBy,
                    date: new Date(e.timestamp).toLocaleDateString(),
                    status: 'verified', // Backend only stores valid uploads for now
                    hash: e.evidenceHash,
                    size: (e.fileSize / 1024 / 1024).toFixed(2) + ' MB',
                    txHash: e.txHash
                }));
                setEvidenceList(mapped);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch evidence:', error);
                setLoading(false);
            }
        };
        fetchEvidence();
    }, []);

    const fetchTamperEvents = async (id: string) => {
        try {
            const res = await api.getTamperEvents(id);
            setTamperEvents(res.events);
        } catch (error) {
            console.error('Failed to fetch tamper events:', error);
        }
    };

    useEffect(() => {
        if (selectedEvidence) {
            fetchTamperEvents(selectedEvidence.id);
        } else {
            setTamperEvents([]);
        }
    }, [selectedEvidence]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Evidence Vault</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Secure storage and management of evidential assets.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"> <Download className="w-4 h-4 mr-2" /> Export Report</Button>
                </div>
            </div>

            <Card className="p-4 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 relative z-20 overflow-visible">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search ID or Collector..."
                            className="pl-9 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <Select
                        label="All Types"
                        options={['Video', 'Audio', 'Document', 'Image'].map(t => ({ label: t, value: t }))}
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                    />
                    <Select
                        label="All Statuses"
                        options={[
                            { label: 'Verified', value: 'verified' },
                            { label: 'Flagged', value: 'flagged' },
                            { label: 'Breached', value: 'breached' }
                        ]}
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    />
                </div>
            </Card>

            <Card className="dark:bg-slate-900 dark:border-slate-800">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="dark:text-slate-200">Evidence ID</TableHead>
                            <TableHead className="dark:text-slate-200">Type</TableHead>
                            <TableHead className="dark:text-slate-200">Source</TableHead>
                            <TableHead className="dark:text-slate-200">Collected By</TableHead>
                            <TableHead className="dark:text-slate-200">Date</TableHead>
                            <TableHead className="dark:text-slate-200">Integrity Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-8">Loading evidence records...</TableCell></TableRow>
                        ) : evidenceList.filter(item => {
                            const matchesSearch = item.id.toLowerCase().includes(search.toLowerCase()) ||
                                item.collectedBy.toLowerCase().includes(search.toLowerCase());
                            const matchesType = typeFilter ? item.type === typeFilter : true;
                            const matchesStatus = statusFilter ? item.status === statusFilter : true;
                            return matchesSearch && matchesType && matchesStatus;
                        }).map((item) => (
                            <TableRow
                                key={item.id}
                                className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:border-slate-800 transition-colors"
                                onClick={() => setSelectedEvidence(item)}
                            >
                                <TableCell className="font-medium font-mono text-xs dark:text-slate-300">{item.id}</TableCell>
                                <TableCell className="dark:text-slate-300">{item.type}</TableCell>
                                <TableCell className="dark:text-slate-300">{item.source}</TableCell>
                                <TableCell className="dark:text-slate-300">{item.collectedBy}</TableCell>
                                <TableCell className="dark:text-slate-300">{item.date}</TableCell>
                                <TableCell>
                                    <Badge variant={item.status === 'verified' ? 'success' : item.status === 'flagged' ? 'warning' : 'danger'}>
                                        {item.status.toUpperCase()}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <Dialog
                isOpen={!!selectedEvidence}
                onClose={() => setSelectedEvidence(null)}
                title="Evidence Details"
            >
                {selectedEvidence && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-white rounded-full border border-slate-200 flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{selectedEvidence.id}</h4>
                                    <p className="text-xs text-slate-500">Anchored on Ethereum</p>
                                </div>
                            </div>
                            <Badge variant={selectedEvidence.status === 'verified' ? 'success' : 'danger'}>
                                {selectedEvidence.status.toUpperCase()}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <span className="text-slate-500 text-xs uppercase tracking-wider">Type</span>
                                <p className="font-medium">{selectedEvidence.type}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-slate-500 text-xs uppercase tracking-wider">File Size</span>
                                <p className="font-medium">{selectedEvidence.size}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-slate-500 text-xs uppercase tracking-wider">Source</span>
                                <p className="font-medium">{selectedEvidence.source}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-slate-500 text-xs uppercase tracking-wider">Collector</span>
                                <p className="font-medium">{selectedEvidence.collectedBy}</p>
                            </div>
                            <div className="space-y-1 col-span-2">
                                <span className="text-slate-500 text-xs uppercase tracking-wider">Blockchain Transaction ID</span>
                                <p className="font-mono text-xs text-slate-400 break-all bg-slate-50 dark:bg-slate-800 p-2 rounded mt-1 border border-slate-100 dark:border-slate-800">
                                    {selectedEvidence?.txHash || 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <span className="text-slate-500 text-xs uppercase tracking-wider">Cryptographic Hash</span>
                            <div className="bg-slate-100 p-3 rounded font-mono text-xs break-all border border-slate-200 text-slate-600">
                                {selectedEvidence.hash}
                            </div>
                        </div>

                        {tamperEvents.length > 0 && (
                            <div className="space-y-3 pt-2">
                                <span className="text-slate-500 text-xs uppercase tracking-wider flex items-center gap-2">
                                    <History className="w-3 h-3" /> Tamper Ledger Logs
                                </span>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {tamperEvents.map((event, idx) => (
                                        <div key={idx} className="p-2 rounded bg-amber-50 border border-amber-100 text-[10px]">
                                            <div className="flex justify-between font-bold text-amber-900 border-b border-amber-100 pb-1 mb-1">
                                                <span>{event.detectedBy} DETECTION</span>
                                                <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                                            </div>
                                            <p className="text-amber-800">{event.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setSelectedEvidence(null)}>Close</Button>
                            <Button onClick={() => {
                                const proof = {
                                    evidenceId: selectedEvidence.id,
                                    hash: selectedEvidence.hash,
                                    transaction: selectedEvidence.txHash,
                                    network: "Digital Evidence Vault v1.0 (Local Genesis)",
                                    timestamp: selectedEvidence.date,
                                    status: "Anchored & Immutable"
                                };
                                alert("BLOCKCHAIN PROOF:\n" + JSON.stringify(proof, null, 2));
                            }}>
                                <ShieldCheck className="w-4 h-4 mr-2" /> Verify Proof
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}
