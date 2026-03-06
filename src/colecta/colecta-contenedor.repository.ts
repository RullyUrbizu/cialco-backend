import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ColectaContenedor } from 'src/modelo/colecta-contenedor';
import { Termo } from 'src/modelo/termo';
import { Canastillo } from 'src/modelo/canastillo';

@Injectable()
export class ColectaContenedorRepository {
  constructor(
    @InjectModel(ColectaContenedor)
    private readonly colectaContenedorModel: typeof ColectaContenedor,
  ) { }

  async create(
    contenedor: ColectaContenedor,
    transaction?: any,
  ): Promise<ColectaContenedor> {
    return this.colectaContenedorModel.create(contenedor, { transaction });
  }

  async findByColectaId(
    colectaId: string,
    transaction?: any,
  ): Promise<ColectaContenedor[]> {
    return this.colectaContenedorModel.findAll({
      where: { colectaId },
      include: [{ model: Termo }, { model: Canastillo }],
      transaction,
    });
  }

  async findById(
    id: string,
    transaction?: any,
  ): Promise<ColectaContenedor | null> {
    return this.colectaContenedorModel.findByPk(id, {
      include: [{ model: Termo }, { model: Canastillo }],
      transaction,
    });
  }

  async deleteByColectaId(colectaId: string): Promise<number> {
    return this.colectaContenedorModel.destroy({
      where: { colectaId },
    });
  }

  async delete(id: string, transaction?: any): Promise<number> {
    return this.colectaContenedorModel.destroy({
      where: { id },
      transaction,
    });
  }

  async update(
    id: string,
    updates: Partial<ColectaContenedor>,
    transaction?: any,
  ): Promise<ColectaContenedor | null> {
    const contenedor = await this.colectaContenedorModel.findByPk(id, {
      transaction,
    });
    if (!contenedor) return null;
    return contenedor.update(updates, { transaction });
  }
}
