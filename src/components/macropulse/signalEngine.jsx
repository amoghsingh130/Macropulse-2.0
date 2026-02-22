/**
 * signalEngine.js — Computes normalized signals and z-scores from raw features.
 * All signals are deterministic thresholds — no ML.
 */

// Historical reference levels for z-score computation
const REFERENCE = {
  hyg_lqd_ratio: { mean: 1.02, std: 0.04 },
  tip_ief_ratio: { mean: 1.00, std: 0.03 },
  spy_r21d:      { mean: 0.8,  std: 3.5  },
  qqq_r21d:      { mean: 1.0,  std: 4.5  },
  tlt_r21d:      { mean: 0.0,  std: 2.5  },
  uup_r21d:      { mean: 0.0,  std: 1.5  },
  dbc_r21d:      { mean: 0.5,  std: 3.0  },
  spy_vol21d:    { mean: 15,   std: 7    },
  spy_r63d:      { mean: 2.5,  std: 8.0  },
};

export function zScore(value, key) {
  const ref = REFERENCE[key];
  if (!ref) return 0;
  return parseFloat(((value - ref.mean) / ref.std).toFixed(2));
}

/**
 * Compute binary signals + z-scores from a features object.
 */
export function computeSignals(features = {}) {
  const f = features;

  const hygLqdRatio  = parseFloat(f.hyg_lqd_ratio || f.hyg_lqd_r21d || 1.0);
  const tipIefRatio  = parseFloat(f.tip_ief_ratio  || f.tip_ief_r21d  || 1.0);
  const spyR21d      = parseFloat(f.spy_r21d  || f.spy_return_20d || 0);
  const tltR21d      = parseFloat(f.tlt_r21d  || 0);
  const uupR21d      = parseFloat(f.uup_r21d  || f.uup_return_20d || 0);
  const dbcR21d      = parseFloat(f.dbc_r21d  || f.dbc_return_20d || 0);
  const vol21d       = parseFloat(f.spy_vol21d || f.volatility_20d || 15);
  const spyR63d      = parseFloat(f.spy_r63d  || 0);

  return {
    // Equity momentum
    spy_above_50dma:  spyR21d > 1.0,
    spy_below_50dma:  spyR21d < -1.0,
    spy_above_200dma: spyR63d > 2.0,
    spy_below_200dma: spyR63d < -2.0,
    momentum_positive: spyR21d > 0 && spyR63d > 0,
    momentum_negative: spyR21d < 0 && spyR63d < 0,

    // Credit conditions
    hyg_lqd_spread_tight: hygLqdRatio > 1.02,
    hyg_lqd_spread_wide:  hygLqdRatio < 0.98,

    // Inflation signals
    tip_ief_rising:      tipIefRatio > 1.01,
    real_yields_falling: tipIefRatio > 1.005 && tltR21d < 0,
    tlt_falling:         tltR21d < -1.0,

    // Dollar signals
    uup_momentum_negative: uupR21d < -0.5,
    gold_rising:           dbcR21d > 1.5, // DBC as commodity proxy

    // Commodity
    dbc_momentum_positive: dbcR21d > 0.5,

    // Volatility
    vol_elevated: vol21d > 20,

    // Raw values for display
    _raw: {
      hygLqdRatio,
      tipIefRatio,
      spyR21d,
      tltR21d,
      uupR21d,
      dbcR21d,
      vol21d,
      spyR63d,
    },

    // Z-scores
    _zscores: {
      hyg_lqd_ratio: zScore(hygLqdRatio, 'hyg_lqd_ratio'),
      tip_ief_ratio:  zScore(tipIefRatio,  'tip_ief_ratio'),
      spy_r21d:       zScore(spyR21d,      'spy_r21d'),
      tlt_r21d:       zScore(tltR21d,      'tlt_r21d'),
      uup_r21d:       zScore(uupR21d,      'uup_r21d'),
      dbc_r21d:       zScore(dbcR21d,      'dbc_r21d'),
      spy_vol21d:     zScore(vol21d,       'spy_vol21d'),
      spy_r63d:       zScore(spyR63d,      'spy_r63d'),
    },
  };
}

/**
 * Apply a macro shock to features and return modified features.
 */
export function applyShock(features, shockType) {
  const f = { ...features };
  switch (shockType) {
    case 'fed_rate_hike':
      f.tlt_r21d  = (parseFloat(f.tlt_r21d  || 0) - 4).toFixed(2);
      f.hyg_lqd_ratio = (parseFloat(f.hyg_lqd_ratio || 1) - 0.06).toFixed(4);
      f.spy_r21d  = (parseFloat(f.spy_r21d   || 0) - 3).toFixed(2);
      f.uup_r21d  = (parseFloat(f.uup_r21d   || 0) + 2).toFixed(2);
      break;
    case 'oil_spike':
      f.dbc_r21d   = (parseFloat(f.dbc_r21d  || 0) + 8).toFixed(2);
      f.tip_ief_ratio = (parseFloat(f.tip_ief_ratio || 1) + 0.04).toFixed(4);
      f.tlt_r21d  = (parseFloat(f.tlt_r21d   || 0) - 2).toFixed(2);
      break;
    case 'credit_spread':
      f.hyg_lqd_ratio = (parseFloat(f.hyg_lqd_ratio || 1) - 0.08).toFixed(4);
      f.spy_r21d  = (parseFloat(f.spy_r21d   || 0) - 5).toFixed(2);
      f.spy_vol21d = (parseFloat(f.spy_vol21d || 15) + 10).toFixed(2);
      break;
    default:
      break;
  }
  return f;
}