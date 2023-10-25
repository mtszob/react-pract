import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(request: NextRequest) {
  // ha a mainre akarunk navigálni és nincs beállítva cookie -> redirect login
  if (request.url.includes('/main') && !request.cookies.get('loggedInUser')) {
    const url = request.nextUrl.clone();
    url.pathname = 'login';
    return NextResponse.redirect(url);
  }
  // ha a loginra akarunk navigálni és be van állítva cookie -> redirect main
  if (request.url.includes('/login') && request.cookies.get('loggedInUser')) {
    const url = request.nextUrl.clone();
    url.pathname = 'main';
    return NextResponse.redirect(url);
  }

  // Step 1: Use the incoming request
  const defaultLocale = request.headers.get('x-default-locale') || 'hu';

  // Step 2: Create and call the next-intl middleware
  const handleI18nRouting = createMiddleware({
    // A list of all locales that are supported
    locales: ['en', 'hu'],
    // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
    defaultLocale: ''
  });
  const response = handleI18nRouting(request);

  // Step 3: Alter the response
  response.headers.set('x-default-locale', defaultLocale);

  return response;
}

export const config = {
  // Skip all paths that should not be internationalized. This example skips
  // certain folders and all pathnames with a dot (e.g. favicon.ico)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};