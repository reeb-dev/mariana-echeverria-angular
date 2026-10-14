import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { MAX_FEATURED, PropertyStore, slugify } from './property-store';
import { UsersStore } from './users-store';

describe('slugify', () => {
  it('saca tildes, símbolos y espacios', () => {
    expect(slugify('Casa en venta – Mitre 2000')).toBe('casa-en-venta-mitre-2000');
    expect(slugify('  ¡Ñandú & Sierra!  ')).toBe('nandu-sierra');
  });
});

describe('PropertyStore', () => {
  let store: PropertyStore;
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    TestBed.inject(UsersStore).reset();
    auth = TestBed.inject(AuthService);
    store = TestBed.inject(PropertyStore);
  });

  const loginTitular = () => auth.login('mariana@demo.local', 'titular2026');
  const loginAgente = () => auth.login('agente@demo.local', 'agente2026');

  it('sin ingresar no se puede crear ni cambiar nada', () => {
    expect(store.setStatus('1', 'pausada')).toBeFalse();
    expect(store.remove('1')).toBeFalse();
    expect(store.toggleFeatured('2')).toBeFalse();
  });

  it('el público solo ve las publicadas, y las destacadas salen ordenadas', async () => {
    await loginTitular();
    expect(store.published().length).toBe(8);
    store.setStatus('1', 'pausada');
    expect(store.published().length).toBe(7);
    expect(store.featured().map((p) => p.id)).toEqual(['5', '3']);
  });

  it('el titular no puede pasar de seis destacadas', async () => {
    await loginTitular();
    const candidates = store.all().filter((p) => !p.featured).map((p) => p.id);
    const toAdd = MAX_FEATURED - store.featuredAll().length;
    for (const id of candidates.slice(0, toAdd)) {
      expect(store.toggleFeatured(id)).withContext(id).toBeTrue();
    }
    expect(store.featuredAll().length).toBe(MAX_FEATURED);
    expect(store.toggleFeatured(candidates[toAdd])).toBeFalse();
  });

  it('duplicar crea una copia pausada, sin destacar y con otro enlace', async () => {
    await loginTitular();
    const id = store.duplicate('1');
    expect(id).not.toBeNull();
    const copy = store.getById(id!)!;
    expect(copy.status).toBe('pausada');
    expect(copy.featured).toBeFalse();
    expect(copy.slug).not.toBe(store.getById('1')!.slug);
  });

  it('el agente solo cambia las propiedades que tiene a cargo', async () => {
    await loginAgente();
    expect(store.setStatus('1', 'pausada')).toBeFalse(); // de otra persona
    expect(store.setStatus('2', 'pausada')).toBeTrue(); // asignada al agente
    expect(store.remove('2')).toBeFalse(); // nunca elimina
    expect(store.toggleFeatured('2')).toBeFalse(); // nunca destaca
  });

  it('el cambio en lote saltea lo que el usuario no puede editar', async () => {
    await loginAgente();
    const changed = store.bulkUpdate(['1', '2', '4'], { status: 'pausada' });
    expect(changed).toBe(2); // solo la 2 y la 4 son del agente
    expect(store.getById('1')!.status ?? 'publicada').toBe('publicada');
  });

  it('eliminar y restaurar devuelve la propiedad', async () => {
    await loginTitular();
    const before = { ...store.getById('3')! };
    expect(store.remove('3')).toBeTrue();
    expect(store.getById('3')).toBeUndefined();
    expect(store.restore([before])).toBe(1);
    expect(store.getById('3')?.title).toBe(before.title);
  });

  it('restaurar tras un cambio en lote vuelve al estado anterior', async () => {
    await loginTitular();
    const snapshot = store.all().filter((p) => ['1', '2'].includes(p.id)).map((p) => ({ ...p }));
    store.bulkUpdate(['1', '2'], { status: 'vendida' });
    expect(store.getById('1')!.status).toBe('vendida');
    store.restore(snapshot);
    expect(store.getById('1')!.status ?? 'publicada').toBe('publicada');
  });

  it('el historial registra qué cambió', async () => {
    await loginTitular();
    const p = store.getById('1')!;
    store.upsert({ ...p, priceLabel: 'USD 50.000' });
    const entries = TestBed.inject((await import('./activity-log')).ActivityLog).entries();
    expect(entries[0].ref).toBe('1');
    expect(entries[0].action).toContain('precio: USD 54.000 → USD 50.000');
  });
});
