/**
 * MacroPulse API client.
 * Set VITE_API_URL in your .env to point to the FastAPI backend.
 * Defaults to http://localhost:8000 for local development.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function fetchHealth() {
  const res = await fetch(`${BASE_URL}/api/health`);
  if (!res.ok) throw new Error("Backend unreachable");
  return res.json();
}

export async function computeRegime({ startDate, endDate, mode = "auto" }) {
  const res = await fetch(`${BASE_URL}/api/compute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      start_date: startDate,
      end_date: endDate,
      mode,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Compute failed (${res.status})`);
  }
  return res.json();
}

export async function fetchState() {
  const res = await fetch(`${BASE_URL}/api/state`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("State fetch failed");
  return res.json();
}

/**
 * Normalise backend response → shape the Dashboard expects.
 * Backend:  { regime: {label, confidence}, allocation: {overweight, underweight},
 *             explanation: [...], triggers: [...], timeline: {dates, spy_price, regime, confidence} }
 * Frontend: { regime, confidence, overweight_assets, underweight_assets,
 *             explanation (string), triggers ([]), date, features, timelineData }
 */
export function normaliseResponse(data) {
  const timeline = (data.timeline?.dates || []).map((date, i) => ({
    date,
    spy_price: data.timeline.spy_price[i],
    regime: data.timeline.regime[i],
    confidence: data.timeline.confidence[i],
  }));

  return {
    // current snapshot
    date: data.as_of,
    regime: data.regime?.label,
    confidence: data.regime?.confidence,
    overweight_assets: data.allocation?.overweight || [],
    underweight_assets: data.allocation?.underweight || [],
    // explanation: backend returns array; ExplanationCard expects string
    explanation: Array.isArray(data.explanation)
      ? data.explanation.join("\n\n")
      : data.explanation || "",
    triggers: data.triggers || [],
    features: data.features || {},
    data_mode_used: data.data_mode_used,
    // timeline
    timelineData: timeline,
  };
}