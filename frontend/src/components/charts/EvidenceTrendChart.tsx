import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

interface TrendData {
    date: string;
    uploads: number;
}

interface EvidenceTrendChartProps {
    data?: TrendData[];
}

export function EvidenceTrendChart({ data = [] }: EvidenceTrendChartProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={`${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} px-4 py-2 rounded-lg shadow-lg border`}>
                    <p className="text-sm font-semibold mb-1">{label}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Uploads: <span className="font-bold text-blue-500">{payload[0].value}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#334155' : '#e2e8f0'}
                    opacity={0.5}
                />
                <XAxis
                    dataKey="date"
                    stroke={isDark ? '#94a3b8' : '#64748b'}
                    style={{ fontSize: '12px' }}
                    tick={{ fill: isDark ? '#94a3b8' : '#64748b' }}
                />
                <YAxis
                    stroke={isDark ? '#94a3b8' : '#64748b'}
                    style={{ fontSize: '12px' }}
                    tick={{ fill: isDark ? '#94a3b8' : '#64748b' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                    type="monotone"
                    dataKey="uploads"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorUploads)"
                    animationDuration={1000}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
