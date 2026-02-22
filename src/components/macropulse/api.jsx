/**
 * MacroPulse API client.
 * Set VITE_API_URL in your .env to point to the FastAPI backend.
 * Defaults to ngrok URL for demo.
 */

const API_BASE =
  import.meta.env.VITE_API_URL || "https://marked-conrad-missing.ngrok-free.dev";

const NGROK_HEADERS = {
  "ngrok-skip-browser-warning": "true",
};

async function parseJsonSafely(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { _raw: text };
  }
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/api/health`, {
    headers: NGROK_HEADERS,
  });
  if (!res.ok) throw new Error(`Backend unreachable (${res.status})`);
  return parseJsonSafely(res);
}

export async function computeRegime({ startDate, endDate, mode = "auto" }) {
  const res = await fetch(`${API_BASE}/api/compute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...NGROK_HEADERS,
    },
    body: JSON.stringify({
      start_date: startDate,
      end_date: endDate,
      mode,
    }),
  });

  if (!res.ok) {
    const err = await parseJsonSafely(res);
    const detail =
      (err && (err.detail || err.message)) || `Compute failed (${res.status})`;
    throw new Error(detail);
  }

  return parseJsonSafely(res);
}

export async function fetchState() {
  const res = await fetch(`${API_BASE}/api/state`, {
    headers: NGROK_HEADERS,
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    const err = await parseJsonSafely(res);
    const detail =
      (err && (err.detail || err.message)) || `State fetch failed (${res.status})`;
    throw new Error(detail);
  }

  return parseJsonSafely(res);
}

/**
 * Normalise backend response → shape the Dashboard expects.
 */
export function normaliseResponse(data) {
  const dates = data?.timeline?.dates || [];
  const spy = data?.timeline?.spy_price || [];
  const reg = data?.timeline?.regime || [];
  const conf = data?.timeline?.confidence || [];

  const timeline = dates.map((date, i) => ({
    date,
    spy_price: spy[i],
    regime: reg[i],
    confidence: conf[i],
  }));

  return {
    date: data.as_of,
    regime: data.regime?.label,
    confidence: data.regime?.confidence,
    overweight_assets: data.allocation?.overweight || [],
    underweight_assets: data.allocation?.underweight || [],
    explanation: Array.isArray(data.explanation)
      ? data.explanation.join("\n\n")
      : data.explanation || "",
    triggers: data.triggers || [],
    features: data.features || {},
    data_mode_used: data.data_mode_used,
    timelineData: timeline,
  };
}