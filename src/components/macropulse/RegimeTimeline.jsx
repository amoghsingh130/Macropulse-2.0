import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceArea, ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import { Slider } from '@/components/ui/slider';
import { Calendar, TrendingUp } from 'lucide-react';
import { REGIME_COLORS, REGIME_LABELS } from './regimeColors';

/* ─── Tooltip ─────────────────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  if (d._isTransition) return (
    <div className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-slate-400 mb-1">{format(new Date(d.date), 'MMM d, yyyy')}</p>
      <p className="text-white font-medium">
        <span style={{ color: REGIME_COLORS[d.fromRegime] }}>{REGIME_LABELS[d.fromRegime]}</span>
        {' → '}
        <span style={{ color: REGIME_COLORS[d.toRegime] }}>{REGIME_LABELS[d.toRegime]}</span>
      </p>
    </div>
  );
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 shadow-xl">
      <p className="text-slate-400 text-sm mb-2">{format(new Date(d.date), 'MMM d, yyyy')}</p>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400 text-sm">SPY</span>
          <span className="text-white font-medium">${d.spy_price?.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400 text-sm">Regime</span>
          <span className="font-medium text-sm px-2 py-0.5 rounded"
            style={{ color: REGIME_COLORS[d.regime], backgroundColor: `${REGIME_COLORS[d.regime]}20` }}>
            {REGIME_LABELS[d.regime]}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400 text-sm">Confidence</span>
          <span className="text-white font-medium">{d.confidence}%</span>
        </div>
      </div>
    </div>
  );
};

/* ─── Transition marker label ─────────────────────────────────────────────── */
const TransitionLabel = ({ viewBox, toRegime }) => {
  if (!viewBox) return null;
  const { x, y } = viewBox;
  return (
    <g>
      <circle cx={x} cy={y + 12} r={5}
        fill={REGIME_COLORS[toRegime]} opacity={0.9} />
    </g>
  );
};

/* ─── Main component ──────────────────────────────────────────────────────── */
export default function RegimeTimeline({ data, isLoading }) {
  const [dateRange, setDateRange] = useState([0, 100]);

  const startIndex = Math.floor((dateRange[0] / 100) * (data?.length || 0));
  const endIndex   = Math.ceil ((dateRange[1] / 100) * (data?.length || 0));
  const filteredData = (data || []).slice(startIndex, endIndex);

  const spyPrices = filteredData.map(d => d.spy_price).filter(Boolean);
  const minSpy = spyPrices.length ? Math.min(...spyPrices) * 0.98 : 0;
  const maxSpy = spyPrices.length ? Math.max(...spyPrices) * 1.02 : 600;

  // Detect regime transitions — must be before any early return
  const transitions = useMemo(() => {
    const result = [];
    for (let i = 1; i < filteredData.length; i++) {
      if (filteredData[i].regime !== filteredData[i - 1].regime) {
        result.push({
          date:       filteredData[i].date,
          fromRegime: filteredData[i - 1].regime,
          toRegime:   filteredData[i].regime,
        });
      }
    }
    return result;
  }, [filteredData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Regime Timeline</h3>
            <p className="text-xs text-slate-500">Historical regime classification with SPY overlay</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          {Object.entries(REGIME_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: REGIME_COLORS[key] }} />
              <span className="text-xs text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="spyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="date"
              tickFormatter={(d) => format(new Date(d), 'MMM yy')}
              stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#334155' }} />
            <YAxis yAxisId="spy" domain={[minSpy, maxSpy]}
              stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(v) => `$${v.toFixed(0)}`} />
            <YAxis yAxisId="confidence" orientation="right" domain={[0, 100]}
              hide />

            <Tooltip content={<CustomTooltip />} />

            {/* Regime background shading */}
            {filteredData.map((entry, i) => {
              if (i === 0) return null;
              return (
                <ReferenceArea key={i} yAxisId="spy"
                  x1={filteredData[i - 1].date} x2={entry.date}
                  fill={REGIME_COLORS[entry.regime]} fillOpacity={0.10} />
              );
            })}

            {/* Transition vertical lines */}
            {transitions.map((t, i) => (
              <ReferenceLine key={`t-${i}`} yAxisId="spy"
                x={t.date}
                stroke={REGIME_COLORS[t.toRegime]}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                opacity={0.7}
                label={<TransitionLabel toRegime={t.toRegime} />}
              />
            ))}

            <Area yAxisId="spy" type="monotone" dataKey="spy_price"
              stroke="#8b5cf6" strokeWidth={2} fill="url(#spyGradient)" />

            <Line yAxisId="confidence" type="monotone" dataKey="confidence"
              stroke="#facc15" strokeWidth={1} strokeDasharray="5 5"
              dot={false} opacity={0.45} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Date Range Slider */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="flex items-center gap-4">
          <Calendar className="w-4 h-4 text-slate-500" />
          <div className="flex-1">
            <Slider value={dateRange} onValueChange={setDateRange}
              min={0} max={100} step={1} className="w-full" />
          </div>
          <div className="text-xs text-slate-500 w-44 text-right">
            {filteredData.length > 0 && (
              <>
                {format(new Date(filteredData[0].date), 'MMM d, yyyy')}
                {' – '}
                {format(new Date(filteredData[filteredData.length - 1].date), 'MMM d, yyyy')}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}