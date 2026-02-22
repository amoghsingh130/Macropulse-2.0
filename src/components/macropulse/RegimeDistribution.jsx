import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { REGIME_COLORS, REGIME_LABELS } from './regimeColors';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p style={{ color: REGIME_COLORS[name] }} className="font-medium">{REGIME_LABELS[name]}</p>
      <p className="text-slate-300">{value.toFixed(1)}% of period</p>
    </div>
  );
};

export default function RegimeDistribution({ data, isLoading }) {
  const distribution = useMemo(() => {
    if (!data?.length) return [];
    const counts = {};
    data.forEach(d => { counts[d.regime] = (counts[d.regime] || 0) + 1; });
    return Object.entries(counts)
      .map(([regime, count]) => ({
        name: regime,
        value: parseFloat(((count / data.length) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-56 bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 shadow-xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-violet-500/20">
          <PieIcon className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Regime Distribution</h3>
          <p className="text-xs text-slate-500">% of selected window</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Donut chart */}
        <div className="w-36 h-36 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distribution}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={58}
                dataKey="value"
                paddingAngle={2}
                startAngle={90}
                endAngle={450}
              >
                {distribution.map((entry) => (
                  <Cell key={entry.name} fill={REGIME_COLORS[entry.name]} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend with bars */}
        <div className="flex-1 space-y-2.5">
          {distribution.map((entry) => (
            <div key={entry.name}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span style={{ color: REGIME_COLORS[entry.name] }} className="font-medium">
                  {REGIME_LABELS[entry.name]}
                </span>
                <span className="text-slate-300">{entry.value}%</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${entry.value}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: REGIME_COLORS[entry.name] }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}