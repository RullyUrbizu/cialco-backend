import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions, fn, col } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { Toro } from 'src/modelo/toro';
import { Colecta } from 'src/modelo/colecta';
import { Inventario } from 'src/modelo/inventario';
import { ColectaContenedor } from 'src/modelo/colecta-contenedor';
import { Termo } from 'src/modelo/termo';
import { Canastillo } from 'src/modelo/canastillo';
import { Cliente } from 'src/modelo/cliente';
import { Movimiento } from 'src/modelo/movimiento';

const CODIGOS_GRAN_CAPACIDAD = [
  'CH I',
  'CH II',
  'CH III',
  'CH IV',
  'ChH II',
  '47/11',
];
const CAPACIDAD_GRAN = 3990;
const CAPACIDAD_CHICA = 1140;

@Injectable()
export class AiDataService {
  constructor(
    @InjectModel(Toro) private readonly toroModel: typeof Toro,
    @InjectModel(Colecta) private readonly colectaModel: typeof Colecta,
    @InjectModel(Inventario)
    private readonly inventarioModel: typeof Inventario,
    @InjectModel(ColectaContenedor)
    private readonly contenedorModel: typeof ColectaContenedor,
    @InjectModel(Termo) private readonly termoModel: typeof Termo,
    @InjectModel(Cliente) private readonly clienteModel: typeof Cliente,
    @InjectModel(Movimiento)
    private readonly movimientoModel: typeof Movimiento,
  ) {}

  async listarToros(nombre?: string, raza?: string) {
    const where: WhereOptions = {};
    if (nombre) {
      where.nombre = { [Op.iLike]: `%${nombre}%` };
    }
    if (raza) {
      where.raza = raza;
    }
    const toros = await this.toroModel.findAll({
      where,
      order: [['nombre', 'ASC']],
    });
    return toros.map((t) => ({ id: t.id, nombre: t.nombre, raza: t.raza }));
  }

  async stockPorToro(toroNombre?: string) {
    const where: WhereOptions = {};
    if (toroNombre) {
      where['$toro.nombre$'] = { [Op.iLike]: `%${toroNombre}%` };
    }
    const colectas = await this.colectaModel.findAll({
      where,
      include: [
        {
          model: Toro,
          attributes: ['id', 'nombre', 'raza'],
          required: true,
        },
        {
          model: Inventario,
          attributes: [
            'id',
            'cantidadInicial',
            'ingresosTotal',
            'salidasTotal',
            'stockActual',
          ],
        },
      ],
      subQuery: false,
    });

    const porToro = new Map<
      string,
      {
        id: string;
        nombre: string;
        raza: string;
        stockActual: number;
        cantidadInicial: number;
      }
    >();
    for (const c of colectas) {
      const toro = c.toro;
      if (!toro) continue;
      const actual = porToro.get(toro.id) || {
        id: toro.id,
        nombre: toro.nombre,
        raza: toro.raza,
        stockActual: 0,
        cantidadInicial: 0,
      };
      actual.stockActual += c.inventario?.stockActual ?? 0;
      actual.cantidadInicial += c.inventario?.cantidadInicial ?? 0;
      porToro.set(toro.id, actual);
    }

    const resultado = Array.from(porToro.values()).sort(
      (a, b) => b.stockActual - a.stockActual,
    );
    if (toroNombre && colectas.length > 0) {
      const detalle = colectas.map((c) => ({
        fecha: this.formatearFecha(c.fecha),
        cliente: c.cliente
          ? { id: c.cliente.id, razonSocial: c.cliente.razonSocial }
          : null,
        vigorMot: c.vigorMot,
        color: c.color,
        stockActual: c.inventario?.stockActual ?? 0,
      }));
      return { toros: resultado, detalleColectas: detalle };
    }
    return { toros: resultado };
  }

