import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import {
  RefreshCw, Zap, Activity, Globe, Database,
  BarChart2, Microscope, Flame, TrendingUp,
} from 'lucide-react';

import RegimeBadge          from '@/components/macropulse/RegimeBadge';
import ConfidenceMeter       from '@/components/macropulse/ConfidenceMeter';
import AssetAllocationCard   from '@/components/macropulse/AssetAllocationCard';
import ExplanationCard       from '@/components/macropulse/ExplanationCard';
import TriggersCard          from '@/components/macropulse/TriggersCard';
import RegimeTimeline        from '@/components/macropulse/RegimeTimeline';
import FeatureMetrics        from '@/components/macropulse/FeatureMetrics';
import WhyThisRegime         from '@/components/macropulse/WhyThisRegime';
import RegimeDistribution    from '@/components/macropulse/RegimeDistribution';
import MethodologySection    from '@/components/macropulse/MethodologySection';
import BacktestPanel         from '@/components/macropulse/BacktestPanel';
import ExplainabilityPanel   from '@/components/macropulse/ExplainabilityPanel';
import RegimeAlertSystem     from '@/components/macropulse/RegimeAlertSystem';
import ConfidenceDecomposition from '@/components/macropulse/ConfidenceDecomposition';
import InvestorModeSelector  from '@/components/macropulse/InvestorModeSelector';
import ShockSimulator        from '@/components/macropulse/ShockSimulator';
import AllocationWeights     from '@/components/macropulse/AllocationWeights';

import { generateCurrentSnapshot, getCachedTimeline } from '@/components/macropulse/mockData';
import { computeRegime, normaliseResponse }            from '@/components/macropulse/api';
import { classifyRegime }                              from '@/components/macropulse/regimeEngine';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const TABS = [
  { key: 'overview',     label: 'Overview',     icon: Activity  },
  { key: 'backtest',     label: 'Backtest',      icon: BarChart2 },
  { key: 'explainability', label: 'Signals',     icon: Microscope },
  { key: 'shock',        label: 'Shock Sim',     icon: Flame     },
];

