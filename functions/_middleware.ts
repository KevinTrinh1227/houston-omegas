export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);

  if (url.hostname === 'rent.houstonomegas.com') {
    const target = new URL(url.pathname + url.search, 'https://houstonomegas.com');
    target.pathname = '/rent' + (url.pathname === '/' ? '' : url.pathname);
    return Response.redirect(target.toString(), 301);
  }

  return context.next();
};
