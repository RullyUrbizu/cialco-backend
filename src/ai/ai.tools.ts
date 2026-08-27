import { AiDataService } from './ai.data.service';
import { obtenerManual } from './manual-de-uso';

const STRING_PARAM = { type: 'STRING' };

export const AI_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'listar_toros',
        description:
          'Lista los toros registrados. Opcional: filtrar por nombre (parcial) o por raza (AA, AAC, AAN, PH, SH, LMAn).',
        parameters: {
          type: 'OBJECT',
          properties: {
            nombre: STRING_PARAM,
            raza: STRING_PARAM,
          },
        },
      },
      {
        name: 'stock_por_toro',
        description:
          'Devuelve el stock actual de pajuelas por toro (suma del stock de todas sus colectas). Opcional: filtrar por nombre de toro.',
        parameters: {
          type: 'OBJECT',
          properties: {
            toroNombre: STRING_PARAM,
          },
        },
      },
      {
        name: 'listar_colectas',
        description:
          'Lista colectas (lotes de pajuelas) con su fecha, toro, cliente, vigor/motilidad, color y stock actual. Filtros opcionales por toro, cliente, rango de fechas (YYYY-MM-DD).',
        parameters: {
          type: 'OBJECT',
          properties: {
            toroNombre: STRING_PARAM,
            clienteRazonSocial: STRING_PARAM,
            desde: STRING_PARAM,
            hasta: STRING_PARAM,
            limit: { type: 'INTEGER' },
          },
        },
      },
      {
        name: 'ocupacion_termos',
        description:
          'Devuelve la ocupación actual de cada termo: código, estado activo, pajuelas ocupadas, capacidad total, disponibles y porcentaje de ocupación.',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'listar_movimientos',
        description:
          'Lista movimientos de inventario (ingresos y salidas de pajuelas). Filtros opcionales por tipo (ingreso|salida), cliente, remito, toro y rango de fechas (YYYY-MM-DD).',
        parameters: {
          type: 'OBJECT',
          properties: {
            tipo: STRING_PARAM,
            clienteRazonSocial: STRING_PARAM,
            remito: STRING_PARAM,
            toroNombre: STRING_PARAM,
            desde: STRING_PARAM,
            hasta: STRING_PARAM,
            limit: { type: 'INTEGER' },
          },
        },
      },
      {
        name: 'listar_clientes',
        description:
          'Lista los clientes registrados con su razón social y CUIT. Opcional: buscar por razón social o CUIT.',
        parameters: {
          type: 'OBJECT',
          properties: {
            busqueda: STRING_PARAM,
          },
        },
      },
      {
        name: 'resumen_global',
        description:
          'Devuelve un resumen general: cantidad de toros, clientes, colectas, movimientos y el stock total de pajuelas del sistema.',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'manual_de_uso',
        description:
          'Devuelve las secciones del manual de uso de la aplicación (cómo agregar un toro, una colecta, un cliente, registrar movimientos, etc.). Opcional: sección o palabra clave a buscar.',
        parameters: {
          type: 'OBJECT',
          properties: {
            seccion: STRING_PARAM,
          },
        },
      },
      {
        name: 'crear_toro',
        description:
          'Crea un nuevo toro en el sistema. Requiere nombre y raza (AA, AAC, AAN, PH, SH, LMAn).',
        parameters: {
          type: 'OBJECT',
          properties: {
            nombre: STRING_PARAM,
            raza: STRING_PARAM,
          },
        },
      },
      {
        name: 'crear_cliente',
        description:
          'Crea un nuevo cliente en el sistema. Requiere razón social. Opcional: CUIT (formato XX-XXXXXXXX-X).',
        parameters: {
          type: 'OBJECT',
          properties: {
            razonSocial: STRING_PARAM,
            cuit: STRING_PARAM,
          },
        },
      },
      {
        name: 'crear_termo',
        description:
          'Crea un nuevo termo en el sistema. Requiere código único.',
        parameters: {
          type: 'OBJECT',
          properties: {
            codigo: STRING_PARAM,
          },
        },
      },
    ],
  },
];