  async listarColectas(
    toroNombre?: string,
    clienteRazonSocial?: string,
    desde?: string,
    hasta?: string,
    limit = 20,
  ) {
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const where: WhereOptions = {};
    if (toroNombre) where['$toro.nombre$'] = { [Op.iLike]: `%${toroNombre}%` };
    if (clienteRazonSocial) {
      where['$cliente.razon_social$'] = {
        [Op.iLike]: `%${clienteRazonSocial}%`,
      };
    }
    if (desde || hasta) {
      where.fecha = {
        ...(desde ? { [Op.gte]: desde } : {}),
        ...(hasta ? { [Op.lte]: hasta } : {}),
      };
    }

    const colectas = await this.colectaModel.findAll({
      where,
      limit: safeLimit,
      order: [['fecha', 'DESC']],
      subQuery: false,
      include: [
        { model: Toro, attributes: ['id', 'nombre', 'raza'], required: false },
        {
          model: Cliente,
          attributes: ['id', 'razonSocial', 'cuit'],
          required: false,
        },
        { model: Inventario, attributes: ['id', 'stockActual'] },
        {
          model: ColectaContenedor,
          as: 'contenedores',
          attributes: ['id', 'cantidad', 'stockActual'],
          include: [
            { model: Termo, attributes: ['id', 'codigo'] },
            { model: Canastillo, attributes: ['id', 'codigo'] },
          ],
        },
      ],
    });

    return colectas.map((c) => ({
      id: c.id,
      fecha: this.formatearFecha(c.fecha),
      toro: c.toro ? { nombre: c.toro.nombre, raza: c.toro.raza } : null,
      cliente: c.cliente
        ? {
            id: c.cliente.id,
            razonSocial: c.cliente.razonSocial,
            cuit: c.cliente.cuit,
          }
        : null,
      vigorMot: c.vigorMot,
      color: c.color,
      stockActual: c.inventario?.stockActual ?? 0,
      contenedores: (c.contenedores || []).map((cont) => ({
        termo: cont.termo?.codigo ?? null,
        canastillo: cont.canastillo?.codigo ?? null,
        cantidad: cont.cantidad,
        stockActual: cont.stockActual,
      })),
    }));
  }

  async ocupacionTermos() {
    const termos = await this.termoModel.findAll({
      order: [['codigo', 'ASC']],
    });
    const contenedores = await this.contenedorModel.findAll({
      attributes: ['stockActual'],
      include: [{ model: Termo, attributes: ['id', 'codigo'] }],
    });

    const ocupadoPorCodigo = new Map<string, number>();
    for (const cont of contenedores) {
      const codigo = cont.termo?.codigo;
      if (!codigo) continue;
      ocupadoPorCodigo.set(
        codigo,
        (ocupadoPorCodigo.get(codigo) || 0) + (cont.stockActual ?? 0),
      );
    }

    const getCapacidad = (codigo: string): number => {
      const upper = codigo.toUpperCase();
      return CODIGOS_GRAN_CAPACIDAD.includes(upper)
        ? CAPACIDAD_GRAN
        : CAPACIDAD_CHICA;
    };

    return termos.map((t) => {
      const ocupado = ocupadoPorCodigo.get(t.codigo) || 0;
      const capacidadTotal = getCapacidad(t.codigo);
      const porcentaje = Math.round((ocupado / capacidadTotal) * 100);
      return {
        codigo: t.codigo,
        activo: t.activo,
        ocupado,
        capacidadTotal,
        disponible: capacidadTotal - ocupado,
        porcentaje,
      };
    });
  }

