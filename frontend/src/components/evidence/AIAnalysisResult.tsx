import { AlertTriangle, CheckCircle, Brain, Eye } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface AIAnalysisProps {
    riskScore: number;
    manipulationProbability: number;
    signals: any[];
    explanation: string;
}

export function AIAnalysisResult({ riskScore, manipulationProbability, signals, explanation }: AIAnalysisProps) {
    const isHighRisk = riskScore > 70;
    const isMediumRisk = riskScore > 30 && riskScore <= 70;

    return (
        <Card className={`p-4 sm:p-6 border ${isHighRisk ? 'border-red-200 bg-red-50/50' : isMediumRisk ? 'border-amber-200 bg-amber-50/50' : 'border-emerald-200 bg-emerald-50/50'} dark:bg-slate-900`}>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Risk Gauge */}
                <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-slate-700" />
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                            strokeDasharray={251.2}
                            strokeDashoffset={251.2 - (251.2 * riskScore) / 100}
                            className={`${isHighRisk ? 'text-red-500' : isMediumRisk ? 'text-amber-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{riskScore}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-medium">Risk</span>
                    </div>
                </div>

                <div className="flex-1 space-y-4 w-full">
                    <div className="text-center sm:text-left">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                            <Brain className="w-5 h-5 text-brand-blue" />
                            AI Forensics Analysis
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-100 mt-1">{explanation}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 text-xs">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                            <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1"> manipulation probability</span>
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                                <span className="font-mono text-base font-bold text-slate-900 dark:text-white">{(manipulationProbability * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>

                    {signals.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {signals.map((signal: any, idx: number) => (
                                <Badge key={idx} variant={signal.severity === 'HIGH' ? 'danger' : signal.severity === 'MEDIUM' ? 'warning' : 'outline'}>
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    {signal.detail}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <Badge variant="success" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                            <CheckCircle className="w-3 h-3 mr-1" /> Verified Authentic
                        </Badge>
                    )}
                </div>
            </div>
        </Card>
    );
}
