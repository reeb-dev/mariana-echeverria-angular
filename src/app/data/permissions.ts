/** Tipos de usuario del panel. */
export type Role = 'titular' | 'agente' | 'consulta';

export const ROLE_LABELS: Record<Role, string> = {
  titular: 'Titular',
  agente: 'Agente',
  consulta: 'Solo consulta',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  titular: 'Control total: propiedades, clientes, contratos, expedientes, documentos, usuarios y copias de seguridad.',
  agente: 'Carga y edita sus propias propiedades, atiende consultas y clientes, agenda visitas y arma documentos. No ve contratos ni expedientes.',
  consulta: 'Solo ve propiedades y consultas. No puede modificar nada.',
};

export type Permission =
  | 'propiedades.crear'
  | 'propiedades.editar.propias'
  | 'propiedades.editar.todas'
  | 'propiedades.eliminar'
  | 'propiedades.destacar'
  | 'consultas.gestionar'
  | 'consultas.asignar'
  | 'usuarios.gestionar'
  | 'contactos.gestionar'
  | 'contratos.gestionar'
  | 'expedientes.gestionar'
  | 'documentos.generar'
  | 'datos.respaldo';

const MATRIX: Record<Role, readonly Permission[]> = {
  titular: [
    'propiedades.crear',
    'propiedades.editar.propias',
    'propiedades.editar.todas',
    'propiedades.eliminar',
    'propiedades.destacar',
    'consultas.gestionar',
    'consultas.asignar',
    'usuarios.gestionar',
    'contactos.gestionar',
    'contratos.gestionar',
    'expedientes.gestionar',
    'documentos.generar',
    'datos.respaldo',
  ],
  agente: [
    'propiedades.crear',
    'propiedades.editar.propias',
    'consultas.gestionar',
    'contactos.gestionar',
    'documentos.generar',
  ],
  consulta: [],
};

export function roleCan(role: Role, permission: Permission): boolean {
  return MATRIX[role].includes(permission);
}
