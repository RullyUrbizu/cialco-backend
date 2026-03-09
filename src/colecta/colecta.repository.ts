import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Cliente } from 'src/modelo/cliente';
import { Colecta } from 'src/modelo/colecta';
import { Inventario } from 'src/modelo/inventario';
import { Toro } from 'src/modelo/toro';
import { ColectaContenedor } from 'src/modelo/colecta-contenedor';
import { Termo } from 'src/modelo/termo';
import { Canastillo } from 'src/modelo/canastillo';

@Injectable()
export class ColectaRepository {
  constructor(
    @InjectModel(Colecta)
    private readonly colectaModel: typeof Colecta,
  ) { }

  async create(colecta: Colecta, transaction?: any): Promise<Colecta> {
    return this.colectaModel.create(colecta, { transaction });
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
            razon_social: razonSocial,
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
