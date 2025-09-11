import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const { pathname } = req.nextUrl

  // Default: allow indexing
  let robots = 'index, follow'

  // Block low‑value or sensitive areas
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/console') ||
    pathname.startsWith('/private') ||
    pathname.startsWith('/my-')
  ) {
    robots = 'noindex, nofollow'
  }

  res.headers.set('X-Robots-Tag', robots)
  return res
}

export const config = {
  // Skip Next.js internals and static assets
  matcher: ['/((?!_next|static|.*\.(?:png|jpg|jpeg|svg|gif|webp|ico|json|xml)).*)'],
}

