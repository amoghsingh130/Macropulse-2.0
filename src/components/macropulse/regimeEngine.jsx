/**
 * regimeEngine.js — Rule-based, deterministic macro regime classifier.
 * No ML. No black box. Pure signal logic.
 */

import { computeSignals } from './signalEngine';

export const REGIMES = {
  RISK_ON: 'risk_on',
  RISK_OFF: 'risk_off',
  INFLATION_SHOCK: 'inflation_shock',
  DOLLAR_STRESS: 'dollar_stress',
};

/**
 * Classify regime from a features snapshot.
 * Returns { regime, confidence, decomposition, signals }
 */
export function classifyRegime(features) {
  const signals = computeSignals(features);

  // --- Rule-based decision tree ---
  // Priority: Risk-Off > Inflation Shock > Dollar Stress > Risk-On

  const riskOffScore =
    (signals.hyg_lqd_spread_wide ? 30 : 0) +
    (signals.spy_below_50dma ? 20 : 0) +
    (signals.spy_below_200dma ? 20 : 0) +
    (signals.vol_elevated ? 20 : 0) +
    (signals.momentum_negative ? 10 : 0);

  const inflationScore =
    (signals.tip_ief_rising ? 35 : 0) +
    (signals.dbc_momentum_positive ? 25 : 0) +
    (signals.real_yields_falling ? 25 : 0) +
    (signals.tlt_falling ? 15 : 0);

  const dollarStressScore =
    (signals.uup_momentum_negative ? 40 : 0) +
    (signals.gold_rising ? 30 : 0) +
    (signals.dbc_momentum_positive && !signals.tip_ief_rising ? 30 : 0);

  const riskOnScore =
    (signals.spy_above_50dma ? 25 : 0) +
    (signals.spy_above_200dma ? 20 : 0) +
    (signals.hyg_lqd_spread_tight ? 25 : 0) +
    (signals.momentum_positive ? 20 : 0) +
    (!signals.vol_elevated ? 10 : 0);

  const scores = {
    [REGIMES.RISK_OFF]: riskOffScore,
    [REGIMES.INFLATION_SHOCK]: inflationScore,
    [REGIMES.DOLLAR_STRESS]: dollarStressScore,
    [REGIMES.RISK_ON]: riskOnScore,
  };

  const sortedRegimes = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topRegime, topScore] = sortedRegimes[0];
  const [, secondScore] = sortedRegimes[1];

  // Confidence: based on separation from second place
  const separation = topScore - secondScore;
  const rawConfidence = Math.min(98, Math.max(45, 50 + separation * 1.2));
  const confidence = Math.round(rawConfidence);

  // Decomposition components
  const crossAssetAgreement = computeCrossAssetAgreement(signals, topRegime);
  const momentumConfirmation = computeMomentumConfirmation(signals, topRegime);
  const volatilityFilter = computeVolatilityFilter(signals, topRegime);

  return {
    regime: topRegime,
    confidence,
    scores,
    decomposition: {
      crossAssetAgreement,
      momentumConfirmation,
      volatilityFilter,
    },
    signals,
  };
}

function computeCrossAssetAgreement(signals, regime) {
  const checks = {
    risk_on: [signals.spy_above_50dma, signals.hyg_lqd_spread_tight, !signals.vol_elevated],
    risk_off: [signals.spy_below_50dma, signals.hyg_lqd_spread_wide, signals.vol_elevated],
    inflation_shock: [signals.tip_ief_rising, signals.dbc_momentum_positive, signals.tlt_falling],
    dollar_stress: [signals.uup_momentum_negative, signals.gold_rising, signals.dbc_momentum_positive],
  };
  const arr = checks[regime] || [];
  return Math.round((arr.filter(Boolean).length / Math.max(arr.length, 1)) * 100);
}

function computeMomentumConfirmation(signals, regime) {
  const checks = {
    risk_on: [signals.momentum_positive, signals.spy_above_200dma],
    risk_off: [signals.momentum_negative, signals.spy_below_200dma],
    inflation_shock: [signals.dbc_momentum_positive, signals.real_yields_falling],
    dollar_stress: [signals.uup_momentum_negative, signals.gold_rising],
  };
  const arr = checks[regime] || [];
  return Math.round((arr.filter(Boolean).length / Math.max(arr.length, 1)) * 100);
}

function computeVolatilityFilter(signals, regime) {
  if (regime === 'risk_off') return signals.vol_elevated ? 100 : 30;
  if (regime === 'risk_on') return signals.vol_elevated ? 20 : 100;
  return 65;
}