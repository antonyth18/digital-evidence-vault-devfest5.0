import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { ShieldCheck, ShieldAlert, FileSearch, CheckCircle2, Loader2, Upload } from 'lucide-react';
import { api } from '../utils/api';
import { useToast } from '../components/ui/Toast';

export function Verification() {
    const [status, setStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
    const [evidenceItems, setEvidenceItems] = useState<any[]>([]);
    const [selectedEvidenceId, setSelectedEvidenceId] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<any>(null);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchEvidence = async () => {
            try {
                const data = await api.getEvidence();
                if (data.success) {
                    setEvidenceItems(data.evidence);
                    if (data.evidence.length > 0) setSelectedEvidenceId(data.evidence[0].evidenceId);
                }
            } catch (error) {
                console.error('Failed to fetch evidence:', error);
            }
        };
        fetchEvidence();
    }, []);

    const handleVerify = async () => {
        if (!selectedEvidenceId || !file) {
            addToast('Please select an evidence ID and upload a file to verify.', 'error');
            return;
        }

        setStatus('verifying');
        try {
            const data = await api.verifyIntegrity(selectedEvidenceId, file);
            setResult(data);
            if (data.verified) {
                setStatus('verified');
            } else {
                setStatus('failed');
            }
        } catch (error) {
            console.error('Verification failed:', error);
            setStatus('failed');
            addToast('An error occurred during verification check.', 'error');
        }
    };

    const evidenceOptions = evidenceItems.map(item => ({
        label: `${item.evidenceId} - ${item.fileName}`,
        value: item.evidenceId
    }));

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Evidence Verification</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Courtroom-grade authenticity verification using blockchain and SHA-256.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4">
                    <Card className="dark:bg-slate-900 dark:border-slate-800">
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    Select Evidence ID
                                </label>
                                <Select
                                    value={selectedEvidenceId}
                                    onChange={(e) => setSelectedEvidenceId(e.target.value)}
                                    options={evidenceOptions}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    Upload File to Check
                                </label>
                                <div
                                    className="p-4 border-2 border-dashed rounded-lg text-center text-sm text-slate-500 dark:text-slate-400 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                >
                                    {file ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <ShieldCheck className="w-5 h-5 text-blue-500" />
                                            <span className="truncate max-w-[150px]">{file.name}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                            Drop file or click to browse
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                    />
                                </div>
                            </div>

                            <Button
                                className="w-full"
                                onClick={handleVerify}
                                disabled={status === 'verifying' || !file}
                            >
                                {status === 'verifying' ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Checking Blockchain...
                                    </>
                                ) : 'Verify Integrity'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    {status === 'idle' && (
                        <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 dark:text-slate-500">
                            <FileSearch className="w-16 h-16 mb-4 opacity-50" />
                            <p>Select evidence and upload a file to begin cross-reference...</p>
                        </div>
                    )}

                    {status === 'verifying' && (
                        <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                            <Loader2 className="w-12 h-12 mb-4 text-blue-500 animate-spin" />
                            <p className="text-slate-500">Computing SHA-256 hash and verifying on Ethereum network...</p>
                        </div>
                    )}

                    {status === 'verified' && (
                        <Card className="border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/30 dark:border-emerald-700 h-full">
                            <CardContent className="flex flex-col items-center justify-center h-full p-12 space-y-6">
                                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center animate-bounce-short">
                                    <ShieldCheck className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 tracking-tight">VERIFICATION PASSED</h3>
                                    <p className="text-emerald-700 dark:text-emerald-300 mt-2">Digital signature matches blockchain record exactly.</p>
                                </div>

                                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-md border border-emerald-200 dark:border-emerald-800 w-full max-w-md mt-6">
                                    <div className="flex justify-between items-center text-sm mb-2">
                                        <span className="text-slate-500 dark:text-slate-400">Blockchain Hash:</span>
                                        <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold break-all">
                                            {result?.submittedHash}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Transaction ID:</span>
                                        <span className="font-mono text-xs text-slate-400 dark:text-slate-500 break-all">
                                            {result?.blockchain?.txHash}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 w-full mt-8">
                                    <div className="bg-white dark:bg-slate-800/50 p-4 rounded border border-emerald-200 dark:border-emerald-800 text-center">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Integrity</p>
                                        <p className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1"><CheckCircle2 className="w-4 h-4" /> Valid</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800/50 p-4 rounded border border-emerald-200 dark:border-emerald-800 text-center">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Custody</p>
                                        <p className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1"><CheckCircle2 className="w-4 h-4" /> Unbroken</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800/50 p-4 rounded border border-emerald-200 dark:border-emerald-800 text-center">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</p>
                                        <p className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1"><CheckCircle2 className="w-4 h-4" /> Legal</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {status === 'failed' && (
                        <Card className="border-red-500 bg-red-50/30 dark:bg-red-950/30 dark:border-red-700 h-full">
                            <CardContent className="flex flex-col items-center justify-center h-full p-12 space-y-6">
                                <div className="w-24 h-24 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                                    <ShieldAlert className="w-12 h-12 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-3xl font-bold text-red-900 dark:text-red-100 tracking-tight">VERIFICATION FAILED</h3>
                                    <p className="text-red-700 dark:text-red-300 mt-2">Hash mismatch detected. Evidence may have been tampered with or is incorrect.</p>
                                </div>

                                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-md border border-red-200 dark:border-red-800 w-full max-w-md mt-6">
                                    <div className="flex justify-between items-center text-sm mb-2">
                                        <span className="text-slate-500 dark:text-slate-400">Expected Hash:</span>
                                        <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
                                            {result?.expectedHash?.substring(0, 10)}...
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Computed Hash:</span>
                                        <span className="font-mono text-xs text-red-600 dark:text-red-400 font-bold">
                                            {result?.submittedHash?.substring(0, 10)}...
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