  async listarMovimientos(
    tipo?: string,
    clienteRazonSocial?: string,
    desde?: string,
    hasta?: string,
    remito?: string,
    limit = 30,
  ) {
    const safeLimit = Math.min(Math.max(Number(limit) || 30, 1), 100);
    const where: WhereOptions = {};
    if (tipo && ['ingreso', 'salida'].includes(tipo)) where.tipo = tipo;
    if (clienteRazonSocial) {
      where['$cliente.razon_social$'] = {
        [Op.iLike]: `%${clienteRazonSocial}%`,
      };
    }
    if (remito) {
      where.remito = { [Op.iLike]: `%${remito}%` };
    }
    if (desde || hasta) {
      where.fecha = {
        ...(desde ? { [Op.gte]: desde } : {}),
        ...(hasta ? { [Op.lte]: hasta } : {}),
      };
    }

    const movimientos = await this.movimientoModel.findAll({
      where,
      limit: safeLimit,
      order: [['fecha', 'DESC']],
      subQuery: false,
      include: [
        { model: Cliente, attributes: ['id', 'razonSocial'], required: false },
        {
          model: Inventario,
          attributes: ['id'],
          include: [
            {
              model: Colecta,
              attributes: ['id', 'fecha', 'vigorMot'],
              include: [
                { model: Toro, attributes: ['id', 'nombre'] },
                {
                  model: Cliente,
                  attributes: ['id', 'razonSocial'],
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });

    return movimientos.map((m) => ({
      id: m.id,
      fecha: this.formatearFecha(m.fecha),
      tipo: m.tipo,
      cantidad: m.cantidad,
      remito: m.remito,
      notas: m.notas,
      cliente: m.cliente
        ? { id: m.cliente.id, razonSocial: m.cliente.razonSocial }
        : m.inventario?.colecta?.cliente
          ? {
              id: m.inventario.colecta.cliente.id,
              razonSocial: m.inventario.colecta.cliente.razonSocial,
            }
          : null,
      toroNombre: m.inventario?.colecta?.toro?.nombre ?? null,
      colectaFecha: m.inventario?.colecta?.fecha
        ? this.formatearFecha(m.inventario.colecta.fecha)
        : null,
    }));
  }

  async listarClientes(busqueda?: string) {
    const where: WhereOptions = {};
    if (busqueda) {
      where[Op.or as unknown as string] = [
        { razonSocial: { [Op.iLike]: `%${busqueda}%` } },
        { cuit: { [Op.iLike]: `%${busqueda}%` } },
      ];
    }
    const clientes = await this.clienteModel.findAll({
      where,
      order: [['razonSocial', 'ASC']],
    });
    return clientes.map((c) => ({
      id: c.id,
      razonSocial: c.razonSocial,
      cuit: c.cuit,
    }));
  }

  async razonSocialPorIds(ids: string[]): Promise<Map<string, string>> {
    if (ids.length === 0) return new Map();
    const clientes = await this.clienteModel.findAll({
      where: { id: { [Op.in]: ids } },
      attributes: ['id', 'razonSocial'],
    });
    return new Map(clientes.map((c) => [c.id, c.razonSocial]));
  }

  async resumenGlobal() {
    const [
      totalToros,
      totalClientes,
      totalColectas,
      stockResult,
      totalMovimientos,
    ] = await Promise.all([
      this.toroModel.count(),
      this.clienteModel.count(),
      this.colectaModel.count(),
      this.inventarioModel.findOne({
        attributes: [
          [fn('COALESCE', fn('SUM', col('stockActual')), 0), 'total'],
        ],
        plain: true,
      }),
      this.movimientoModel.count(),
    ]);
    const totalStock = Number(stockResult?.get('total') ?? 0);
    return {
      totalToros,
      totalClientes,
      totalColectas,
      totalStockPajuelas: totalStock,
      totalMovimientos,
    };
  }

  async crearToro(nombre: string, raza: string) {
    try {
      const toro = await this.toroModel.create({
        id: uuidv4(),
        nombre,
        raza,
      } as Partial<Toro> as Toro);
      return { id: toro.id, nombre: toro.nombre, raza: toro.raza };
    } catch (error) {
      if (error.parent && error.parent.code === '23505') {
        throw new ConflictException('Ya existe un toro con ese nombre');
      }
      throw error;
    }
  }

  async crearCliente(razonSocial: string, cuit?: string) {
    try {
      const cliente = await this.clienteModel.create({
        id: uuidv4(),
        razonSocial,
        ...(cuit ? { cuit } : {}),
      } as Partial<Cliente> as Cliente);
      return {
        id: cliente.id,
        razonSocial: cliente.razonSocial,
        cuit: cliente.cuit,
      };
    } catch (error) {
      if (error.parent && error.parent.code === '23505') {
        throw new ConflictException('El CUIT ya existe en la base de datos');
      }
      throw error;
    }
  }

  async crearTermo(codigo: string) {
    try {
      const termo = await this.termoModel.create({
        id: uuidv4(),
        codigo,
      } as Partial<Termo> as Termo);
      return { id: termo.id, codigo: termo.codigo, activo: termo.activo };
    } catch (error) {
      if (error.parent && error.parent.code === '23505') {
        throw new ConflictException('Ya existe un termo con ese código');
      }
      throw error;
    }
  }

  private formatearFecha(
    fecha: Date | string | null | undefined,
  ): string | null {
    if (!fecha) return null;
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return String(fecha);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()}`;
  }
}
