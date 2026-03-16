import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Cliente } from 'src/modelo/cliente';
import { Colecta } from 'src/modelo/colecta';
import { Inventario } from 'src/modelo/inventario';
import { Toro } from 'src/modelo/toro';
import { ColectaContenedor } from 'src/modelo/colecta-contenedor';
import { Termo } from 'src/modelo/termo';
import { Canastillo } from 'src/modelo/canastillo';
import { Op, WhereOptions } from 'sequelize';

@Injectable()
export class ColectaRepository {
  constructor(
    @InjectModel(Colecta)
    private readonly colectaModel: typeof Colecta,
  ) { }

  async create(colecta: Colecta, transaction?: any): Promise<Colecta> {
    return this.colectaModel.create(colecta, { transaction });
  }

  async findAllPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ rows: Colecta[]; count: number }> {
    const offset = (page - 1) * limit;
    
    const where: WhereOptions = {};
    const toroWhere: WhereOptions = {};
    const clienteWhere: WhereOptions = {};

    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      // La búsqueda se aplicará a nivel de Toro, Cliente o Colecta
      // Para simplificar y optimizar, usamos JOINS y filtros en las tablas relacionadas
      where[Op.or as any] = [
        { '$toro.nombre$': { [Op.iLike]: searchLower } },
        { '$cliente.razon_social$': { [Op.iLike]: searchLower } },
      ];
    }

    return this.colectaModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['fecha', 'DESC']],
      subQuery: false, // Evita la subquery anidada que rompe los WHERE sobre columnas de tablas relacionadas
      attributes: ['id', 'fecha', 'cantidad', 'color'],
      include: [
        { 
          model: Toro, 
          attributes: ['id', 'nombre', 'raza'],
          required: false
        },
        { 
          model: Cliente, 
          attributes: ['id', 'razonSocial'],
          required: false 
        },
        {
          model: ColectaContenedor,
          as: 'contenedores',
          attributes: ['id', 'cantidad', 'stockActual'],
          include: [
            { model: Termo, attributes: ['id', 'codigo'] },
            { model: Canastillo, attributes: ['id', 'codigo'] }
          ],
        },
        { 
          model: Inventario,
          attributes: ['id', 'cantidadInicial', 'stockActual']
        },
      ],
      distinct: true,
    });
  }

  async findAll(): Promise<Colecta[]> {
    return this.colectaModel.findAll({
      include: [
        { model: Toro },
        { model: Cliente },
        {
          model: ColectaContenedor,
          as: 'contenedores',
          include: [{ model: Termo }, { model: Canastillo }],
        },
        { model: Inventario },
      ],
      raw: false,
    });
  }

  async findAllWithCliente(razonSocial: string): Promise<Colecta[]> {
    return this.colectaModel.findAll({
      include: [
        { model: Toro },
        {
          model: Cliente,
          where: {
            razonSocial: razonSocial,
          },
          required: true,
        },
        {
          model: ColectaContenedor,
          as: 'contenedores',
          include: [{ model: Termo }, { model: Canastillo }],
        },
      ],
      raw: false,
    });
  }

  async findAllWithToroNombre(nombre: string): Promise<Colecta[]> {
    return this.colectaModel.findAll({
      include: [
        {
          model: Toro,
          where: {
            nombre: nombre,
          },
          required: true,
        },
        { model: Cliente },
        {
          model: ColectaContenedor,
          as: 'contenedores',
          include: [{ model: Termo }, { model: Canastillo }],
        },
      ],
      raw: false,
    });
  }

  async findById(id: string, transaction?: any): Promise<Colecta | null> {
    return this.colectaModel.findByPk(id, {
      include: [
        { model: Toro },
        { model: Cliente },
        {
          model: ColectaContenedor,
          as: 'contenedores',
          include: [{ model: Termo }, { model: Canastillo }],
        },
        { model: Inventario },
      ],
      transaction,
    });
  }

  async update(
    id: string,
    updates: Partial<Colecta>,
    transaction?: any,
  ): Promise<Colecta | null> {
    const colecta = await this.colectaModel.findByPk(id, { transaction });
    if (!colecta) return null;
    return colecta.update(updates, { transaction });
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.colectaModel.destroy({ where: { id } });
    return deleted > 0;
  }
}
