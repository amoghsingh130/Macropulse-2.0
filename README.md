# MacroPulse  
### A Deterministic Macro Regime Decision Engine

MacroPulse is a production-style macro regime classification dashboard that transforms cross-asset signals into actionable allocation decisions.

It answers one core question:

> **What macro regime are we in right now — and what should we do about it?**

Built with rule-based signal logic, explainable triggers, and a systematic allocation engine, MacroPulse is designed to feel institutional — not experimental.

---

## Overview

Markets move through regimes. Investors often react late.

MacroPulse classifies market conditions into four macro regimes using cross-asset relationships:

- 🟢 **Risk-On**
- 🔴 **Risk-Off**
- 🟠 **Inflation Shock**
- 🔵 **Dollar Stress**

Each regime produces:
- Confidence score
- Allocation recommendation
- Trigger explanation
- Regime transition alerts
- Historical backtest performance

No black-box ML. No opaque AI claims.  
Everything is deterministic and explainable.

---

## Core Features

### 1. Regime Classification Engine

Signals used:

- HYG/LQD credit spread
- SPY 50DMA vs 200DMA momentum
- UUP dollar momentum
- TIP/IEF inflation expectations

Each signal is normalized and evaluated against thresholds to determine the current macro regime.

**Engine Files:**
macropulse/
├── regimeEngine.js
├── signalEngine.js
├── allocationEngine.js


---

### 2. Backtest Mode (Since 2020)

Toggle into Backtest Mode to evaluate strategy performance.

| Regime | Allocation |
|--------|------------|
| Risk-On | 100% SPY |
| Risk-Off | 100% TLT |
| Inflation Shock | 50% DBC + 50% TIP |
| Dollar Stress | 50% UUP + 50% IEF |

Backtest metrics include:
- Cumulative returns vs SPY baseline
- Sharpe ratio
- Maximum drawdown
- Interactive Bloomberg-style chart

---

### 3. Regime Change Alert System

When regime transitions occur:

- Animated alert: Regime Shift Detected: Risk-Off → Inflation Shock
- Transition history table with timestamps

---

### 4. Explainability Panel

MacroPulse is not a black box.

Each classification includes:
- Z-score visualization for each signal
- Threshold crossing highlights
- Clear trigger conditions

Users can see exactly why the system reached its conclusion.

---

### 5. Confidence Decomposition

Overall confidence is broken into:

- Cross-asset agreement %
- Momentum confirmation %
- Volatility filter %

Displayed as a stacked bar for transparency.

---

### 6. Investor Mode

Risk tolerance toggle:

- Conservative
- Balanced
- Aggressive

Allocation weights adjust dynamically based on regime + risk profile.

Includes allocation donut chart visualization.

---

### 7. Shock Simulator (Scenario Engine)

Simulate macro events:

- Fed rate hike
- Oil spike
- Credit spread widening

The engine recalculates signals and predicts resulting regime shifts.

---

## Design Language

- Dark Bloomberg-style theme (#0f172a base)
- Regime color system:
- Green: Risk-On
- Red: Risk-Off
- Orange: Inflation Shock
- Blue: Dollar Stress
- Smooth animated transitions
- Press **R** to refresh data

---

## Demo Mode

Runs using cached 2020–present data for consistent testing.

Backend connectivity banner appears only when backend is connected.

---

## Architecture

macropulse/
├── regimeEngine.js
├── signalEngine.js
├── allocationEngine.js
├── BacktestPanel.jsx
├── ExplainabilityPanel.jsx
├── RegimeAlertSystem.jsx
├── ConfidenceDecomposition.jsx
├── InvestorModeSelector.jsx
├── ShockSimulator.jsx

Core Principles:

- Deterministic rule engine
- No machine learning
- Modular signal architecture
- Institutional design
- Production-style separation of concerns

---

## Tech Stack

- React (Vite)
- Tailwind CSS
- Recharts
- Deterministic JavaScript rule engine

---

## Future Roadmap

- Live API integration (Stooq / Tiingo / Alpha Vantage)
- Volatility regime modeling
- Dynamic threshold calibration
- Risk-parity weighting
- Portfolio attribution view
- Regime probability forecasting

---

## License

MIT
