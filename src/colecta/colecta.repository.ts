import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { and } from 'sequelize';
import { Canastillo } from 'src/modelo/canastillo';
import { Cliente } from 'src/modelo/cliente';
import { Colecta } from 'src/modelo/colecta';
import { Inventario } from 'src/modelo/inventario';
import { Termo } from 'src/modelo/termo';
import { Toro } from 'src/modelo/toro';

@Injectable()
export class ColectaRepository {
  constructor(
    @InjectModel(Colecta)
    private readonly colectaModel: typeof Colecta,
  ) { }

  async create(colecta: Colecta): Promise<Colecta> {
    return this.colectaModel.create(colecta);
  }

  async findAll(): Promise<Colecta[]> {
    return this.colectaModel.findAll({
      include: [
        { model: Toro },
        { model: Cliente },
        { model: Termo },
        { model: Canastillo }
      ],
      raw: true,
      nest: true,
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
        { model: Termo },
      ],
      raw: true,
      nest: true,
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
        { model: Termo },
        { model: Canastillo },
      ],
      raw: true,
      nest: true,
    });
  }


  async findById(id: string): Promise<Colecta | null> {
    return this.colectaModel.findByPk(id, {
      include: [
        { model: Toro },
        { model: Cliente },
        { model: Termo },
        { model: Canastillo },
        { model: Inventario }
      ],
    });
  }

  async update(id: string, updates: Partial<Colecta>): Promise<Colecta | null> {
    const colecta = await this.colectaModel.findByPk(id);
    if (!colecta) return null;
    return colecta.update(updates);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.colectaModel.destroy({ where: { id } });
    return deleted > 0;
  }
}
