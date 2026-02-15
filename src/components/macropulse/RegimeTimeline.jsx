import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';
import { format } from 'date-fns';
import { Slider } from '@/components/ui/slider';
import { Calendar, TrendingUp } from 'lucide-react';

const regimeColors = {
  risk_on: '#22c55e',
  risk_off: '#ef4444',
  inflation_shock: '#f97316',
  dollar_stress: '#3b82f6'
};

const regimeLabels = {
  risk_on: 'Risk-On',
  risk_off: 'Risk-Off',
  inflation_shock: 'Inflation Shock',
  dollar_stress: 'Dollar Stress'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 shadow-xl">
        <p className="text-slate-400 text-sm mb-2">
          {format(new Date(data.date), 'MMM d, yyyy')}
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400 text-sm">SPY</span>
            <span className="text-white font-medium">${data.spy_price?.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400 text-sm">Regime</span>
            <span 
              className="font-medium text-sm px-2 py-0.5 rounded"
              style={{ 
                color: regimeColors[data.regime],
                backgroundColor: `${regimeColors[data.regime]}20`
              }}
            >
              {regimeLabels[data.regime]}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400 text-sm">Confidence</span>
            <span className="text-white font-medium">{data.confidence}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function RegimeTimeline({ data, isLoading }) {
  const [dateRange, setDateRange] = useState([0, 100]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-96 bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  const startIndex = Math.floor((dateRange[0] / 100) * data.length);
  const endIndex = Math.ceil((dateRange[1] / 100) * data.length);
  const filteredData = data.slice(startIndex, endIndex);

  // Find min/max for SPY to scale properly
  const spyPrices = filteredData.map(d => d.spy_price);
  const minSpy = Math.min(...spyPrices) * 0.98;
  const maxSpy = Math.max(...spyPrices) * 1.02;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
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
        <div className="flex items-center gap-4">
          {Object.entries(regimeLabels).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: regimeColors[key] }}
              />
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
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(new Date(date), 'MMM yy')}
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis 
              yAxisId="spy"
              domain={[minSpy, maxSpy]}
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <YAxis 
              yAxisId="confidence"
              orientation="right"
              domain={[0, 100]}
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(value) => `${value}%`}
              hide
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Regime background bands */}
            {filteredData.map((entry, index) => {
              if (index === 0) return null;
              const prevEntry = filteredData[index - 1];
              return (
                <ReferenceArea
                  key={index}
                  yAxisId="spy"
                  x1={prevEntry.date}
                  x2={entry.date}
                  fill={regimeColors[entry.regime]}
                  fillOpacity={0.1}
                />
              );
            })}
            
            <Area
              yAxisId="spy"
              type="monotone"
              dataKey="spy_price"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#spyGradient)"
            />
            
            <Line
              yAxisId="confidence"
              type="monotone"
              dataKey="confidence"
              stroke="#facc15"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              opacity={0.5}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Date Range Slider */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="flex items-center gap-4">
          <Calendar className="w-4 h-4 text-slate-500" />
          <div className="flex-1">
            <Slider
              value={dateRange}
              onValueChange={setDateRange}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          <div className="text-xs text-slate-500 w-40 text-right">
            {filteredData.length > 0 && (
              <>
                {format(new Date(filteredData[0]?.date), 'MMM d, yyyy')} - {format(new Date(filteredData[filteredData.length - 1]?.date), 'MMM d, yyyy')}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}