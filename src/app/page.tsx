import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { Hero } from "@/components/hero";
import { Listings } from "@/components/listings";
import { Services } from "@/components/services";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <Services />
        <Listings />
        <About />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
