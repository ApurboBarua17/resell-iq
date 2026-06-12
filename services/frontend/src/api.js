// API client for the FastAPI gateway (proxied via /api in dev and nginx).

const headers = { 'Content-Type': 'application/json' }

async function asJson(res, label) {
  if (!res.ok) {
    let detail = ''
    try {
      detail = (await res.json()).detail || ''
    } catch {
      /* non-JSON error body */
    }
    throw new Error(detail || `${label} failed (${res.status})`)
  }
  return res.json()
}

// payload is mode-shaped: {mode, item_description?, condition?, category?,
// brand?, model?, size?, era?} — the gateway validates per mode.
export async function search(payload) {
  const res = await fetch('/api/search', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  return asJson(res, 'search')
}

export async function pollResult(jobId, { intervalMs = 1500, timeoutMs = 90000 } = {}) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const data = await asJson(await fetch(`/api/result/${jobId}`), 'result poll')
    if (data.status === 'complete') return data.result
    if (data.status === 'failed') {
      throw new Error(data.result?.error || 'pricing job failed')
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
  throw new Error('Timed out waiting for the pricing result — please try again.')
}

export async function getHistory(limit = 10) {
  const data = await asJson(await fetch(`/api/history?limit=${limit}`), 'history')
  return data.searches
}

export async function getCacheStats() {
  return asJson(await fetch('/api/cache-stats'), 'cache-stats')
}
