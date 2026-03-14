import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  RefreshCw, Zap, Activity,
  BarChart2, Microscope, Flame,
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

import { getCachedSnapshot, getCachedTimeline, getSnapshotForDate } from '@/components/macropulse/mockData';
import { classifyRegime }                       from '@/components/macropulse/regimeEngine';

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
  const [activeTab,      setActiveTab]      = useState('overview');
  const [riskTolerance,  setRiskTolerance]  = useState('balanced');
  const [regimeHistory,  setRegimeHistory]  = useState([]);
  const [decomposition,  setDecomposition]  = useState(null);
  const [selectedDate,   setSelectedDate]   = useState('');   // '' = today/live

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
  }, []);

  const enrichWithEngine = (snap) => {
    if (!snap?.features) return;
    const result = classifyRegime(snap.features);
    setDecomposition(result.decomposition);
  };

  const loadData = () => {
    setIsLoading(true);
    const snap = getCachedSnapshot();
    const tl   = getCachedTimeline();
    setSnapshot(snap);
    setTimelineData(tl);
    enrichWithEngine(snap);
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleCompute = () => {
    setIsLoading(true);
    const snap = selectedDate ? getSnapshotForDate(selectedDate) : getCachedSnapshot();
    setSnapshot(snap);
    enrichWithEngine(snap);
    setTimeout(() => setIsLoading(false), 600);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setIsLoading(true);
    const snap = date ? getSnapshotForDate(date) : getCachedSnapshot();
    setSnapshot(snap);
    enrichWithEngine(snap);
    setTimeout(() => setIsLoading(false), 400);
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

            <div className="flex items-center gap-3">
              {/* Date picker */}
              <div className="hidden sm:flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  min="2020-01-01"
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={handleDateChange}
                  className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                />
                {selectedDate && (
                  <button
                    onClick={() => handleDateChange({ target: { value: '' } })}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Today
                  </button>
                )}
              </div>

              {/* Investor Mode */}
              <div className="hidden md:block">
                <InvestorModeSelector value={riskTolerance} onChange={setRiskTolerance} />
              </div>

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