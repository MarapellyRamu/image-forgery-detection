import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('forgery_token')?.value
  // Middleware on edge doesn't easily have access to localStorage, so typically we rely on client-side check 
  // or cookie if we store token in cookie. Since requirements state "JWT stored in localStorage",
  // we will just handle auth protection primarily on client side, but we can also add basic redirects here if cookies exist.
  // We'll let client-side AuthContext handle the heavy lifting for localStorage.
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
