import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { 
  RefreshCw, 
  Calendar as CalendarIcon, 
  Zap, 
  Activity,
  Globe,
  Database
} from 'lucide-react';

import RegimeBadge from '@/components/macropulse/RegimeBadge';
import ConfidenceMeter from '@/components/macropulse/ConfidenceMeter';
import AssetAllocationCard from '@/components/macropulse/AssetAllocationCard';
import ExplanationCard from '@/components/macropulse/ExplanationCard';
import TriggersCard from '@/components/macropulse/TriggersCard';
import RegimeTimeline from '@/components/macropulse/RegimeTimeline';
import FeatureMetrics from '@/components/macropulse/FeatureMetrics';
import { generateCurrentSnapshot, getCachedTimeline } from '@/components/macropulse/mockData';
import { computeRegime, fetchState, normaliseResponse } from '@/components/macropulse/api';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [snapshot, setSnapshot] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [dateRange, setDateRange] = useState({
    from: new Date('2020-01-01'),
    to: new Date()
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const currentSnapshot = generateCurrentSnapshot();
    const timeline = getCachedTimeline();
    
    setSnapshot(currentSnapshot);
    setTimelineData(timeline);
    setIsLoading(false);
  };

  const handleCompute = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newSnapshot = generateCurrentSnapshot();
    setSnapshot(newSnapshot);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600"
              >
                <Activity className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-white">MacroPulse</h1>
                <p className="text-xs text-slate-500">Market Intelligence</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Demo Mode Toggle */}
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${isDemoMode ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}>
                  {isDemoMode ? (
                    <Database className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Globe className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <Label htmlFor="demo-mode" className="text-sm text-slate-400">
                  {isDemoMode ? 'Demo' : 'Live'}
                </Label>
                <Switch
                  id="demo-mode"
                  checked={!isDemoMode}
                  onCheckedChange={(checked) => setIsDemoMode(!checked)}
                />
              </div>

              {/* Compute Button */}
              <Button
                onClick={handleCompute}
                disabled={isLoading}
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                Compute Regime
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
          >
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-amber-400 font-medium">Demo Mode Active</p>
                <p className="text-sm text-slate-400">Using cached historical data (2020-present). Toggle to Live for real-time data.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Top Section - Regime Badge & Confidence */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <RegimeBadge regime={snapshot?.regime} isLoading={isLoading} />
          </div>
          <div>
            <ConfidenceMeter confidence={snapshot?.confidence || 0} isLoading={isLoading} />
          </div>
        </div>

        {/* Middle Section - Asset Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AssetAllocationCard 
            type="overweight" 
            assets={snapshot?.overweight_assets || []} 
            isLoading={isLoading} 
          />
          <AssetAllocationCard 
            type="underweight" 
            assets={snapshot?.underweight_assets || []} 
            isLoading={isLoading} 
          />
        </div>

        {/* Explanation & Triggers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ExplanationCard 
            explanation={snapshot?.explanation || ''} 
            isLoading={isLoading} 
          />
          <TriggersCard 
            triggers={snapshot?.triggers || []} 
            isLoading={isLoading} 
          />
        </div>

        {/* Key Metrics */}
        <div className="mb-6">
          <FeatureMetrics 
            features={snapshot?.features} 
            isLoading={isLoading} 
          />
        </div>

        {/* Timeline Chart */}
        <RegimeTimeline 
          data={timelineData} 
          isLoading={isLoading} 
        />

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <p className="text-slate-600 text-sm">
            Last updated: {snapshot?.date ? format(new Date(snapshot.date), 'MMMM d, yyyy') : '-'} • 
            Classification based on 20-day rolling features from SPY, QQQ, TLT, IEF, HYG, LQD, UUP, DBC, TIP
          </p>
        </motion.div>
      </main>
    </div>
  );
}