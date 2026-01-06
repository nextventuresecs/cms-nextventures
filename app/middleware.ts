// middleware.ts
import { authMiddleware } from './lib/auth';

export default authMiddleware;

export const config = {
  matcher: ['/admin/:path*'],
};