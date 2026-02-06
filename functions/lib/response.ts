export function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

export function jsonCached(data: unknown, maxAge = 60) {
  return json(data, 200, { 'Cache-Control': `public, max-age=${maxAge}` });
}

export function error(message: string, status = 400) {
  return json({ error: message }, status);
}

export function options() {
  return new Response(null, { status: 204 });
}
