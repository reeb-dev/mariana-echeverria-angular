import { DOCUMENT_TEMPLATES, renderTemplate } from './document-templates';

describe('renderTemplate', () => {
  it('reemplaza los marcadores con los valores', () => {
    expect(renderTemplate('Hola {{nombre}}', { nombre: 'Ana' })).toBe('Hola Ana');
  });

  it('deja marcado lo que falta para completar', () => {
    expect(renderTemplate('DNI {{dni_propietario}}', {})).toBe('DNI [dni propietario]');
  });

  it('muestra las fechas como día/mes/año', () => {
    expect(renderTemplate('A {{fecha}}', { fecha: '2026-10-14' })).toBe('A 14/10/2026');
  });

  it('todos los modelos usan solo marcadores que tienen su campo en el formulario', () => {
    for (const t of DOCUMENT_TEMPLATES) {
      const keys = new Set(t.fields.map((f) => f.key));
      const used = [...t.body.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]);
      for (const key of used) {
        expect(keys.has(key)).withContext(`${t.id}: {{${key}}}`).toBeTrue();
      }
    }
  });
});
