import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTACT } from '../data/properties';
import { SeoService } from '../utils/seo.service';

/**
 * Política de privacidad. Es un borrador redactado para que la titular lo revise y ajuste:
 * no reemplaza el asesoramiento legal.
 */
@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-3xl px-5 pt-[8.5rem] pb-24 md:px-8 md:pt-[9.5rem]">
      <a routerLink="/" class="text-sm text-muted-foreground transition hover:text-forest">← Volver al sitio</a>
      <h1 class="section-title mt-6 text-3xl text-forest-deep md:text-4xl">Política de privacidad</h1>
      <p class="mt-3 text-sm text-muted-foreground">Última actualización: octubre de 2026 · Borrador para revisión</p>

      <div class="mt-8 space-y-8 text-base leading-relaxed">
        <section>
          <h2 class="font-display text-xl font-medium text-forest-deep">Quién es responsable de los datos</h2>
          <p class="mt-2">
            {{ contact.brand }} {{ contact.tagline }}, {{ contact.matricula }}. Domicilio: Las Heras 1465, Coronel Suárez.
            Contacto: {{ contact.email }} · {{ contact.phoneDisplay }}.
          </p>
        </section>

        <section>
          <h2 class="font-display text-xl font-medium text-forest-deep">Qué datos pedimos y para qué</h2>
          <ul class="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              <strong>Consultas por propiedades:</strong> nombre, teléfono, email y mensaje, para responderte y enviarte la
              información que pidas.
            </li>
            <li>
              <strong>Pedidos de tasación:</strong> tus datos de contacto y los del inmueble (dirección, tipo, superficie y
              motivo), para valuarlo y entregarte el resultado.
            </li>
          </ul>
          <p class="mt-2">No usamos tus datos para otra finalidad ni los cedemos a terceros, salvo obligación legal.</p>
        </section>

        <section>
          <h2 class="font-display text-xl font-medium text-forest-deep">Cuánto tiempo los conservamos</h2>
          <p class="mt-2">
            Mientras dure la gestión que pediste y el tiempo que exijan las normas aplicables a la actividad inmobiliaria y
            profesional. Después se eliminan o se anonimizan.
          </p>
        </section>

        <section>
          <h2 class="font-display text-xl font-medium text-forest-deep">Qué guarda el sitio en tu dispositivo</h2>
          <p class="mt-2">
            El sitio guarda en tu navegador las propiedades que marcás como favoritas, para que las encuentres la próxima vez.
            No usamos cookies de publicidad.
          </p>
        </section>

        <section>
          <h2 class="font-display text-xl font-medium text-forest-deep">Tus derechos</h2>
          <p class="mt-2">
            Podés pedir acceso, rectificación o supresión de tus datos escribiendo a {{ contact.email }}. El titular de los
            datos personales tiene la facultad de ejercer el derecho de acceso en forma gratuita a intervalos no inferiores a
            seis meses (Ley 25.326, art. 14).
          </p>
          <p class="mt-2">
            La Agencia de Acceso a la Información Pública, en su carácter de órgano de control de la Ley 25.326, tiene la
            atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos.
          </p>
        </section>

        <section>
          <h2 class="font-display text-xl font-medium text-forest-deep">Cambios en esta política</h2>
          <p class="mt-2">Si cambia, publicaremos la versión nueva en esta página con su fecha.</p>
        </section>
      </div>
    </div>
  `,
})
export class PrivacyComponent {
  readonly contact = CONTACT;

  constructor() {
    inject(SeoService).set({
      title: 'Política de privacidad | Mariana Echeverría Bienes Raíces',
      description: 'Qué datos recolectamos, para qué los usamos y cómo ejercer tus derechos.',
    });
  }
}
