import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Middleware معطل — الموقع يعمل بدون تسجيل دخول
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
