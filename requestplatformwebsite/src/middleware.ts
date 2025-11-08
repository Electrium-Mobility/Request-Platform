import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/*Might want to only let certain roles be authorized and include server join link in website unauthorized page*/
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  //allow images for front end
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/unauthorized") ||
    pathname.match(/\.(?:png|jpg|jpeg|svg|gif|ico|webp)$/i)
  ) {
    return NextResponse.next();
  }

  // Check if user has a valid session token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // No token - redirect to login
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated - continue
  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
