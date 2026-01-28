export async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "ecommerce-mcp-server/0.1.0 (contact@example.com)",
      ...options.headers
    },
    ...options
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }

  return res.json();
}
