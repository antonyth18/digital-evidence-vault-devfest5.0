import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { useState } from 'react';

interface CollectorData {
    name: string;
    count: number;
}

interface CollectorActivityChartProps {
    data?: CollectorData[];
}

export function CollectorActivityChart({ data = [] }: CollectorActivityChartProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} px-4 py-2 rounded-lg shadow-lg border`}>
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {payload[0].payload.name}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
                        Evidence Collected: <span className="font-bold text-emerald-500">{payload[0].value}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart
                data={data}
                onMouseMove={(state: any) => {
                    if (state.isTooltipActive) {
                        setActiveIndex(state.activeTooltipIndex);
                    } else {
                        setActiveIndex(null);
                    }
                }}
                onMouseLeave={() => setActiveIndex(null)}
            >
                <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.6} />
                    </linearGradient>
                </defs>
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#334155' : '#e2e8f0'}
                    opacity={0.5}
                />
                <XAxis
                    dataKey="name"
                    stroke={isDark ? '#94a3b8' : '#64748b'}
                    style={{ fontSize: '11px' }}
                    tick={{ fill: isDark ? '#94a3b8' : '#64748b' }}
                />
                <YAxis
                    stroke={isDark ? '#94a3b8' : '#64748b'}
                    style={{ fontSize: '12px' }}
                    tick={{ fill: isDark ? '#94a3b8' : '#64748b' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                >
                    {data.map((_entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={activeIndex === index ? '#059669' : 'url(#colorBar)'}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
