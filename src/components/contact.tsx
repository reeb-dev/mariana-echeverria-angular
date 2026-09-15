"use client";

import { FormEvent, useState } from "react";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT } from "@/data/properties";

type FormState = "idle" | "error" | "success";

export function Contact() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const propertyType = String(data.get("propertyType") ?? "").trim();
    const operation = String(data.get("operation") ?? "").trim();
    const notes = String(data.get("message") ?? "").trim();

    if (!name || !email || !phone) {
      setState("error");
      setMessage("Completá nombre, email y teléfono para continuar.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState("error");
      setMessage("Revisá el email: el formato no parece válido.");
      return;
    }

    const body = [
      `Hola Mariana, soy ${name}.`,
      `Email: ${email}`,
      `Teléfono: ${phone}`,
      propertyType ? `Tipo de propiedad: ${propertyType}` : "",
      operation ? `Operación: ${operation}` : "",
      notes ? `Consulta: ${notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const wa = `${CONTACT.whatsappUrl}?text=${encodeURIComponent(body)}`;
    window.open(wa, "_blank", "noopener,noreferrer");
    setState("success");
    setMessage(
      "Abrimos WhatsApp con tu consulta. Si no se abrió, escribí al número de contacto."
    );
    form.reset();
  }

  return (
    <section
      id="contacto"
      className="relative overflow-hidden bg-forest-deep text-primary-foreground"
    >
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-stone-warm/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:px-8 md:py-28">
        <Reveal>
          <p className="text-sm tracking-[0.2em] text-stone-warm uppercase">
            Contacto
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-tight md:text-5xl">
            Pedí tu tasación
          </h2>
          <p className="mt-4 max-w-md text-white/75">
            Contanos sobre tu inmueble y te respondemos a la brevedad. También
            podés escribir por WhatsApp o Instagram.
          </p>

          <dl className="mt-10 space-y-5 text-sm">
            <div>
              <dt className="tracking-[0.14em] text-white/50 uppercase">
                WhatsApp
              </dt>
              <dd className="mt-1">
                <a
                  href={CONTACT.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-white underline decoration-white/25 underline-offset-4 transition hover:decoration-stone-warm"
                >
                  {CONTACT.phoneDisplay}
                </a>
                <span className="text-white/55"> / {CONTACT.phoneSecondary}</span>
              </dd>
            </div>
            <div>
              <dt className="tracking-[0.14em] text-white/50 uppercase">Email</dt>
              <dd className="mt-1">
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="text-base text-white underline decoration-white/25 underline-offset-4 transition hover:decoration-stone-warm"
                >
                  {CONTACT.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="tracking-[0.14em] text-white/50 uppercase">
                Instagram
              </dt>
              <dd className="mt-1">
                <a
                  href={CONTACT.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-white underline decoration-white/25 underline-offset-4 transition hover:decoration-stone-warm"
                >
                  @{CONTACT.instagram}
                </a>
              </dd>
            </div>
            <div>
              <dt className="tracking-[0.14em] text-white/50 uppercase">Sedes</dt>
              <dd className="mt-2 space-y-2 text-white/75">
                {CONTACT.offices.map((office) => (
                  <p key={office.name}>
                    <span className="text-white">{office.name}</span>
                    <br />
                    {office.address}
                  </p>
                ))}
              </dd>
            </div>
          </dl>
        </Reveal>

        <Reveal delayMs={100}>
          <form
            onSubmit={onSubmit}
            className="space-y-5 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm md:p-7"
            noValidate
            aria-describedby="form-status"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/90">
                Nombre
              </Label>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                placeholder="Tu nombre"
                className="h-10 border-white/20 bg-white/10 text-white placeholder:text-white/45"
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  className="h-10 border-white/20 bg-white/10 text-white placeholder:text-white/45"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white/90">
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="11 ..."
                  className="h-10 border-white/20 bg-white/10 text-white placeholder:text-white/45"
                />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="propertyType" className="text-white/90">
                  Tipo de propiedad
                </Label>
                <Input
                  id="propertyType"
                  name="propertyType"
                  placeholder="Casa, depto, campo..."
                  className="h-10 border-white/20 bg-white/10 text-white placeholder:text-white/45"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="operation" className="text-white/90">
                  Operación
                </Label>
                <Input
                  id="operation"
                  name="operation"
                  placeholder="Venta, alquiler, tasación..."
                  className="h-10 border-white/20 bg-white/10 text-white placeholder:text-white/45"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-white/90">
                Mensaje
              </Label>
              <Textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Ubicación, operación y detalles útiles"
                className="border-white/20 bg-white/10 text-white placeholder:text-white/45"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-11 w-full rounded-md bg-stone-warm text-forest-deep hover:bg-stone-warm/90 sm:w-auto"
            >
              Enviar por WhatsApp
            </Button>

            <p
              id="form-status"
              role="status"
              aria-live="polite"
              className={`min-h-5 text-sm ${
                state === "error"
                  ? "text-red-200"
                  : state === "success"
                    ? "text-stone-warm"
                    : "text-white/60"
              }`}
            >
              {message || "Demo local: el envío abre WhatsApp con tu mensaje."}
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
