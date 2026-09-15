import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { Faq } from "@/components/faq";
import { Hero } from "@/components/hero";
import { InstagramCta } from "@/components/instagram-cta";
import { Listings } from "@/components/listings";
import { Process } from "@/components/process";
import { Services } from "@/components/services";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { Testimonials } from "@/components/testimonials";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { Zones } from "@/components/zones";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <Zones />
        <Services />
        <Listings />
        <Process />
        <About />
        <Testimonials />
        <Faq />
        <InstagramCta />
        <Contact />
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </>
  );
}
