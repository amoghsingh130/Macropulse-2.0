// Mock data generator for MacroPulse demo mode
import { addDays, format, subDays } from 'date-fns';

const regimes = ['risk_on', 'risk_off', 'inflation_shock', 'dollar_stress'];

const regimeAllocation = {
  risk_on: {
    overweight: ['SPY', 'QQQ', 'HYG'],
    underweight: ['TLT', 'UUP', 'CASH'],
    explanation: 'Markets are in a risk-on environment characterized by strong equity momentum and improving credit conditions. Equity markets are showing broad-based strength with growth stocks outperforming. Credit spreads are tightening, indicating confidence in corporate balance sheets. The dollar is weakening, providing tailwinds for risk assets.',
    triggers: [
      'SPY dropping below its 50-day moving average',
      'Credit spreads (HYG/LQD) widening by more than 5%',
      'VIX spiking above 25',
      'Significant deterioration in economic data'
    ]
  },
  risk_off: {
    overweight: ['TLT', 'IEF', 'CASH'],
    underweight: ['SPY', 'QQQ', 'HYG'],
    explanation: 'Markets have shifted to a risk-off regime with investors seeking safety in government bonds. Equity volatility is elevated and credit spreads are widening. Flight to quality is dominant with long-duration treasuries outperforming. Defensive positioning is recommended until market stress subsides.',
    triggers: [
      'VIX falling below 18 for sustained period',
      'Credit spreads narrowing to pre-stress levels',
      'Positive earnings revisions',
      'Central bank providing clear policy support'
    ]
  },
  inflation_shock: {
    overweight: ['DBC', 'TIP', 'GLD'],
    underweight: ['TLT', 'QQQ', 'LQD'],
    explanation: 'Inflation expectations are rising faster than nominal yields, creating an inflation shock environment. Real yields are declining as TIPS outperform nominal treasuries. Commodities are rallying broadly. Long-duration bonds face significant headwinds as the market reprices inflation risk.',
    triggers: [
      'Core PCE declining for consecutive months',
      'TIP/IEF ratio falling below 1.0',
      'Commodity prices breaking down',
      'Fed signaling inflation is under control'
    ]
  },
  dollar_stress: {
    overweight: ['GLD', 'DBC', 'SPY'],
    underweight: ['UUP', 'TLT', 'CASH'],
    explanation: 'The US dollar is under significant pressure, creating opportunities in dollar-sensitive assets. Gold and commodities benefit from dollar weakness. International assets and US equities with foreign revenue exposure are favored. Cash and dollar-denominated bonds face purchasing power erosion.',
    triggers: [
      'DXY rebounding above its 200-day moving average',
      'Fed turning more hawkish on rates',
      'Global risk-off event strengthening safe-haven flows',
      'Relative US growth outperformance'
    ]
  }
};

// Generate smooth SPY price movements with regime-appropriate behavior
function generateSpyPrice(basePrice, regime, volatility) {
  const regimeReturn = {
    risk_on: 0.001,
    risk_off: -0.0008,
    inflation_shock: 0.0003,
    dollar_stress: 0.0005
  };
  
  const drift = regimeReturn[regime];
  const randomShock = (Math.random() - 0.5) * volatility;
  return basePrice * (1 + drift + randomShock);
}

