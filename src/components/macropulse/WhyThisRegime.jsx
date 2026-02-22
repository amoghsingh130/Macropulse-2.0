import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { REGIME_STYLE } from './regimeColors';

const INSTITUTIONAL_COPY = {
  risk_on: {
    headline: 'Broad-based risk appetite with equity leadership',
    body: [
      'The GMM classifier assigns this regime when equities outperform bonds on a rolling 21-day basis, credit spreads tighten (HYG/LQD ratio rises), and realised volatility remains below its long-run median.',
      'Historically, Risk-On periods coincide with above-trend GDP growth, accommodative financial conditions, and positive earnings revisions. Duration underperforms; cyclicals and high-yield credit are preferred.',
      'Portfolio implication: tilt toward equities and spread products; reduce government bond exposure and cash drag.',
    ],
  },
  risk_off: {
    headline: 'Defensive rotation — capital preservation priority',
    body: [
      'Risk-Off is triggered when equity 21d returns turn negative, credit spreads widen materially, and realised volatility spikes above the rolling 63-day 75th percentile.',
      'These conditions typically accompany recession fears, geopolitical shocks, or systemic financial stress. Historically, Treasuries rally sharply and the USD strengthens as investors seek safe-haven assets.',
      'Portfolio implication: overweight duration and investment-grade bonds; reduce equity beta and high-yield exposure.',
    ],
  },
  inflation_shock: {
    headline: 'Inflationary impulse eroding real returns',
    body: [
      'This regime is identified by above-median TIP/IEF relative performance (rising breakevens), strong commodity momentum (DBC), and negative real returns on nominal bonds.',
      'Inflation shocks historically compress P/E multiples and punish long-duration assets. Real assets — commodities, TIPS, and short-duration equities — tend to outperform.',
      'Portfolio implication: favour inflation-protected bonds and commodity exposures; aggressively reduce nominal duration.',
    ],
  },
  dollar_stress: {
    headline: 'USD strength creating cross-asset headwinds',
    body: [
      'Dollar Stress is flagged when the UUP (USD index ETF) 21-day return exceeds +1.5%, creating headwinds for commodities, EM assets, and multinationals with foreign revenue.',
      'A strong dollar historically coincides with tighter global liquidity, pressure on commodity-linked assets, and capital flows toward US fixed income.',
      'Portfolio implication: lean into domestic USD-denominated bonds; reduce commodity and EM exposures.',
    ],
  },
};

export default function WhyThisRegime({ regime, isLoading }) {
  const style = REGIME_STYLE[regime] || REGIME_STYLE.risk_on;
  const copy  = INSTITUTIONAL_COPY[regime] || INSTITUTIONAL_COPY.risk_on;

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-44 bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <motion.div
      key={regime}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`rounded-2xl border ${style.border} ${style.bg} p-6 shadow-xl`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg" style={{ background: `${style.hex}22` }}>
          <Brain className="w-5 h-5" style={{ color: style.hex }} />
        </div>
        <div>
          <h3 className="font-semibold text-white">Why This Regime?</h3>
          <p className={`text-xs ${style.text}`}>{copy.headline}</p>
        </div>
      </div>

      <div className="relative space-y-3 pl-4">
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
          style={{ background: `linear-gradient(to bottom, ${style.hex}, ${style.hex}44)` }}
        />
        {copy.body.map((para, i) => (
          <p key={i} className="text-sm text-slate-300 leading-relaxed">{para}</p>
        ))}
      </div>
    </motion.div>
  );
}