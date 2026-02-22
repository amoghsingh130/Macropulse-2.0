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
import WhyThisRegime from '@/components/macropulse/WhyThisRegime';
import RegimeDistribution from '@/components/macropulse/RegimeDistribution';
import MethodologySection from '@/components/macropulse/MethodologySection';
import { generateCurrentSnapshot, getCachedTimeline } from '@/components/macropulse/mockData';
import { computeRegime, fetchState, normaliseResponse } from '@/components/macropulse/api';

// Backend URL indicator (shown in UI)
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [snapshot, setSnapshot] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [backendOnline, setBackendOnline] = useState(false);
  const [dataSource, setDataSource] = useState('local'); // 'local' | 'backend'
  const [dateRange, setDateRange] = useState({
    from: new Date('2020-01-01'),
    to: new Date()
  });

  useEffect(() => {
    loadData();
  }, []);

  // Try to load from backend state first; fall back to local mock
  const loadData = async () => {
    setIsLoading(true);

    try {
      setBackendOnline(true);

      const result = await computeRegime({
        startDate: format(dateRange.from, "yyyy-MM-dd"),
        endDate: format(dateRange.to, "yyyy-MM-dd"),
        mode: isDemoMode ? "demo" : "auto",
      });

      const norm = normaliseResponse(result);
      setSnapshot(norm);
      setTimelineData(norm.timelineData);
      setDataSource("backend");
      setIsLoading(false);
      return;
    } catch (err) {
      console.warn("Backend compute failed, using local mock:", err?.message);
      setBackendOnline(false);
    }

    await new Promise((r) => setTimeout(r, 800));
    const currentSnapshot = generateCurrentSnapshot();
    const timeline = getCachedTimeline();
    setSnapshot(currentSnapshot);
    setTimelineData(timeline);
    setDataSource("local");
    setIsLoading(false);
  };
    
  const handleCompute = async () => {
    setIsLoading(true);
    if (backendOnline) {
      try {
        const result = await computeRegime({
          startDate: format(dateRange.from, 'yyyy-MM-dd'),
          endDate: format(dateRange.to, 'yyyy-MM-dd'),
          mode: isDemoMode ? 'demo' : 'auto',
        });
        const norm = normaliseResponse(result);
        setSnapshot(norm);
        setTimelineData(norm.timelineData);
        setDataSource('backend');
        setIsLoading(false);
        return;
      } catch (err) {
        console.warn('Backend compute failed, using local mock:', err.message);
      }
    }
    // Local fallback
    await new Promise(r => setTimeout(r, 1200));
    const newSnapshot = generateCurrentSnapshot();
    setSnapshot(newSnapshot);
    setDataSource('local');
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
        {/* Status Banner — only shown when backend is connected */}
        {dataSource === 'backend' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
              isDemoMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'
            }`}
          >
            <Database className={`w-5 h-5 ${isDemoMode ? 'text-amber-400' : 'text-emerald-400'}`} />
            <div>
              <p className={`font-medium ${isDemoMode ? 'text-amber-400' : 'text-emerald-400'}`}>
                Backend Connected — {isDemoMode ? 'Demo Mode' : 'Live Mode'}
              </p>
              <p className="text-sm text-slate-400">{BACKEND_URL} · {isDemoMode ? 'Cached dataset (2018-present)' : 'Live market data via Stooq'}</p>
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

        {/* Why This Regime — institutional explanation under the badge */}
        <div className="mb-6">
          <WhyThisRegime regime={snapshot?.regime} isLoading={isLoading} />
        </div>

        {/* Middle Section - Asset Allocation + Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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
          <RegimeDistribution data={timelineData} isLoading={isLoading} />
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

        {/* Methodology collapsible */}
        <MethodologySection />

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-center"
        >
          <p className="text-slate-600 text-sm">
            Last updated: {snapshot?.date ? format(new Date(snapshot.date), 'MMMM d, yyyy') : '-'} · 
            Classification based on 21-day rolling features from SPY, QQQ, TLT, IEF, HYG, LQD, UUP, DBC, TIP
          </p>
        </motion.div>
      </main>
    </div>
  );
}