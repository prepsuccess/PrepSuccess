import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { SmoothScroll } from "@/components/motion/SmoothScroll";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SmoothScroll />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
