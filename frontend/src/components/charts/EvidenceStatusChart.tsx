import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

interface StatusData {
    name: string;
    value: number;
    color: string;
    [key: string]: string | number; // Index signature for recharts compatibility
}

interface EvidenceStatusChartProps {
    data?: StatusData[];
}

export function EvidenceStatusChart({ data = [] }: EvidenceStatusChartProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} px-3 py-2 rounded-lg shadow-lg border`}>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {payload[0].name}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Count: {payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderLabel = ({ name, percent }: any) => {
        return `${name} ${(percent * 100).toFixed(0)}%`;
    };

    return (
        <ResponsiveContainer width="100%" height={280}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    iconType="circle"
                    wrapperStyle={{
                        color: isDark ? '#e2e8f0' : '#64748b',
                        fontSize: '12px'
                    }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