// Generate timeline data from 2020 to present
export function generateTimelineData() {
  const data = [];
  const startDate = new Date('2020-01-01');
  const endDate = new Date();
  let currentDate = startDate;
  let spyPrice = 320; // SPY price in Jan 2020
  let currentRegime = 'risk_on';
  let regimeLength = 0;
  
  // Simulate realistic regime transitions
  const regimeHistory = [
    { start: '2020-01-01', end: '2020-02-19', regime: 'risk_on' },
    { start: '2020-02-20', end: '2020-03-23', regime: 'risk_off' },
    { start: '2020-03-24', end: '2020-08-31', regime: 'risk_on' },
    { start: '2020-09-01', end: '2020-10-30', regime: 'risk_off' },
    { start: '2020-11-01', end: '2021-02-28', regime: 'risk_on' },
    { start: '2021-03-01', end: '2021-05-15', regime: 'inflation_shock' },
    { start: '2021-05-16', end: '2021-09-30', regime: 'risk_on' },
    { start: '2021-10-01', end: '2021-12-31', regime: 'inflation_shock' },
    { start: '2022-01-01', end: '2022-06-15', regime: 'risk_off' },
    { start: '2022-06-16', end: '2022-08-15', regime: 'risk_on' },
    { start: '2022-08-16', end: '2022-10-12', regime: 'risk_off' },
    { start: '2022-10-13', end: '2023-02-28', regime: 'risk_on' },
    { start: '2023-03-01', end: '2023-03-31', regime: 'risk_off' },
    { start: '2023-04-01', end: '2023-07-31', regime: 'risk_on' },
    { start: '2023-08-01', end: '2023-10-27', regime: 'dollar_stress' },
    { start: '2023-10-28', end: '2024-03-31', regime: 'risk_on' },
    { start: '2024-04-01', end: '2024-04-30', regime: 'inflation_shock' },
    { start: '2024-05-01', end: '2024-07-31', regime: 'risk_on' },
    { start: '2024-08-01', end: '2024-08-15', regime: 'risk_off' },
    { start: '2024-08-16', end: '2025-01-31', regime: 'risk_on' },
    { start: '2025-02-01', end: '2025-12-31', regime: 'risk_on' }
  ];
  
  function getRegimeForDate(date) {
    const dateStr = format(date, 'yyyy-MM-dd');
    for (const period of regimeHistory) {
      if (dateStr >= period.start && dateStr <= period.end) {
        return period.regime;
      }
    }
    return 'risk_on';
  }

  while (currentDate <= endDate) {
    const regime = getRegimeForDate(currentDate);
    const volatility = regime === 'risk_off' ? 0.025 : (regime === 'inflation_shock' ? 0.018 : 0.012);
    
    spyPrice = generateSpyPrice(spyPrice, regime, volatility);
    
    // Generate confidence based on regime stability
    const baseConfidence = 70;
    const confidenceNoise = Math.floor(Math.random() * 20);
    const confidence = Math.min(95, Math.max(50, baseConfidence + confidenceNoise));
    
    data.push({
      date: format(currentDate, 'yyyy-MM-dd'),
      regime,
      confidence,
      spy_price: Math.round(spyPrice * 100) / 100
    });
    
    currentDate = addDays(currentDate, 1);
  }
  
  return data;
}

// Generate current snapshot
export function generateCurrentSnapshot() {
  const timeline = generateTimelineData();
  const latest = timeline[timeline.length - 1];
  const regime = latest.regime;
  const allocation = regimeAllocation[regime];
  
  return {
    date: latest.date,
    regime: latest.regime,
    confidence: latest.confidence,
    spy_price: latest.spy_price,
    overweight_assets: allocation.overweight,
    underweight_assets: allocation.underweight,
    explanation: allocation.explanation,
    triggers: allocation.triggers,
    features: {
      spy_return_20d: (Math.random() * 10 - 3).toFixed(2),
      qqq_return_20d: (Math.random() * 12 - 4).toFixed(2),
      tlt_return_20d: (Math.random() * 6 - 3).toFixed(2),
      hyg_lqd_ratio: (0.95 + Math.random() * 0.1).toFixed(4),
      tip_ief_ratio: (0.98 + Math.random() * 0.08).toFixed(4),
      uup_return_20d: (Math.random() * 4 - 2).toFixed(2),
      dbc_return_20d: (Math.random() * 8 - 2).toFixed(2),
      volatility_20d: (12 + Math.random() * 10).toFixed(2)
    }
  };
}

// Get a full snapshot for any historical date
export function getSnapshotForDate(dateStr) {
  const timeline = getCachedTimeline();
  // Find exact match or closest prior date
  let entry = timeline.find(d => d.date === dateStr);
  if (!entry) {
    const sorted = timeline.filter(d => d.date <= dateStr);
    entry = sorted[sorted.length - 1] || timeline[0];
  }
  if (!entry) return null;
  const allocation = regimeAllocation[entry.regime];
  return {
    date: entry.date,
    regime: entry.regime,
    confidence: entry.confidence,
    spy_price: entry.spy_price,
    overweight_assets: allocation.overweight,
    underweight_assets: allocation.underweight,
    explanation: allocation.explanation,
    triggers: allocation.triggers,
    features: {
      spy_r21d: (Math.random() * 10 - 3).toFixed(2),
      qqq_r21d: (Math.random() * 12 - 4).toFixed(2),
      tlt_r21d: (Math.random() * 6 - 3).toFixed(2),
      hyg_lqd_ratio: (0.95 + Math.random() * 0.1).toFixed(4),
      tip_ief_ratio: (0.98 + Math.random() * 0.08).toFixed(4),
      uup_r21d: (Math.random() * 4 - 2).toFixed(2),
      dbc_r21d: (Math.random() * 8 - 2).toFixed(2),
      spy_vol21d: (12 + Math.random() * 10).toFixed(2),
    },
  };
}

// Export cached timeline for consistent demo
let cachedTimeline = null;
export function getCachedTimeline() {
  if (!cachedTimeline) {
    cachedTimeline = generateTimelineData();
  }
  return cachedTimeline;
}

// Export cached snapshot for consistent demo
let cachedSnapshot = null;
export function getCachedSnapshot() {
  if (!cachedSnapshot) {
    cachedSnapshot = generateCurrentSnapshot();
  }
  return cachedSnapshot;
}