export type ToolName =
  | 'listar_toros'
  | 'stock_por_toro'
  | 'listar_colectas'
  | 'ocupacion_termos'
  | 'listar_movimientos'
  | 'listar_clientes'
  | 'resumen_global'
  | 'manual_de_uso'
  | 'crear_toro'
  | 'crear_cliente'
  | 'crear_termo';

export interface HerramientaArgs {
  nombre?: string;
  raza?: string;
  toroNombre?: string;
  clienteRazonSocial?: string;
  desde?: string;
  hasta?: string;
  remito?: string;
  tipo?: string;
  busqueda?: string;
  seccion?: string;
  limit?: number;
  razonSocial?: string;
  cuit?: string;
  codigo?: string;
}

interface ToolMeta {
  permission: 'read' | 'write';
}

export const TOOL_META: Record<ToolName, ToolMeta> = {
  listar_toros: { permission: 'read' },
  stock_por_toro: { permission: 'read' },
  listar_colectas: { permission: 'read' },
  ocupacion_termos: { permission: 'read' },
  listar_movimientos: { permission: 'read' },
  listar_clientes: { permission: 'read' },
  resumen_global: { permission: 'read' },
  manual_de_uso: { permission: 'read' },
  crear_toro: { permission: 'write' },
  crear_cliente: { permission: 'write' },
  crear_termo: { permission: 'write' },
};

export async function ejecutarHerramienta(
  name: string,
  args: HerramientaArgs,
  dataService: AiDataService,
  anonymize: boolean,
): Promise<unknown> {
  switch (name as ToolName) {
    case 'listar_toros':
      return anonimizar(
        await dataService.listarToros(args?.nombre, args?.raza),
        anonymize,
      );
    case 'stock_por_toro':
      return anonimizar(
        await dataService.stockPorToro(args?.toroNombre),
        anonymize,
      );
    case 'listar_colectas':
      return anonimizar(
        await dataService.listarColectas(
          args?.toroNombre,
          args?.clienteRazonSocial,
          args?.desde,
          args?.hasta,
          args?.limit,
        ),
        anonymize,
      );
    case 'ocupacion_termos':
      return await dataService.ocupacionTermos();
    case 'listar_movimientos':
      return anonimizar(
        await dataService.listarMovimientos(
          args?.tipo,
          args?.clienteRazonSocial,
          args?.desde,
          args?.hasta,
          args?.remito,
          args?.limit,
        ),
        anonymize,
      );
    case 'listar_clientes':
      return anonimizar(
        await dataService.listarClientes(args?.busqueda),
        anonymize,
      );
    case 'resumen_global':
      return await dataService.resumenGlobal();
    case 'manual_de_uso':
      return obtenerManual(args?.seccion);
    case 'crear_toro':
      return await dataService.crearToro(args.nombre!, args.raza!);
    case 'crear_cliente':
      return await dataService.crearCliente(args.razonSocial!, args.cuit);
    case 'crear_termo':
      return await dataService.crearTermo(args.codigo!);
    default:
      return { error: `Herramienta desconocida: ${name}` };
  }
}

export function anonimizar(valor: unknown, habilitado: boolean): unknown {
  if (!habilitado) return valor;
  if (Array.isArray(valor)) {
    return valor.map((v) => anonimizar(v, habilitado));
  }
  if (valor && typeof valor === 'object') {
    const objeto = valor as Record<string, unknown>;
    const obj: Record<string, unknown> = {};
    for (const key of Object.keys(objeto)) {
      const item = objeto[key];
      if (key === 'cuit') {
        continue;
      }
      if (key === 'razonSocial') {
        const id = objeto.id as string | undefined;
        obj[key] = id ? `Cliente #${id}` : 'Cliente (sin identificar)';
        continue;
      }
      if (item && typeof item === 'object') {
        obj[key] = anonimizar(item, habilitado);
      } else {
        obj[key] = item;
      }
    }
    return obj;
  }
  return valor;
}
