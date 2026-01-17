import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Shield, AlertTriangle, FileText, Lock, TrendingUp } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { EvidenceStatusChart } from '../components/charts/EvidenceStatusChart';
import { EvidenceTrendChart } from '../components/charts/EvidenceTrendChart';
import { CollectorActivityChart } from '../components/charts/CollectorActivityChart';
import { useEffect, useState } from 'react';
import { api } from '../utils/api';

export function Dashboard() {
    const [stats, setStats] = useState<any>(null);
    const [statusData, setStatusData] = useState<any[]>([]);
    const [trendData, setTrendData] = useState<any[]>([]);
    const [collectorData, setCollectorData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [summary, status, trends, collectors] = await Promise.all([
                    api.getDashboardSummary(),
                    api.getAnalyticsStatus(),
                    api.getAnalyticsTrends(),
                    api.getAnalyticsCollectors()
                ]);

                setStats(summary);
                setStatusData(status);
                setTrendData(trends);
                setCollectorData(collectors);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">System status and evidence integrity overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium dark:text-slate-200">Total Evidence</CardTitle>
                        <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold dark:text-white">{loading ? '...' : (stats?.totalEvidence || 0)}</div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Live records from blockchain</p>
                    </CardContent>
                </Card>
                <Card className="dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium dark:text-slate-200">Verified Safe</CardTitle>
                        <Shield className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {loading ? '...' : (stats?.totalEvidence > 0 ? (Math.round((stats.verifiedSafe / stats.totalEvidence) * 100) + '%') : '100%')}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {loading ? '...' : stats?.verifiedSafe} items verified
                        </p>
                    </CardContent>
                </Card>
                <Card className="dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium dark:text-slate-200">Active Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{loading ? '...' : (stats?.activeAlerts || 0)}</div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Tamper ledger detection</p>
                    </CardContent>
                </Card>
                <Card className="dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium dark:text-slate-200">Custody Breaches</CardTitle>
                        <Lock className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {loading ? '...' : (stats?.custodyBreaches || 0)}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {stats?.custodyBreaches > 0 ? 'Action required' : 'No critical breaches'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-white">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            Evidence Upload Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EvidenceTrendChart data={trendData} />
                    </CardContent>
                </Card>

                <Card className="dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="dark:text-white">Integrity Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EvidenceStatusChart data={statusData} />
                    </CardContent>
                </Card>
            </div>

            {/* Full width chart */}
            <Card className="dark:bg-slate-900 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="dark:text-white">Top Collectors (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    <CollectorActivityChart data={collectorData} />
                </CardContent>
            </Card>

            {/* Recent Activity & System Status */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="dark:text-white">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {stats?.recentActivity?.length > 0 ? (
                                stats.recentActivity.map((activity: any, i: number) => (
                                    <div key={i} className="flex items-center">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none dark:text-white">Evidence #{activity.id} {activity.action}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{activity.actor}</p>
                                        </div>
                                        <div className="ml-auto font-medium text-sm text-slate-500 dark:text-slate-400">
                                            {new Date(activity.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                [1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center opacity-50">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none dark:text-white">Mock Evidence #EF-{200 + i} Uploaded</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Officer John Doe • Station 4</p>
                                        </div>
                                        <div className="ml-auto font-medium text-sm text-slate-500 dark:text-slate-400">Sample Data</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="dark:text-white">System Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium dark:text-slate-200">Blockchain Node</span>
                            <Badge variant="success">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium dark:text-slate-200">IPFS Gateway</span>
                            <Badge variant="success">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium dark:text-slate-200">AI Analysis Engine</span>
                            <Badge variant="warning">High Load</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
