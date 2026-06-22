import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const requireAuth = ClerkExpressRequireAuth({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export default requireAuth;