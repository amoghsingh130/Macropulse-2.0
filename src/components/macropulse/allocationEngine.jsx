/**
 * allocationEngine.js — Deterministic allocation logic by regime + risk tolerance.
 */

// Base allocations by regime
const BASE_ALLOCATIONS = {
  risk_on: {
    SPY: 60, QQQ: 30, HYG: 10,
    TLT: 0, TIP: 0, DBC: 0, UUP: 0, IEF: 0,
  },
  risk_off: {
    TLT: 50, IEF: 30, CASH: 20,
    SPY: 0, QQQ: 0, HYG: 0, DBC: 0, UUP: 0,
  },
  inflation_shock: {
    DBC: 50, TIP: 50,
    SPY: 0, QQQ: 0, TLT: 0, HYG: 0, UUP: 0, IEF: 0,
  },
  dollar_stress: {
    UUP: 0, IEF: 50, GLD: 30, DBC: 20,
    SPY: 0, QQQ: 0, TLT: 0, HYG: 0,
  },
};

// Risk tolerance multipliers
const RISK_MULTIPLIERS = {
  conservative: { equity: 0.5, alternative: 0.7, bond: 1.3 },
  balanced:     { equity: 1.0, alternative: 1.0, bond: 1.0 },
  aggressive:   { equity: 1.5, alternative: 1.3, bond: 0.6 },
};

const EQUITY_ASSETS      = new Set(['SPY', 'QQQ', 'HYG']);
const BOND_ASSETS        = new Set(['TLT', 'IEF', 'TIP', 'CASH']);
const ALTERNATIVE_ASSETS = new Set(['DBC', 'GLD', 'UUP']);

/**
 * Get adjusted allocation weights for a given regime and risk tolerance.
 * Returns sorted array: [{ asset, weight, type }]
 */
export function getAllocation(regime, riskTolerance = 'balanced') {
  const base = BASE_ALLOCATIONS[regime] || BASE_ALLOCATIONS.risk_on;
  const mult = RISK_MULTIPLIERS[riskTolerance] || RISK_MULTIPLIERS.balanced;

  const raw = {};
  for (const [asset, weight] of Object.entries(base)) {
    if (weight === 0) continue;
    const type = EQUITY_ASSETS.has(asset) ? 'equity'
               : BOND_ASSETS.has(asset)   ? 'bond'
               : 'alternative';
    raw[asset] = weight * mult[type];
  }

  // Normalize to 100%
  const total = Object.values(raw).reduce((s, v) => s + v, 0);
  return Object.entries(raw)
    .map(([asset, weight]) => ({
      asset,
      weight: Math.round((weight / total) * 100),
      type:   EQUITY_ASSETS.has(asset) ? 'equity'
            : BOND_ASSETS.has(asset)   ? 'bond'
            : 'alternative',
    }))
    .sort((a, b) => b.weight - a.weight);
}

/**
 * Backtest: simulate strategy returns vs SPY baseline.
 * Returns { dates, strategyReturns, spyReturns, metrics }
 */
export function runBacktest(timelineData) {
  if (!timelineData || timelineData.length === 0) return null;

  let strategyValue = 100;
  let spyValue      = 100;
  let prevSpyPrice  = timelineData[0].spy_price;

  const dates             = [];
  const strategyReturns   = [];
  const spyReturns        = [];
  const strategyDailyRets = [];
  const spyDailyRets      = [];

  // Simple multi-asset proxies: assume correlated daily moves
  const ASSET_SPY_BETA = {
    SPY: 1.0, QQQ: 1.2, HYG: 0.6,
    TLT: -0.3, IEF: -0.15, TIP: -0.1, CASH: 0,
    DBC: 0.4, GLD: 0.1, UUP: -0.4,
  };

  for (let i = 1; i < timelineData.length; i++) {
    const d        = timelineData[i];
    const prevSpy  = timelineData[i - 1].spy_price;
    const curSpy   = d.spy_price;
    const spyRet   = prevSpy > 0 ? (curSpy - prevSpy) / prevSpy : 0;

    const alloc = BASE_ALLOCATIONS[d.regime] || BASE_ALLOCATIONS.risk_on;
    const totalAlloc = Object.values(alloc).reduce((s, v) => s + v, 0);

    let stratRet = 0;
    for (const [asset, w] of Object.entries(alloc)) {
      const beta = ASSET_SPY_BETA[asset] ?? 0.5;
      stratRet += (w / totalAlloc) * (spyRet * beta);
    }

    strategyValue *= (1 + stratRet);
    spyValue      *= (1 + spyRet);

    dates.push(d.date);
    strategyReturns.push(parseFloat(((strategyValue - 100)).toFixed(2)));
    spyReturns.push(parseFloat(((spyValue - 100)).toFixed(2)));
    strategyDailyRets.push(stratRet);
    spyDailyRets.push(spyRet);
  }

  const metrics = computeMetrics(strategyDailyRets, spyDailyRets, strategyReturns, spyReturns);

  return { dates, strategyReturns, spyReturns, metrics };
}

function computeMetrics(stratDailyRets, spyDailyRets, stratCumRets, spyCumRets) {
  const annFactor = 252;

  const mean = arr => arr.reduce((s, v) => s + v, 0) / arr.length;
  const std  = arr => {
    const m = mean(arr);
    return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
  };

  const stratMean = mean(stratDailyRets) * annFactor;
  const stratStd  = std(stratDailyRets) * Math.sqrt(annFactor);
  const spyMean   = mean(spyDailyRets) * annFactor;
  const spyStd    = std(spyDailyRets) * Math.sqrt(annFactor);
  const rfRate    = 0.04;

  const stratSharpe = stratStd > 0 ? ((stratMean - rfRate) / stratStd).toFixed(2) : '—';
  const spySharpe   = spyStd   > 0 ? ((spyMean   - rfRate) / spyStd  ).toFixed(2) : '—';

  // Max drawdown
  function maxDrawdown(cumRets) {
    let peak = -Infinity, maxDD = 0;
    for (const r of cumRets) {
      if (r > peak) peak = r;
      const dd = peak - r;
      if (dd > maxDD) maxDD = dd;
    }
    return maxDD.toFixed(1);
  }

  return {
    strategyTotalReturn: stratCumRets[stratCumRets.length - 1]?.toFixed(1) ?? '0',
    spyTotalReturn:      spyCumRets[spyCumRets.length - 1]?.toFixed(1) ?? '0',
    strategyMaxDrawdown: maxDrawdown(stratCumRets),
    spyMaxDrawdown:      maxDrawdown(spyCumRets),
    strategySharpe:      stratSharpe,
    spySharpe,
  };
}

export { BASE_ALLOCATIONS };