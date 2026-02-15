import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const assetInfo = {
  SPY: { name: 'US Equities', color: 'bg-blue-500' },
  QQQ: { name: 'Growth Equities', color: 'bg-purple-500' },
  TLT: { name: 'Long Bonds', color: 'bg-emerald-500' },
  IEF: { name: 'Intermediate Bonds', color: 'bg-cyan-500' },
  HYG: { name: 'High Yield Credit', color: 'bg-orange-500' },
  LQD: { name: 'Investment Grade', color: 'bg-indigo-500' },
  UUP: { name: 'US Dollar', color: 'bg-green-500' },
  DBC: { name: 'Commodities', color: 'bg-amber-500' },
  TIP: { name: 'TIPS', color: 'bg-rose-500' },
  GLD: { name: 'Gold', color: 'bg-yellow-500' },
  CASH: { name: 'Cash', color: 'bg-slate-500' }
};

export default function AssetAllocationCard({ type, assets, isLoading }) {
  const isOverweight = type === 'overweight';
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: isOverweight ? 0.2 : 0.3 }}
      className={`rounded-2xl border p-6 shadow-xl ${
        isOverweight 
          ? 'border-emerald-500/30 bg-emerald-500/5' 
          : 'border-red-500/30 bg-red-500/5'
      }`}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className={`p-2 rounded-lg ${isOverweight ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
          {isOverweight ? (
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-400" />
          )}
        </div>
        <div>
          <h3 className={`font-semibold ${isOverweight ? 'text-emerald-400' : 'text-red-400'}`}>
            {isOverweight ? 'Overweight' : 'Underweight'}
          </h3>
          <p className="text-xs text-slate-500">Recommended allocation</p>
        </div>
      </div>

      <div className="space-y-3">
        {assets.map((asset, index) => {
          const info = assetInfo[asset] || { name: asset, color: 'bg-slate-500' };
          return (
            <motion.div
              key={asset}
              initial={{ opacity: 0, x: isOverweight ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-8 rounded-full ${info.color}`} />
                <div>
                  <p className="font-medium text-white">{asset}</p>
                  <p className="text-xs text-slate-500">{info.name}</p>
                </div>
              </div>
              {isOverweight ? (
                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-red-400" />
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}