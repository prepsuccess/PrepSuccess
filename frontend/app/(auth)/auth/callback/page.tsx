import type { Metadata } from "next";
import { GoogleCallback } from "@/components/auth/GoogleCallback";

export const metadata: Metadata = { title: "Signing in — PrepSuccess", robots: { index: false } };

export default function AuthCallbackPage() {
  return <GoogleCallback />;
}
