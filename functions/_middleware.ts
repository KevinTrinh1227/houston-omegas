export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);

  // Subdomain redirect
  if (url.hostname === 'rent.houstonomegas.com') {
    const target = new URL(url.pathname + url.search, 'https://houstonomegas.com');
    target.pathname = '/rent' + (url.pathname === '/' ? '' : url.pathname);
    return Response.redirect(target.toString(), 301);
  }

  // Handle OPTIONS (CORS preflight)
  if (context.request.method === 'OPTIONS') {
    const origin = context.request.headers.get('Origin') || '';
    const allowedOrigins = ['https://houstonomegas.com', 'https://www.houstonomegas.com'];
    const isAllowed = allowedOrigins.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin);

    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const response = await context.next();

  // Add security headers to all responses
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Add CORS headers to API responses
  if (url.pathname.startsWith('/api/')) {
    const origin = context.request.headers.get('Origin') || '';
    const allowedOrigins = ['https://houstonomegas.com', 'https://www.houstonomegas.com'];
    const isAllowed = allowedOrigins.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin);
    response.headers.set('Access-Control-Allow-Origin', isAllowed ? origin : allowedOrigins[0]);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
};
