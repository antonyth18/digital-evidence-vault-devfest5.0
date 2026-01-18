import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { AIAnalysisResult } from '../components/evidence/AIAnalysisResult';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { Upload, FileText, CheckCircle, Loader2, X } from 'lucide-react';
import { api } from '../utils/api';


export function UploadEvidence() {
    const [uploading, setUploading] = useState(false);
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [caseId, setCaseId] = useState('');
    const [evidenceType, setEvidenceType] = useState('');
    const [collectedBy, setCollectedBy] = useState('');
    const [uploadResult, setUploadResult] = useState<any>(null);
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addToast } = useToast();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStep(2);
        }
    };

    const clearFile = () => {
        setFile(null);
        setStep(1);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUpload = async () => {
        if (!file || !caseId) {
            addToast("Case ID is required", "error");
            return;
        }

        setUploading(true);
        try {
            // 1. Run AI Analysis first (optional feature demo)
            try {
                const analysisRes = await api.analyzeRisk(file);
                setAiAnalysis(analysisRes.analysis);
            } catch (e) {
                console.warn("AI analysis bypassed or failed");
            }

            // 2. Perform real blockchain registration
            const formData = new FormData();
            formData.append('file', file);
            formData.append('caseId', caseId);
            formData.append('evidenceType', evidenceType || file.type.split('/')[0]);
            formData.append('source', 'Web Portal');
            formData.append('collectedBy', collectedBy || 'Unknown Collector');

            const result = await api.registerEvidence(formData);

            setUploadResult(result);
            setUploading(false);
            setStep(3);
            addToast("Evidence successfully anchored to blockchain", "success");
        } catch (error: any) {
            setUploading(false);
            addToast(error.message || "Upload failed", "error");
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Upload Evidence</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Securely ingest new assets into the blockchain.</p>
            </div>

            <div className="relative">
                {step === 1 && (
                    <Card
                        className="border-dashed border-2 p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-900 dark:border-slate-700 transition-colors cursor-pointer group"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                        />
                        <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors rounded-full flex items-center justify-center mb-4">
                            <Upload className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Drag & drop evidence files here</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">or click to browse from secure device</p>
                        <div className="mt-6 flex justify-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                            <span className="flex items-center"><FileText className="w-3 h-3 mr-1" /> SHA-256 Hashing</span>
                            <span className="flex items-center"><FileText className="w-3 h-3 mr-1" /> Auto-Encryption</span>
                        </div>
                    </Card>
                )}

                {step === 2 && (
                    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300 dark:bg-slate-900 dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="dark:text-white">Metadata Entry</CardTitle>
                            <Button variant="ghost" size="sm" onClick={clearFile}><X className="w-4 h-4 mr-2" /> Cancel</Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md flex items-center gap-4 border border-slate-200 dark:border-slate-700">
                                <div className="h-10 w-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{file?.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{(file?.size || 0 / 1024 / 1024).toFixed(2)} MB • Ready to Hash</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium dark:text-slate-200">Case ID</label>
                                    <Input
                                        placeholder="Enter Case ID (e.g. CR-2024-XXXX)"
                                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                        value={caseId}
                                        onChange={e => setCaseId(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium dark:text-slate-200">Evidence Type</label>
                                    <Input
                                        placeholder="Video, Audio, Doc..."
                                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                        value={evidenceType || file?.type.split('/')[0] || ''}
                                        onChange={e => setEvidenceType(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium dark:text-slate-200">Collector Identity</label>
                                <Input
                                    placeholder="Enter collector name or badge ID"
                                    className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                    value={collectedBy}
                                    onChange={e => setCollectedBy(e.target.value)}
                                />
                            </div>

                            {aiAnalysis && (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                    <AIAnalysisResult
                                        riskScore={aiAnalysis.riskScore}
                                        manipulationProbability={aiAnalysis.manipulationProbability}
                                        signals={aiAnalysis.signals || []}
                                        explanation={aiAnalysis.explanation}
                                    />
                                </div>
                            )}
                            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-4 text-sm text-amber-800 dark:text-amber-200 flex gap-3">
                                <div className="mt-0.5"><Loader2 className="w-4 h-4 animate-spin text-amber-600" /></div>
                                <div>
                                    <strong>Immutable Action:</strong> Uploading will permanently record the file's hash on the blockchain. Ensure all metadata is correct.
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button onClick={handleUpload} disabled={uploading}>
                                    {uploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Hashing & Anchoring...
                                        </>
                                    ) : (
                                        "Generate Cryptographic Proof"
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === 3 && (
                    <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 animate-in zoom-in-95">
                        <CardContent className="pt-8 text-center space-y-6">
                            <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center shadow-sm">
                                <CheckCircle className="w-10 h-10 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Evidence Anchored Successfully</h3>
                                <p className="text-emerald-700 dark:text-emerald-300 mt-2">Transaction #{uploadResult?.blockchain.txHash.substring(0, 10)}... confirmed on blockchain.</p>
                            </div>
                            <div className="bg-white/60 dark:bg-slate-800/60 p-6 rounded-lg text-left text-xs font-mono space-y-3 border border-emerald-100 dark:border-emerald-800 max-w-lg mx-auto shadow-sm">
                                <div className="flex justify-between border-b border-emerald-100 dark:border-emerald-800 pb-2">
                                    <span className="text-slate-500 dark:text-slate-400">Evidence ID:</span>
                                    <span className="text-slate-900 dark:text-white font-bold">{uploadResult?.evidence.id}</span>
                                </div>
                                <div className="flex justify-between border-b border-emerald-100 dark:border-emerald-800 pb-2">
                                    <span className="text-slate-500 dark:text-slate-400">File Name:</span>
                                    <span className="text-slate-900 dark:text-white font-bold">{file?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">Hash (SHA-256):</span>
                                    <span className="text-slate-900 dark:text-white truncate ml-4">{uploadResult?.evidence.hash}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">TxID:</span>
                                    <span className="text-slate-900 dark:text-white truncate ml-4">{uploadResult?.blockchain.txHash}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-emerald-100 dark:border-emerald-800">
                                    <span className="text-slate-500 dark:text-slate-400">Timestamp:</span>
                                    <span className="text-slate-900 dark:text-white">{uploadResult?.evidence.timestamp}</span>
                                </div>
                            </div>
                            <div className="pt-4">
                                <Button variant="outline" onClick={clearFile} className="bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">Upload Another Item</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
