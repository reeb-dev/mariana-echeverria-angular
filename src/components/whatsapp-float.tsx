import { CONTACT } from "@/data/properties";

export function WhatsAppFloat() {
  return (
    <a
      href={CONTACT.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-4 bottom-4 z-50 inline-flex items-center gap-2 rounded-full bg-[#1f6b4a] px-4 py-3 text-sm font-medium text-white shadow-lg shadow-forest-deep/30 transition hover:bg-[#185a3e] md:right-6 md:bottom-6"
      aria-label="Escribir por WhatsApp"
    >
      <span
        aria-hidden
        className="inline-flex h-2 w-2 rounded-full bg-stone-warm"
      />
      WhatsApp
    </a>
  );
}