export default function Dashboard() {
  const [isLoading,      setIsLoading]      = useState(true);
  const [snapshot,       setSnapshot]       = useState(null);
  const [timelineData,   setTimelineData]   = useState([]);
  const [backendOnline,  setBackendOnline]  = useState(false);
  const [dataSource,     setDataSource]     = useState('local');
  const [isDemoMode,     setIsDemoMode]     = useState(true);
  const [activeTab,      setActiveTab]      = useState('overview');
  const [riskTolerance,  setRiskTolerance]  = useState('balanced');
  const [regimeHistory,  setRegimeHistory]  = useState([]);
  const [decomposition,  setDecomposition]  = useState(null);

  // Keyboard shortcut "R" to refresh
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'r' || e.key === 'R') {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          handleCompute();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [backendOnline, isDemoMode]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await computeRegime({
        startDate: '2020-01-01',
        endDate: format(new Date(), 'yyyy-MM-dd'),
        mode: isDemoMode ? 'demo' : 'auto',
      });
      const norm = normaliseResponse(result);
      setSnapshot(norm);
      setTimelineData(norm.timelineData);
      setDataSource('backend');
      setBackendOnline(true);
      enrichWithEngine(norm);
    } catch {
      setBackendOnline(false);
      const snap = generateCurrentSnapshot();
      const tl   = getCachedTimeline();
      setSnapshot(snap);
      setTimelineData(tl);
      setDataSource('local');
      enrichWithEngine(snap);
    }
    setIsLoading(false);
  };

  const enrichWithEngine = (snap) => {
    if (!snap?.features) return;
    const result = classifyRegime(snap.features);
    setDecomposition(result.decomposition);
  };

  useEffect(() => { loadData(); }, []);

  const handleCompute = async () => {
    setIsLoading(true);
    if (backendOnline) {
      try {
        const result = await computeRegime({
          startDate: '2020-01-01',
          endDate: format(new Date(), 'yyyy-MM-dd'),
          mode: isDemoMode ? 'demo' : 'auto',
        });
        const norm = normaliseResponse(result);
        setSnapshot(norm);
        setTimelineData(norm.timelineData);
        setDataSource('backend');
        enrichWithEngine(norm);
        setIsLoading(false);
        return;
      } catch {}
    }
    const snap = generateCurrentSnapshot();
    setSnapshot(snap);
    enrichWithEngine(snap);
    setDataSource('local');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Regime Alert System (floating) */}
      <RegimeAlertSystem
        currentRegime={snapshot?.regime}
        regimeHistory={regimeHistory}
        setRegimeHistory={setRegimeHistory}
      />

      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0f172a]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600"
              >
                <Activity className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-white">MacroPulse</h1>
                <p className="text-xs text-slate-500">Institutional Regime Engine · Press R to refresh</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Investor Mode */}
              <div className="hidden md:block">
                <InvestorModeSelector value={riskTolerance} onChange={setRiskTolerance} />
              </div>

              {/* Demo/Live toggle */}
              <button
                onClick={() => setIsDemoMode(m => !m)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all ${
                  isDemoMode
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                    : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                }`}
              >
                {isDemoMode ? <Database className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                {isDemoMode ? 'Demo' : 'Live'}
              </button>

              <Button
                onClick={handleCompute}
                disabled={isLoading}
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white gap-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Compute
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 pb-0 -mb-px">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                    isActive
                      ? 'border-violet-500 text-violet-400'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Backend banner — only when online */}
        {dataSource === 'backend' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-xl border flex items-center gap-3 ${
              isDemoMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'
            }`}
          >
            <Database className={`w-4 h-4 ${isDemoMode ? 'text-amber-400' : 'text-emerald-400'}`} />
            <p className={`text-sm font-medium ${isDemoMode ? 'text-amber-400' : 'text-emerald-400'}`}>
              Backend Connected — {isDemoMode ? 'Demo Mode' : 'Live Mode'} · {BACKEND_URL}
            </p>
          </motion.div>
        )}

        {/* Mobile investor mode */}
        <div className="md:hidden">
          <InvestorModeSelector value={riskTolerance} onChange={setRiskTolerance} />
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RegimeBadge regime={snapshot?.regime} isLoading={isLoading} />
              </div>
              <ConfidenceMeter confidence={snapshot?.confidence || 0} isLoading={isLoading} />
            </div>

            <WhyThisRegime regime={snapshot?.regime} isLoading={isLoading} />

            <ConfidenceDecomposition decomposition={decomposition} isLoading={isLoading} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AssetAllocationCard type="overweight"  assets={snapshot?.overweight_assets || []} isLoading={isLoading} />
              <AssetAllocationCard type="underweight" assets={snapshot?.underweight_assets || []} isLoading={isLoading} />
              <RegimeDistribution data={timelineData} isLoading={isLoading} />
            </div>

            <AllocationWeights regime={snapshot?.regime} riskTolerance={riskTolerance} isLoading={isLoading} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExplanationCard explanation={snapshot?.explanation || ''} isLoading={isLoading} />
              <TriggersCard triggers={snapshot?.triggers || []} isLoading={isLoading} />
            </div>

            <FeatureMetrics features={snapshot?.features} isLoading={isLoading} />
            <RegimeTimeline data={timelineData} isLoading={isLoading} />

            {regimeHistory.length > 0 && (
              <RegimeAlertSystem
                currentRegime={snapshot?.regime}
                regimeHistory={regimeHistory}
                setRegimeHistory={setRegimeHistory}
                showTableOnly
              />
            )}

            <MethodologySection />
          </>
        )}

        {/* ── BACKTEST TAB ── */}
        {activeTab === 'backtest' && (
          <BacktestPanel timelineData={timelineData} isLoading={isLoading} />
        )}

        {/* ── SIGNALS TAB ── */}
        {activeTab === 'explainability' && (
          <>
            <ExplainabilityPanel features={snapshot?.features} isLoading={isLoading} />
            <FeatureMetrics features={snapshot?.features} isLoading={isLoading} />
          </>
        )}

        {/* ── SHOCK SIM TAB ── */}
        {activeTab === 'shock' && (
          <ShockSimulator features={snapshot?.features} currentRegime={snapshot?.regime} />
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="text-center">
          <p className="text-slate-700 text-xs">
            Last updated: {snapshot?.date ? format(new Date(snapshot.date), 'MMMM d, yyyy') : '—'} ·
            Rule-based regime engine · deterministic · no black-box ML
          </p>
        </motion.div>
      </main>
    </div>
  );
}