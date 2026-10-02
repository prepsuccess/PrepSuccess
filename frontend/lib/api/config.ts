/** Backend origin, baked in at build time (set NEXT_PUBLIC_API_BASE_URL on Vercel). */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
