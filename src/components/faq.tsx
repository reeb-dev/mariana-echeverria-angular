"use client";

import { Reveal } from "@/components/reveal";
import { FAQS } from "@/data/properties";

export function Faq() {
  return (
    <section
      id="faq"
      className="border-y border-border bg-mist/60 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <p className="text-sm tracking-[0.2em] text-forest uppercase">FAQ</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl tracking-tight text-forest-deep md:text-5xl">
            Preguntas frecuentes
          </h2>
        </Reveal>

        <div className="mt-12 divide-y divide-border border-y border-border">
          {FAQS.map((item, index) => (
            <Reveal key={item.q} delayMs={index * 40}>
              <details className="group py-5">
                <summary className="cursor-pointer list-none font-heading text-xl text-forest-deep marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start justify-between gap-4">
                    {item.q}
                    <span className="mt-1 text-stone-warm transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
                  {item.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
