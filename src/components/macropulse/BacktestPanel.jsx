import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import { TrendingUp, ArrowUpRight, ArrowDownRight, BarChart2 } from 'lucide-react';
import { runBacktest } from './allocationEngine';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-2xl text-sm">
      <p className="text-slate-400 mb-2 text-xs">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-6">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className={parseFloat(p.value) >= 0 ? 'text-emerald-400 font-mono' : 'text-red-400 font-mono'}>
            {parseFloat(p.value) >= 0 ? '+' : ''}{p.value}%
          </span>
        </div>
      ))}
    </div>
  );
};

function MetricCard({ label, value, sub, positive }) {
  const isPos = positive === true || (positive === undefined && parseFloat(value) >= 0);
  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold font-mono ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function BacktestPanel({ timelineData, isLoading }) {
  const result = useMemo(() => runBacktest(timelineData), [timelineData]);

  const chartData = useMemo(() => {
    if (!result) return [];
    return result.dates.map((d, i) => ({
      date: format(new Date(d), 'MMM yy'),
      'MacroPulse Strategy': result.strategyReturns[i],
      'SPY Buy & Hold':      result.spyReturns[i],
    }));
  }, [result]);

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-slate-800 rounded-2xl" />;
  }
  if (!result) return null;

  const { metrics } = result;
  const alpha = (parseFloat(metrics.strategyTotalReturn) - parseFloat(metrics.spyTotalReturn)).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 shadow-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-emerald-500/20">
          <BarChart2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Backtest Strategy — Since 2020</h3>
          <p className="text-xs text-slate-500">Rule-based regime-switching vs SPY Buy & Hold · Daily rebalance</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <MetricCard
          label="Strategy Total Return"
          value={`${parseFloat(metrics.strategyTotalReturn) >= 0 ? '+' : ''}${metrics.strategyTotalReturn}%`}
          positive={parseFloat(metrics.strategyTotalReturn) >= 0}
        />
        <MetricCard
          label="SPY Total Return"
          value={`${parseFloat(metrics.spyTotalReturn) >= 0 ? '+' : ''}${metrics.spyTotalReturn}%`}
          positive={parseFloat(metrics.spyTotalReturn) >= 0}
        />
        <MetricCard
          label="Alpha Generated"
          value={`${parseFloat(alpha) >= 0 ? '+' : ''}${alpha}%`}
          positive={parseFloat(alpha) >= 0}
          sub="vs SPY baseline"
        />
        <MetricCard
          label="Strategy Sharpe"
          value={metrics.strategySharpe}
          positive={parseFloat(metrics.strategySharpe) >= 1}
          sub="Risk-free: 4%"
        />
        <MetricCard
          label="SPY Sharpe"
          value={metrics.spySharpe}
          positive={parseFloat(metrics.spySharpe) >= 1}
        />
        <MetricCard
          label="Max Drawdown (Strategy)"
          value={`-${metrics.strategyMaxDrawdown}%`}
          positive={false}
          sub={`SPY: -${metrics.spyMaxDrawdown}%`}
        />
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="stratGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="spyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="date" stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
            <YAxis
              stroke="#475569"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickFormatter={v => `${v > 0 ? '+' : ''}${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '12px' }}
            />
            <ReferenceLine y={0} stroke="#334155" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="MacroPulse Strategy"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#stratGrad)"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="SPY Buy & Hold"
              stroke="#8b5cf6"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-xs text-slate-600 text-center">
        Regime → Asset mapping: Risk-On=SPY · Risk-Off=TLT · Inflation=DBC+TIP · Dollar Stress=UUP+IEF · Simplified daily beta proxy.
      </p>
    </motion.div>
  );
}