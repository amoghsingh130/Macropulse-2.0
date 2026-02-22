/**
 * Shared regime color/label/style constants — single source of truth.
 * Import this instead of defining per-component.
 */

export const REGIME_COLORS = {
  risk_on:         '#22c55e',
  risk_off:        '#ef4444',
  inflation_shock: '#f97316',
  dollar_stress:   '#3b82f6',
};

export const REGIME_LABELS = {
  risk_on:         'Risk-On',
  risk_off:        'Risk-Off',
  inflation_shock: 'Inflation Shock',
  dollar_stress:   'Dollar Stress',
};

export const REGIME_BG_OPACITY = {
  risk_on:         '#22c55e18',
  risk_off:        '#ef444418',
  inflation_shock: '#f9731618',
  dollar_stress:   '#3b82f618',
};

export const REGIME_STYLE = {
  risk_on: {
    label:       'Risk-On',
    subtitle:    'Growth Expansion',
    gradient:    'from-emerald-500 to-green-600',
    bg:          'bg-emerald-500/10',
    border:      'border-emerald-500/30',
    text:        'text-emerald-400',
    glow:        'shadow-emerald-500/20',
    hex:         '#22c55e',
  },
  risk_off: {
    label:       'Risk-Off',
    subtitle:    'Growth Scare',
    gradient:    'from-red-500 to-rose-600',
    bg:          'bg-red-500/10',
    border:      'border-red-500/30',
    text:        'text-red-400',
    glow:        'shadow-red-500/20',
    hex:         '#ef4444',
  },
  inflation_shock: {
    label:       'Inflation Shock',
    subtitle:    'Price Pressure',
    gradient:    'from-orange-500 to-amber-600',
    bg:          'bg-orange-500/10',
    border:      'border-orange-500/30',
    text:        'text-orange-400',
    glow:        'shadow-orange-500/20',
    hex:         '#f97316',
  },
  dollar_stress: {
    label:       'Dollar Stress',
    subtitle:    'Currency Pressure',
    gradient:    'from-blue-500 to-indigo-600',
    bg:          'bg-blue-500/10',
    border:      'border-blue-500/30',
    text:        'text-blue-400',
    glow:        'shadow-blue-500/20',
    hex:         '#3b82f6',
  },
};