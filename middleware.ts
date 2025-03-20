import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  // Get the pathname of the request
  const path = req.nextUrl.pathname;
  
  // Public routes that don't require authentication
  const publicRoutes = ["/", "/sign-in", "/sign-up"];
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route));
  
  // If the route is public, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Get auth state
  const { userId } = getAuth(req);
  
  // If the user is not signed in, redirect to the sign-in page
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }
  
  // Allow access to authenticated user
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)"
  ]
};