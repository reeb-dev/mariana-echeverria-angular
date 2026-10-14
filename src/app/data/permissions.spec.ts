import { roleCan } from './permissions';

describe('permisos por tipo de usuario', () => {
  it('el titular puede todo lo sensible', () => {
    for (const p of ['propiedades.eliminar', 'usuarios.gestionar', 'contratos.gestionar', 'expedientes.gestionar', 'datos.respaldo'] as const) {
      expect(roleCan('titular', p)).withContext(p).toBeTrue();
    }
  });

  it('el agente carga y atiende, pero no elimina, destaca ni ve contratos o expedientes', () => {
    expect(roleCan('agente', 'propiedades.crear')).toBeTrue();
    expect(roleCan('agente', 'propiedades.editar.propias')).toBeTrue();
    expect(roleCan('agente', 'contactos.gestionar')).toBeTrue();
    expect(roleCan('agente', 'propiedades.eliminar')).toBeFalse();
    expect(roleCan('agente', 'propiedades.destacar')).toBeFalse();
    expect(roleCan('agente', 'propiedades.editar.todas')).toBeFalse();
    expect(roleCan('agente', 'contratos.gestionar')).toBeFalse();
    expect(roleCan('agente', 'expedientes.gestionar')).toBeFalse();
    expect(roleCan('agente', 'usuarios.gestionar')).toBeFalse();
  });

  it('el usuario de consulta no puede modificar nada', () => {
    for (const p of ['propiedades.crear', 'propiedades.editar.propias', 'consultas.gestionar', 'contactos.gestionar', 'documentos.generar'] as const) {
      expect(roleCan('consulta', p)).withContext(p).toBeFalse();
    }
  });
});
